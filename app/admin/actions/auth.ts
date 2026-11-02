'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { assertAdmin, type ActionResult } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createServerSupabase } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/server/files';

const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(6).max(200) });

export async function signIn(_: { error?: string } | undefined, form: FormData) {
  if (!isSupabaseConfigured()) return { error: 'Supabase არ არის კონფიგურირებული (.env)' };
  const parsed = loginSchema.safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) return { error: 'შეიყვანე სწორი ელ-ფოსტა და პაროლი' };
  if (!rateLimit(`login:${parsed.data.email}`, 8, 15 * 60 * 1000)) {
    return { error: 'ძალიან ბევრი მცდელობა. სცადე 15 წუთში.' };
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: 'ელ-ფოსტა ან პაროლი არასწორია' };

  const { data: admin } = await supabase.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: 'ამ ანგარიშს ადმინისტრატორის უფლება არ აქვს' };
  }
  redirect('/admin');
}

export async function signOut() {
  if (isSupabaseConfigured()) await createServerSupabase().auth.signOut();
  redirect('/admin/login');
}

export async function changePassword(password: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  if (typeof password !== 'string' || password.length < 10) {
    return { ok: false, error: 'პაროლი მინიმუმ 10 სიმბოლო უნდა იყოს' };
  }
  const { error } = await supabase.auth.updateUser({ password });
  return error ? { ok: false, error: error.message } : { ok: true };
}
