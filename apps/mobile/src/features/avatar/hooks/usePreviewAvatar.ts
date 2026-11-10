/**
 * Whether the signed-in user currently has the preview avatar, re-read every
 * time the calling screen gains focus (so Home updates after create/delete).
 */
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSession } from '@/features/auth/hooks/useSession';
import { deleteMyAvatarData } from '../api/avatarApi';
import { deleteAvatarMeasurements, loadAvatarMeasurements, type AvatarMeasurements } from '../avatarProfileStore';
import { deletePreviewAvatar, hasPreviewAvatar, savePreviewAvatar } from '../previewAvatar';

type PreviewAvatarState =
  | { status: 'loading' }
  | { status: 'ready'; hasAvatar: boolean; measurements: AvatarMeasurements | null };

export function usePreviewAvatar() {
  const { session } = useSession();
  const userId = session?.user.id ?? '';
  const [state, setState] = useState<PreviewAvatarState>({ status: 'loading' });

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([hasPreviewAvatar(userId), loadAvatarMeasurements(userId).catch(() => null)])
        .then(([hasAvatar, measurements]) => active && setState({ status: 'ready', hasAvatar, measurements }))
        // Unreadable storage is treated as "no avatar" so the user can still create one.
        .catch(() => active && setState({ status: 'ready', hasAvatar: false, measurements: null }));
      return () => {
        active = false;
      };
    }, [userId]),
  );

  const create = useCallback(async () => {
    await savePreviewAvatar(userId);
    const measurements = await loadAvatarMeasurements(userId).catch(() => null);
    setState({ status: 'ready', hasAvatar: true, measurements });
  }, [userId]);

  const remove = useCallback(async () => {
    // Server profile first: if that fails the user still sees the avatar and can retry.
    await deleteMyAvatarData(userId);
    await deleteAvatarMeasurements(userId);
    await deletePreviewAvatar(userId);
    setState({ status: 'ready', hasAvatar: false, measurements: null });
  }, [userId]);

  return { state, create, remove };
}
