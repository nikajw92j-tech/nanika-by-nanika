import 'server-only';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createServerSupabase } from '@/lib/supabase/server';

/** სესია + admin_users შემოწმება სერვერზე. null — თუ ადმინი არ არის. */
export async function getAdmin() {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase
    .from('admin_users')
    .select('user_id, email, full_name')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!admin) return null;
  return { supabase, user, admin };
}

/** გვერდებისთვის: არა-ადმინი გადადის login-ზე */
export async function requireAdmin() {
  const a = await getAdmin();
  if (!a) redirect('/admin/login');
  return a;
}

/** Server Action-ებისთვის: არა-ადმინზე აგდებს შეცდომას */
export async function assertAdmin() {
  const a = await getAdmin();
  if (!a) throw new Error('Unauthorized');
  return a;
}

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };
