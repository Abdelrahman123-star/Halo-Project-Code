import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * Normalizes Supabase project URLs by stripping accidental copy-paste artifacts
 * such as trailing `/rest/v1`, `/rest/v1/`, or trailing slashes.
 */
export function cleanSupabaseUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const rawAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseUrl = cleanSupabaseUrl(rawUrl);
export const supabaseAnonKey = rawAnonKey?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  /^https?:\/\//i.test(supabaseUrl) &&
  !supabaseUrl.includes('YOUR-PROJECT-REF'),
);

// Fail soft: the app shows a setup screen instead of crashing when .env is missing.
// We only call createClient when the URL is a valid https:// URL — newer versions of
// @supabase/supabase-js validate the URL at construction time and throw otherwise.
// Code that uses `supabase` must always be guarded by `isSupabaseConfigured` first.
// AsyncStorage holds the session. SecureStore would be stronger but rejects values
// over ~2KB, which Supabase sessions can exceed; upgrading to an encrypted-chunk
// adapter is tracked in docs/SECURITY_AND_PRIVACY.md.

const VALID_URL = /^https?:\/\//i;

function buildClient() {
  if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
    // Return a dummy object — callers must gate on isSupabaseConfigured.
    return null as unknown as ReturnType<typeof createClient>;
  }
  if (!VALID_URL.test(supabaseUrl)) {
    // URL present but malformed; treat as not configured so the setup screen shows.
    return null as unknown as ReturnType<typeof createClient>;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // mobile environment, not browser redirect flow
    },
  });
}

export const supabase = buildClient();
