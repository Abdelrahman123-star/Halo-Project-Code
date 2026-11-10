import { createClient } from '@supabase/supabase-js';

/**
 * Server-only client with elevated privileges for admin user management.
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not configured in the server environment.
 */
export function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || !url) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

