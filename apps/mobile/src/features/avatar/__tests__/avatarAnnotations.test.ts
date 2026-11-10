import { AVATAR_ANCHORS, buildAnnotations, layoutLabelCenters } from '../avatarAnchors';
import {
  deleteAvatarMeasurements,
  loadAvatarMeasurements,
  saveAvatarMeasurements,
  type AvatarMeasurements,
} from '../avatarProfileStore';

const measurements: AvatarMeasurements = {
  createdAt: '2026-11-08T12:00:00+00:00',
  savedToAccount: false,
  body: {
    shoulder_to_height: 0.243,
    hip_to_height: 0.152,
    torso_to_height: 0.331,
    upper_arm_to_height: 0.18,
    lower_arm_to_height: null,
    upper_leg_to_height: 0.27,
    lower_leg_to_height: 0.25,
  },
  torso: { waist_to_shoulder: 0.8, waist_to_hip: 0.857, shoulder_to_hip: 1.07 },
  face: {
    face_width_to_height: 0.78,
    eye_distance_to_face_width: 0.44,
    nose_width_to_face_width: 0.29,
    lip_width_to_face_width: 0.51,
  },
};

describe('avatar annotations', () => {
  it('pins every measurement to a body part with the real values, never inventing nulls', () => {
    const byId = Object.fromEntries(buildAnnotations(measurements).map((a) => [a.id, a]));
    expect(Object.keys(byId)).toHaveLength(12);
    expect(byId.shoulders.value).toBe('24% of height');
    expect(byId.shoulders.segment).toEqual([AVATAR_ANCHORS.shoulderA, AVATAR_ANCHORS.shoulderB]);
    expect(byId.waist.value).toBe('0.86');
    expect(byId.face.value).toBe('W÷H 0.78');
    expect(byId.eyes.value).toBe('44% of face');
    expect(byId.lowerArm.value).toBe('Not measured');
  });

  it('keeps every anchor inside the avatar image and in head-to-toe order', () => {
    for (const point of Object.values(AVATAR_ANCHORS)) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(1);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(1);
    }
    const A = AVATAR_ANCHORS;
    expect(A.nose.y).toBeLessThan(A.shoulderMid.y);
    expect(A.shoulderMid.y).toBeLessThan(A.waist.y);
    expect(A.waist.y).toBeLessThan(A.hipMid.y);
    expect(A.hipMid.y).toBeLessThan(A.knee.y);
    expect(A.knee.y).toBeLessThan(A.ankle.y);
  });

  it('spreads crowded labels apart and keeps them inside the column', () => {
    const centers = layoutLabelCenters([50, 46, 52, 400], 38, 17, 443);
    const sorted = [...centers].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i += 1) expect(sorted[i] - sorted[i - 1]).toBeGreaterThanOrEqual(38);
    expect(Math.min(...centers)).toBeGreaterThanOrEqual(17);
    expect(Math.max(...centers)).toBeLessThanOrEqual(443);
    expect(centers[3]).toBe(400); // a label with room stays level with its anchor
  });

  it('pushes labels up when they would run past the bottom', () => {
    const centers = layoutLabelCenters([430, 440], 38, 17, 443);
    expect(centers[1]).toBe(443);
    expect(centers[0]).toBe(405);
  });
});

describe('avatarProfileStore', () => {
  it('saves, loads and deletes measurements per user', async () => {
    await saveAvatarMeasurements('user-1', measurements);
    expect(await loadAvatarMeasurements('user-1')).toEqual(measurements);
    expect(await loadAvatarMeasurements('user-2')).toBeNull();
    await deleteAvatarMeasurements('user-1');
    expect(await loadAvatarMeasurements('user-1')).toBeNull();
  });
});
