'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { assertAdmin, type ActionResult } from '@/lib/auth';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/types';

const updateSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  payment_status: z.enum(PAYMENT_STATUSES),
  payment_note: z.string().trim().max(500).nullable(),
  total: z.coerce.number().min(0).max(1_000_000).nullable(),
  quote_status: z.enum(['fixed', 'pending', 'quoted']),
  admin_notes: z.string().trim().max(4000).nullable(),
});

export async function updateOrder(id: string, input: z.input<typeof updateSchema>): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'validation' };
  const v = parsed.data;

  const { data: current } = await supabase.from('orders').select('payment_status, paid_at').eq('id', id).single();
  if (!current) return { ok: false, error: 'შეკვეთა ვერ მოიძებნა' };

  // ⚠️ „გადახდილი“ მხოლოდ ხელით, დადასტურების საფუძვლის მითითებით (მაგ. ბანკის ტრანზაქციის ნომერი)
  if (v.payment_status === 'paid' && current.payment_status !== 'paid') {
    if (!v.payment_note || v.payment_note.length < 3) {
      return { ok: false, error: 'გადახდის მოსანიშნად მიუთითე დადასტურების საფუძველი (მაგ. ტრანზაქციის ნომერი)' };
    }
    if (v.total == null) return { ok: false, error: 'გადახდილად მონიშვნამდე მიუთითე შეკვეთის ფასი' };
  }

  const { error } = await supabase
    .from('orders')
    .update({
      ...v,
      quote_status: v.total != null && v.quote_status === 'pending' ? 'quoted' : v.quote_status,
      paid_at: v.payment_status === 'paid' ? (current.paid_at ?? new Date().toISOString()) : null,
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

export async function setOrderStatus(id: string, status: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const s = z.enum(ORDER_STATUSES).safeParse(status);
  if (!s.success) return { ok: false, error: 'bad status' };
  const { error } = await supabase.from('orders').update({ status: s.data }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

export async function setRequestStatus(id: string, status: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const s = z.enum(['new', 'answered', 'archived']).safeParse(status);
  if (!s.success) return { ok: false, error: 'bad status' };
  const { error } = await supabase.from('customer_requests').update({ status: s.data }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin', 'layout');
  return { ok: true };
}
