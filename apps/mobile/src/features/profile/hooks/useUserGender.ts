/**
 * The signed-in user's gender, chosen at registration and stored in the
 * account's sign-up metadata. Null when not set (accounts created before the
 * field existed) or not a recognised value.
 */
import { useSession } from '@/features/auth/hooks/useSession';
import { GENDER_OPTIONS, type Gender } from '@/features/auth/schemas';

export function readGender(metadata: Record<string, unknown> | null | undefined): Gender | null {
  const value = metadata?.gender;
  return GENDER_OPTIONS.find((option) => option === value) ?? null;
}

export function useUserGender(): Gender | null {
  const { session } = useSession();
  return readGender(session?.user.user_metadata);
}
