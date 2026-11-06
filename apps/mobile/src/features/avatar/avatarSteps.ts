/** Configuration for the three avatar capture steps. */

export type CaptureStepId = 'front' | 'back' | 'face';
export type CameraFacing = 'front' | 'back';

export type CaptureStepConfig = {
  id: CaptureStepId;
  title: string;
  /** Label used in the progress indicator and review grid. */
  shortTitle: string;
  instructions: string;
  tips: readonly string[];
  /**
   * Front & face default to the selfie camera so users can see themselves.
   * The back view defaults to the rear camera: the user faces away, so a
   * helper (or a propped phone with the timer) takes it.
   */
  defaultFacing: CameraFacing;
};

export const CAPTURE_STEPS: readonly CaptureStepConfig[] = [
  {
    id: 'front',
    title: 'Front view',
    shortTitle: 'Front',
    instructions: 'Stand up straight and face the camera, arms relaxed slightly away from your body.',
    tips: ['Head to toe in the outline', 'Soft, even lighting', 'Fitted clothes work best'],
    defaultFacing: 'front',
  },
  {
    id: 'back',
    title: 'Back view',
    shortTitle: 'Back',
    instructions: 'Turn around and face away from the camera. Ask someone to help, or prop your phone up and use the timer.',
    tips: ['Head to toe in the outline', 'Stand in the same spot', 'Hair away from your shoulders'],
    defaultFacing: 'back',
  },
  {
    id: 'face',
    title: 'Face close-up',
    shortTitle: 'Face',
    instructions: 'Bring the camera close and fit your face inside the oval, looking straight ahead.',
    tips: ['Neutral expression', 'No sunglasses or hats', 'Face the light'],
    defaultFacing: 'front',
  },
];

export const CAPTURE_STEP_ORDER: readonly CaptureStepId[] = CAPTURE_STEPS.map((step) => step.id);

export function getStepConfig(id: CaptureStepId): CaptureStepConfig {
  const config = CAPTURE_STEPS.find((step) => step.id === id);
  if (!config) throw new Error(`Unknown capture step: ${id}`);
  return config;
}
