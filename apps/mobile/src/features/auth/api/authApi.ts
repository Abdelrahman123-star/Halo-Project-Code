import { supabase } from '@/shared/lib/supabase';
import type { LoginInput, RegisterInput } from '../schemas';

export type AuthResult =
  | { ok: true; needsEmailConfirmation: boolean }
  | { ok: false; message: string };

// Maps provider errors to actionable text without leaking internals in production.
export function friendlyMessage(raw: string): string {
  const text = raw.toLowerCase();
  if (text.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (text.includes('already registered')) return 'An account with this email already exists.';
  if (text.includes('email not confirmed')) return 'Please confirm your email first, then log in.';
  if (text.includes('rate limit') || text.includes('rate_limit')) {
    return 'Too many attempts. Please wait a minute and retry.';
  }
  if (text.includes('network') || text.includes('fetch')) {
    return 'Network problem. Check your connection and try again.';
  }
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return `Error: ${raw}`;
  }
  return 'Something went wrong. Please try again.';
}

export async function signIn(input: LoginInput): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });
  if (error) return { ok: false, message: friendlyMessage(error.message) };
  return { ok: true, needsEmailConfirmation: false };
}

export async function signUp(input: RegisterInput): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { display_name: input.displayName.trim() } },
  });
  if (error) return { ok: false, message: friendlyMessage(error.message) };
  // Supabase returns an empty identities list for an already-registered email when
  // confirmations are on (to avoid account enumeration), so treat it as a duplicate.
  if (data.user && data.user.identities?.length === 0) {
    return { ok: false, message: 'An account with this email already exists.' };
  }
  // No session means the project requires email confirmation.
  return { ok: true, needsEmailConfirmation: data.session === null };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
