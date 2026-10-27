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
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('YOUR-PROJECT-REF'),
);

// Fail soft: the app shows a setup screen instead of crashing when .env is missing.
// AsyncStorage holds the session. SecureStore would be stronger but rejects values
// over ~2KB, which Supabase sessions can exceed; upgrading to an encrypted-chunk
// adapter is tracked in docs/SECURITY_AND_PRIVACY.md.
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.invalid',
  supabaseAnonKey ?? 'placeholder',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // mobile environment, not browser redirect flow
    },
  },
);
