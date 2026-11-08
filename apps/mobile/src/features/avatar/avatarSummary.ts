/**
 * Turns the avatar profile into human-readable rows for the results screen.
 * Null (low-confidence) values are shown as "Not measured" — never guessed.
 */
import type { AvatarProfile } from './types/avatarProfile';

export type SummaryRow = { label: string; value: string };
export type SummarySection = { title: string; caption: string; rows: SummaryRow[] };

export const NOT_MEASURED = 'Not measured';

export function formatShare(value: number | null): string {
  return value === null ? NOT_MEASURED : `${Math.round(value * 100)}%`;
}

export function formatRatio(value: number | null): string {
  return value === null ? NOT_MEASURED : value.toFixed(2);
}

export function summarizeProfile(profile: AvatarProfile): SummarySection[] {
  const body = profile.body.landmark_ratios;
  const torso = profile.body.torso;
  const face = profile.face.ratios;

  return [
    {
      title: 'Body proportions',
      caption: 'Share of your visible height (nose to ankles)',
      rows: [
        { label: 'Shoulder width', value: formatShare(body.shoulder_to_height) },
        { label: 'Hip width', value: formatShare(body.hip_to_height) },
        { label: 'Torso length', value: formatShare(body.torso_to_height) },
        { label: 'Upper leg', value: formatShare(body.upper_leg_to_height) },
        { label: 'Lower leg', value: formatShare(body.lower_leg_to_height) },
        { label: 'Upper arm', value: formatShare(body.upper_arm_to_height) },
        { label: 'Lower arm', value: formatShare(body.lower_arm_to_height) },
      ],
    },
    {
      title: 'Torso shape',
      caption: 'From your silhouette, front and back',
      rows: [
        { label: 'Waist ÷ hips', value: formatRatio(torso.waist_to_hip) },
        { label: 'Waist ÷ shoulders', value: formatRatio(torso.waist_to_shoulder) },
        { label: 'Shoulders ÷ hips', value: formatRatio(torso.shoulder_to_hip) },
      ],
    },
    {
      title: 'Face',
      caption: 'Relative to your face size',
      rows: [
        { label: 'Width ÷ height', value: formatRatio(face.face_width_to_height) },
        { label: 'Eye spacing', value: formatShare(face.eye_distance_to_face_width) },
        { label: 'Nose width', value: formatShare(face.nose_width_to_face_width) },
        { label: 'Lip width', value: formatShare(face.lip_width_to_face_width) },
      ],
    },
  ];
}
