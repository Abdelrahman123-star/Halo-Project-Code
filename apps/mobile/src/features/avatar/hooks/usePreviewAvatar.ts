/**
 * Whether the signed-in user currently has the preview avatar, re-read every
 * time the calling screen gains focus (so Home updates after create/delete).
 */
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSession } from '@/features/auth/hooks/useSession';
import { deletePreviewAvatar, hasPreviewAvatar, savePreviewAvatar } from '../previewAvatar';

type PreviewAvatarState = { status: 'loading' } | { status: 'ready'; hasAvatar: boolean };

export function usePreviewAvatar() {
  const { session } = useSession();
  const userId = session?.user.id ?? '';
  const [state, setState] = useState<PreviewAvatarState>({ status: 'loading' });

  useFocusEffect(
    useCallback(() => {
      let active = true;
      hasPreviewAvatar(userId)
        .then((hasAvatar) => active && setState({ status: 'ready', hasAvatar }))
        // Unreadable storage is treated as "no avatar" so the user can still create one.
        .catch(() => active && setState({ status: 'ready', hasAvatar: false }));
      return () => {
        active = false;
      };
    }, [userId]),
  );

  const create = useCallback(async () => {
    await savePreviewAvatar(userId);
    setState({ status: 'ready', hasAvatar: true });
  }, [userId]);

  const remove = useCallback(async () => {
    await deletePreviewAvatar(userId);
    setState({ status: 'ready', hasAvatar: false });
  }, [userId]);

  return { state, create, remove };
}
