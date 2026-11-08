/**
 * Pure state machine for the avatar capture flow:
 * intro → capture (front/back/face) → review → consent → processing → results → complete.
 * Photos live only in memory and are never cleared by moving between stages —
 * only an explicit retake removes one. Processing results live in the hook, not here.
 */
import { CAPTURE_STEP_ORDER, type CaptureStepId } from './avatarSteps';

export type CapturedPhoto = { uri: string; width: number; height: number };

export type CaptureStage =
  | { kind: 'intro' }
  | { kind: 'capture'; step: CaptureStepId }
  | { kind: 'review' }
  | { kind: 'consent' }
  | { kind: 'processing' }
  | { kind: 'results' }
  | { kind: 'complete' };

export type AvatarCaptureState = {
  stage: CaptureStage;
  photos: Partial<Record<CaptureStepId, CapturedPhoto>>;
};

export type AvatarCaptureAction =
  | { type: 'start' }
  | { type: 'goToStep'; step: CaptureStepId }
  | { type: 'photoTaken'; step: CaptureStepId; photo: CapturedPhoto }
  | { type: 'retake'; step: CaptureStepId }
  | { type: 'confirmStep'; step: CaptureStepId }
  | { type: 'openReview' }
  | { type: 'requestCreate' }
  | { type: 'consentAccepted' }
  | { type: 'retryProcessing' }
  | { type: 'processingFinished' }
  | { type: 'finish' }
  | { type: 'back' };

export const initialAvatarCaptureState: AvatarCaptureState = { stage: { kind: 'intro' }, photos: {} };

export function allPhotosCaptured(photos: AvatarCaptureState['photos']): boolean {
  return CAPTURE_STEP_ORDER.every((step) => photos[step] !== undefined);
}

/** The three photos as a complete record, or null while any is missing. */
export function completePhotos(photos: AvatarCaptureState['photos']): Record<CaptureStepId, CapturedPhoto> | null {
  const { front, back, face } = photos;
  return front && back && face ? { front, back, face } : null;
}

export function capturedCount(photos: AvatarCaptureState['photos']): number {
  return CAPTURE_STEP_ORDER.filter((step) => photos[step] !== undefined).length;
}

/** First step without a photo, searching forward from `after` and then wrapping. */
function nextMissingStep(photos: AvatarCaptureState['photos'], after?: CaptureStepId): CaptureStepId | null {
  const start = after ? CAPTURE_STEP_ORDER.indexOf(after) + 1 : 0;
  const ordered = [...CAPTURE_STEP_ORDER.slice(start), ...CAPTURE_STEP_ORDER.slice(0, start)];
  return ordered.find((step) => photos[step] === undefined) ?? null;
}

function stageAfter(photos: AvatarCaptureState['photos'], after?: CaptureStepId): CaptureStage {
  const missing = nextMissingStep(photos, after);
  return missing ? { kind: 'capture', step: missing } : { kind: 'review' };
}

export function avatarCaptureReducer(state: AvatarCaptureState, action: AvatarCaptureAction): AvatarCaptureState {
  switch (action.type) {
    case 'start':
      return { ...state, stage: stageAfter(state.photos) };
    case 'goToStep':
      return { ...state, stage: { kind: 'capture', step: action.step } };
    case 'photoTaken':
      return { stage: { kind: 'capture', step: action.step }, photos: { ...state.photos, [action.step]: action.photo } };
    case 'retake': {
      const photos = { ...state.photos };
      delete photos[action.step];
      return { photos, stage: { kind: 'capture', step: action.step } };
    }
    case 'confirmStep':
      return state.photos[action.step] ? { ...state, stage: stageAfter(state.photos, action.step) } : state;
    case 'openReview':
      return allPhotosCaptured(state.photos) ? { ...state, stage: { kind: 'review' } } : state;
    case 'requestCreate':
      return allPhotosCaptured(state.photos) ? { ...state, stage: { kind: 'consent' } } : state;
    case 'consentAccepted':
      return state.stage.kind === 'consent' ? { ...state, stage: { kind: 'processing' } } : state;
    case 'retryProcessing':
      return state.stage.kind === 'results' && allPhotosCaptured(state.photos)
        ? { ...state, stage: { kind: 'processing' } }
        : state;
    case 'processingFinished':
      return state.stage.kind === 'processing' ? { ...state, stage: { kind: 'results' } } : state;
    case 'finish':
      return allPhotosCaptured(state.photos) ? { ...state, stage: { kind: 'complete' } } : state;
    case 'back':
      return { ...state, stage: previousStage(state.stage) };
  }
}

function previousStage(stage: CaptureStage): CaptureStage {
  switch (stage.kind) {
    case 'intro':
      return stage;
    case 'capture': {
      const index = CAPTURE_STEP_ORDER.indexOf(stage.step);
      return index === 0 ? { kind: 'intro' } : { kind: 'capture', step: CAPTURE_STEP_ORDER[index - 1] };
    }
    case 'review':
      return { kind: 'capture', step: CAPTURE_STEP_ORDER[CAPTURE_STEP_ORDER.length - 1] };
    case 'consent':
    case 'results':
    case 'complete':
      return { kind: 'review' };
    case 'processing':
      // The upload is in flight; going back is not offered until it finishes.
      return stage;
  }
}
