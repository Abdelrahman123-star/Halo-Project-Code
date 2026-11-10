/**
 * "In the wash" marks. The wardrobe table has no column for this and the
 * backend is out of scope, so the marks are a per-user list of garment ids kept
 * on this device only (AsyncStorage). They don't sync to other devices.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { useSession } from '@/features/auth/hooks/useSession';

const STORAGE_KEY_PREFIX = 'halo.wardrobe.in-wash.v1.';
const StoredIdsSchema = z.array(z.string());

export async function loadWashIds(userId: string): Promise<string[]> {
  if (!userId) return [];
  const raw = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
  if (!raw) return [];
  const parsed = StoredIdsSchema.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : [];
}

export async function saveWashIds(userId: string, ids: readonly string[]): Promise<void> {
  if (!userId) return;
  await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(ids));
}

export function toggleId(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];
}

export function useWashState() {
  const { session } = useSession();
  const userId = session?.user.id ?? '';
  const [washIds, setWashIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    loadWashIds(userId)
      .then((ids) => active && setWashIds(ids))
      // Unreadable storage just means nothing is marked; the wardrobe still works.
      .catch(() => active && setWashIds([]));
    return () => {
      active = false;
    };
  }, [userId]);

  const toggleWash = useCallback(
    (garmentId: string) => {
      setWashIds((current) => {
        const next = toggleId(current, garmentId);
        saveWashIds(userId, next).catch((error: unknown) => console.warn('Could not save the wash mark', error));
        return next;
      });
    },
    [userId],
  );

  return { washIds, toggleWash };
}
