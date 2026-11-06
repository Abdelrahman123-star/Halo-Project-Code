import { useSession } from '@/features/auth/hooks/useSession';
import { resolveDisplayName } from '../displayName';
import { useMyProfile } from './useMyProfile';

/**
 * The signed-in user's display name, or null if none is known.
 * Sign-up metadata is available immediately, so the greeting rarely waits on
 * the profile query; once the profile row loads it takes precedence.
 */
export function useDisplayName(): string | null {
  const { session } = useSession();
  const profileState = useMyProfile(session?.user.id ?? '');
  const profileName = profileState.status === 'ready' ? profileState.profile?.display_name : null;

  return resolveDisplayName({ profileName, metadata: session?.user.user_metadata });
}
