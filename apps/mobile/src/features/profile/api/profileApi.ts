import { supabase } from '@/shared/lib/supabase';

export type Profile = { id: string; display_name: string; created_at: string };

/** Reads the signed-in user's own profile. RLS guarantees no other row is visible. */
export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
