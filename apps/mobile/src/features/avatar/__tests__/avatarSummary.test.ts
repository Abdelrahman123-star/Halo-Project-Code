import { formatRatio, formatShare, NOT_MEASURED, summarizeProfile } from '../avatarSummary';
import type { AvatarProfile } from '../types/avatarProfile';

const profile: AvatarProfile = {
  profile_version: '1.0',
  pipeline_version: 'avatar-preprocess-0.1',
  body: {
    landmark_ratios: {
      shoulder_to_height: 0.243,
      hip_to_height: 0.15,
      torso_to_height: 0.33,
      upper_arm_to_height: 0.18,
      lower_arm_to_height: null,
      upper_leg_to_height: 0.27,
      lower_leg_to_height: 0.25,
    },
    torso: { waist_to_shoulder: 0.8, waist_to_hip: 0.857, shoulder_to_hip: null },
    views: { front: { mean_visibility: 0.9, landmarks: [] } },
  },
  face: {
    ratios: {
      face_width_to_height: 0.78,
      eye_distance_to_face_width: 0.44,
      nose_width_to_face_width: 0.29,
      lip_width_to_face_width: 0.51,
    },
    landmarks: [],
  },
};

describe('avatarSummary', () => {
  it('formats shares and ratios, and never invents a value for null', () => {
    expect(formatShare(0.243)).toBe('24%');
    expect(formatRatio(0.857)).toBe('0.86');
    expect(formatShare(null)).toBe(NOT_MEASURED);
    expect(formatRatio(null)).toBe(NOT_MEASURED);
  });

  it('summarizes body, torso and face sections from the profile', () => {
    const sections = summarizeProfile(profile);
    expect(sections.map((section) => section.title)).toEqual(['Body proportions', 'Torso shape', 'Face']);
    const body = Object.fromEntries(sections[0].rows.map((row) => [row.label, row.value]));
    expect(body['Shoulder width']).toBe('24%');
    expect(body['Lower arm']).toBe(NOT_MEASURED);
    const torso = Object.fromEntries(sections[1].rows.map((row) => [row.label, row.value]));
    expect(torso['Shoulders ÷ hips']).toBe(NOT_MEASURED);
  });
});
