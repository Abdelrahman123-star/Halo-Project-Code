/**
 * On-device copy of the user's latest avatar measurements (ratios only — no landmarks, no
 * photos), so the avatar page can show them even when the server could not save to the
 * database yet. Per user, in AsyncStorage. Deleted together with the avatar.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import type { AvatarPreprocessResponse } from './types/avatarProfile';

const nullableNumber = z.number().nullable();

const AvatarMeasurementsSchema = z.object({
  createdAt: z.string(),
  savedToAccount: z.boolean(),
  body: z.object({
    shoulder_to_height: nullableNumber,
    hip_to_height: nullableNumber,
    torso_to_height: nullableNumber,
    upper_arm_to_height: nullableNumber,
    lower_arm_to_height: nullableNumber,
    upper_leg_to_height: nullableNumber,
    lower_leg_to_height: nullableNumber,
  }),
  torso: z.object({ waist_to_shoulder: nullableNumber, waist_to_hip: nullableNumber, shoulder_to_hip: nullableNumber }),
  face: z.object({
    face_width_to_height: nullableNumber,
    eye_distance_to_face_width: nullableNumber,
    nose_width_to_face_width: nullableNumber,
    lip_width_to_face_width: nullableNumber,
  }),
});
export type AvatarMeasurements = z.infer<typeof AvatarMeasurementsSchema>;

const KEY_PREFIX = 'halo.avatar-measurements.v1.';

function storageKey(userId: string): string {
  if (!userId) throw new Error('A signed-in user is required');
  return `${KEY_PREFIX}${userId}`;
}

export function measurementsFromResponse(result: AvatarPreprocessResponse): AvatarMeasurements {
  return {
    createdAt: result.created_at,
    savedToAccount: result.saved,
    body: result.profile.body.landmark_ratios,
    torso: result.profile.body.torso,
    face: result.profile.face.ratios,
  };
}

export async function saveAvatarMeasurements(userId: string, measurements: AvatarMeasurements): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(measurements));
}

/** Returns null when nothing is stored or the stored value is unreadable. */
export async function loadAvatarMeasurements(userId: string): Promise<AvatarMeasurements | null> {
  if (!userId) return null;
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (!raw) return null;
  try {
    const parsed = AvatarMeasurementsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function deleteAvatarMeasurements(userId: string): Promise<void> {
  if (!userId) return;
  await AsyncStorage.removeItem(storageKey(userId));
}
