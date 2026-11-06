/**
 * PROTOTYPE: until real avatar generation exists, finishing the capture flow
 * gives the user this fixed sample avatar image. It is NOT generated from the
 * user's photos, and the UI labels it "Preview avatar" everywhere it appears.
 *
 * Whether the user "has" the preview avatar is a per-user flag on the device
 * (AsyncStorage). Nothing is uploaded.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PREVIEW_AVATAR_IMAGE = require('../../../assets/avatar-preview.png');

// Background-removed asset is 179 × 610 px.
export const PREVIEW_AVATAR_ASPECT_RATIO = 179 / 610;

const STORAGE_KEY_PREFIX = 'halo.preview-avatar.v1.';

function storageKey(userId: string): string {
  if (!userId) throw new Error('A signed-in user is required to store an avatar');
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export async function hasPreviewAvatar(userId: string): Promise<boolean> {
  if (!userId) return false;
  return (await AsyncStorage.getItem(storageKey(userId))) !== null;
}

export async function savePreviewAvatar(userId: string): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify({ createdAt: new Date().toISOString() }));
}

export async function deletePreviewAvatar(userId: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(userId));
}
