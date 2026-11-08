import {
  allPhotosCaptured,
  avatarCaptureReducer,
  capturedCount,
  initialAvatarCaptureState,
  type AvatarCaptureState,
  type CapturedPhoto,
} from '../avatarCaptureState';

const photo = (name: string): CapturedPhoto => ({ uri: `file:///${name}.jpg`, width: 1080, height: 1440 });

function capture(state: AvatarCaptureState, step: 'front' | 'back' | 'face') {
  const taken = avatarCaptureReducer(state, { type: 'photoTaken', step, photo: photo(step) });
  return avatarCaptureReducer(taken, { type: 'confirmStep', step });
}

describe('avatarCaptureReducer', () => {
  it('starts at the first step and walks front → back → face → review', () => {
    let state = avatarCaptureReducer(initialAvatarCaptureState, { type: 'start' });
    expect(state.stage).toEqual({ kind: 'capture', step: 'front' });
    state = capture(state, 'front');
    expect(state.stage).toEqual({ kind: 'capture', step: 'back' });
    state = capture(state, 'back');
    expect(state.stage).toEqual({ kind: 'capture', step: 'face' });
    state = capture(state, 'face');
    expect(state.stage).toEqual({ kind: 'review' });
    expect(allPhotosCaptured(state.photos)).toBe(true);
  });

  it('keeps photos when moving between steps and going back', () => {
    let state = capture(avatarCaptureReducer(initialAvatarCaptureState, { type: 'start' }), 'front');
    state = avatarCaptureReducer(state, { type: 'goToStep', step: 'face' });
    state = avatarCaptureReducer(state, { type: 'back' });
    state = avatarCaptureReducer(state, { type: 'back' });
    expect(state.stage).toEqual({ kind: 'capture', step: 'front' });
    expect(state.photos.front?.uri).toBe('file:///front.jpg');
  });

  it('after confirming an out-of-order step, jumps to the next missing one', () => {
    let state = avatarCaptureReducer(initialAvatarCaptureState, { type: 'goToStep', step: 'face' });
    state = capture(state, 'face');
    expect(state.stage).toEqual({ kind: 'capture', step: 'front' });
  });

  it('retake removes only that photo and returns to its step', () => {
    let state = ['front', 'back', 'face'].reduce(
      (acc, step) => capture(acc, step as 'front' | 'back' | 'face'),
      avatarCaptureReducer(initialAvatarCaptureState, { type: 'start' }),
    );
    state = avatarCaptureReducer(state, { type: 'retake', step: 'back' });
    expect(state.stage).toEqual({ kind: 'capture', step: 'back' });
    expect(state.photos.back).toBeUndefined();
    expect(capturedCount(state.photos)).toBe(2);
  });

  it('refuses review / finish until all three photos exist', () => {
    const state = capture(avatarCaptureReducer(initialAvatarCaptureState, { type: 'start' }), 'front');
    expect(avatarCaptureReducer(state, { type: 'openReview' })).toBe(state);
    expect(avatarCaptureReducer(state, { type: 'finish' })).toBe(state);
  });

  it('does not confirm a step that has no photo', () => {
    const state = avatarCaptureReducer(initialAvatarCaptureState, { type: 'start' });
    expect(avatarCaptureReducer(state, { type: 'confirmStep', step: 'front' })).toBe(state);
  });
});

describe('avatarCaptureReducer — preprocessing stages', () => {
  function reviewed(): AvatarCaptureState {
    let state = avatarCaptureReducer(initialAvatarCaptureState, { type: 'start' });
    state = capture(state, 'front');
    state = capture(state, 'back');
    return capture(state, 'face');
  }

  function atResults(): AvatarCaptureState {
    const consent = avatarCaptureReducer(reviewed(), { type: 'requestCreate' });
    const processing = avatarCaptureReducer(consent, { type: 'consentAccepted' });
    return avatarCaptureReducer(processing, { type: 'processingFinished' });
  }

  it('review → consent → processing → results → complete', () => {
    let state = avatarCaptureReducer(reviewed(), { type: 'requestCreate' });
    expect(state.stage).toEqual({ kind: 'consent' });
    state = avatarCaptureReducer(state, { type: 'consentAccepted' });
    expect(state.stage).toEqual({ kind: 'processing' });
    state = avatarCaptureReducer(state, { type: 'processingFinished' });
    expect(state.stage).toEqual({ kind: 'results' });
    state = avatarCaptureReducer(state, { type: 'finish' });
    expect(state.stage).toEqual({ kind: 'complete' });
  });

  it('does not ask for consent before all photos exist', () => {
    const state = avatarCaptureReducer(initialAvatarCaptureState, { type: 'requestCreate' });
    expect(state.stage).toEqual({ kind: 'intro' });
  });

  it('cannot go back while processing, but can from consent and results', () => {
    const consent = avatarCaptureReducer(reviewed(), { type: 'requestCreate' });
    expect(avatarCaptureReducer(consent, { type: 'back' }).stage).toEqual({ kind: 'review' });
    const processing = avatarCaptureReducer(consent, { type: 'consentAccepted' });
    expect(avatarCaptureReducer(processing, { type: 'back' }).stage).toEqual({ kind: 'processing' });
    expect(avatarCaptureReducer(atResults(), { type: 'back' }).stage).toEqual({ kind: 'review' });
  });

  it('retry re-runs processing from results; retake from results keeps the other photos', () => {
    expect(avatarCaptureReducer(atResults(), { type: 'retryProcessing' }).stage).toEqual({ kind: 'processing' });
    const retake = avatarCaptureReducer(atResults(), { type: 'retake', step: 'back' });
    expect(retake.stage).toEqual({ kind: 'capture', step: 'back' });
    expect(capturedCount(retake.photos)).toBe(2);
  });

  it('ignores processingFinished outside processing', () => {
    const state = reviewed();
    expect(avatarCaptureReducer(state, { type: 'processingFinished' })).toBe(state);
  });
});
