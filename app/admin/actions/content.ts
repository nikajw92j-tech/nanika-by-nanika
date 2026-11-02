'use server';

import { assertAdmin, type ActionResult } from '@/lib/auth';
import { refreshPublic } from '@/lib/server/revalidate';
import { contentSchemas } from '@/lib/validation/admin';
import { categorySchema, gallerySchema, promotionSchema } from '@/lib/validation/admin';
import type { z } from 'zod';

type Key = keyof typeof contentSchemas;

export async function saveContent(key: Key, value: unknown): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const schema = contentSchemas[key];
  if (!schema) return { ok: false, error: 'unknown key' };
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') };
  }
  const { error } = await supabase.from('website_content').upsert({ key, value: parsed.data });
  if (error) return { ok: false, error: error.message };
  refreshPublic('content');
  return { ok: true };
}

/* ─── კატეგორიები ─── */
export async function saveCategory(input: z.input<typeof categorySchema>): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'validation' };
  const { id, ...fields } = parsed.data;
  const { error } = id
    ? await supabase.from('categories').update(fields).eq('id', id)
    : await supabase.from('categories').insert(fields);
  if (error) return { ok: false, error: error.code === '23505' ? 'ასეთი slug უკვე არსებობს' : error.message };
  refreshPublic('categories', 'products');
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  refreshPublic('categories', 'products');
  return { ok: true };
}

/* ─── გალერეა ─── */
export async function addGalleryImages(
  items: { storage_path: string; url: string; category_slug: string | null; width?: number; height?: number }[],
): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) return { ok: false, error: 'bad input' };
  const { data: last } = await supabase.from('gallery_images').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
  let order = (last?.sort_order ?? 0) + 1;
  const rows = items.map((i) => ({
    storage_path: String(i.storage_path).slice(0, 400),
    url: String(i.url).slice(0, 1000),
    category_slug: i.category_slug ? String(i.category_slug).slice(0, 40) : null,
    width: Number.isFinite(i.width) ? i.width : null,
    height: Number.isFinite(i.height) ? i.height : null,
    sort_order: order++,
  }));
  if (rows.some((r) => !r.url.includes('/storage/v1/object/public/gallery/'))) return { ok: false, error: 'bad url' };
  const { error } = await supabase.from('gallery_images').insert(rows);
  if (error) return { ok: false, error: error.message };
  refreshPublic('gallery');
  return { ok: true };
}

export async function updateGalleryImage(input: z.input<typeof gallerySchema>): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const parsed = gallerySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'validation' };
  const { id, ...fields } = parsed.data;
  const { error } = await supabase.from('gallery_images').update(fields).eq('id', id);
  if (error) return { ok: false, error: error.message };
  refreshPublic('gallery');
  return { ok: true };
}

export async function reorderGallery(ids: string[]): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  if (!Array.isArray(ids) || ids.length > 1000) return { ok: false, error: 'bad input' };
  const results = await Promise.all(
    ids.map((id, i) => supabase.from('gallery_images').update({ sort_order: i }).eq('id', id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };
  refreshPublic('gallery');
  return { ok: true };
}

export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { data: row } = await supabase.from('gallery_images').select('storage_path').eq('id', id).single();
  const { error } = await supabase.from('gallery_images').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  if (row?.storage_path) await supabase.storage.from('gallery').remove([row.storage_path]);
  refreshPublic('gallery');
  return { ok: true };
}

/* ─── აქციები ─── */
export async function savePromotion(input: z.input<typeof promotionSchema>): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const parsed = promotionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join('; ') };
  const { id, ...fields } = parsed.data;
  const { error } = id
    ? await supabase.from('promotions').update(fields).eq('id', id)
    : await supabase.from('promotions').insert(fields);
  if (error) return { ok: false, error: error.message };
  refreshPublic('promotions', 'products');
  return { ok: true };
}

export async function togglePromotion(id: string, active: boolean): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { error } = await supabase.from('promotions').update({ active: Boolean(active) }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  refreshPublic('promotions', 'products');
  return { ok: true };
}

export async function deletePromotion(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { data: row } = await supabase.from('promotions').select('storage_path').eq('id', id).single();
  const { error } = await supabase.from('promotions').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  if (row?.storage_path) await supabase.storage.from('site').remove([row.storage_path]);
  refreshPublic('promotions', 'products');
  return { ok: true };
}
