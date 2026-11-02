import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

/** ანონიმური კლიენტი საჯარო მონაცემებისთვის (RLS-ით დაცული, cookies-ის გარეშე — ქეშირებადი). */
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
