import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './env';

/**
 * Service-role კლიენტი — გვერდს უვლის RLS-ს. გამოიყენე მხოლოდ სერვერზე,
 * მკაცრად ვალიდირებული მონაცემებისთვის (მაგ. შეკვეთის შენახვა).
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
