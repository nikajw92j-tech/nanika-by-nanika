'use server';

import { assertAdmin, type ActionResult } from '@/lib/auth';
import { refreshPublic } from '@/lib/server/revalidate';
import { productSchema, type ProductInput } from '@/lib/validation/admin';
import type { ProductStatus } from '@/lib/types';
import { SUPABASE_URL } from '@/lib/supabase/env';

export async function saveProduct(input: ProductInput): Promise<ActionResult<{ id: string; slug: string }>> {
  const { supabase } = await assertAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join('; ') };
  const { images, id, ...fields } = parsed.data;

  // slug უნიკალურობა
  const { data: clash } = await supabase.from('products').select('id').eq('slug', fields.slug).maybeSingle();
  if (clash && clash.id !== id) return { ok: false, error: 'ასეთი slug უკვე არსებობს — შეცვალე' };

  const { data: saved, error } = id
    ? await supabase.from('products').update(fields).eq('id', id).select('id, slug').single()
    : await supabase.from('products').insert(fields).select('id, slug').single();
  if (error || !saved) return { ok: false, error: error?.message ?? 'შენახვა ვერ მოხერხდა' };

  // ფოტოების სინქრონიზაცია: წაშლილი → ბაზიდან და Storage-იდან, დანარჩენი → თანმიმდევრობა/ქავერი
  const { data: existing } = await supabase.from('product_images').select('id, storage_path').eq('product_id', saved.id);
  const existingIds = new Set((existing ?? []).map((e) => e.id));
  // ownership: არსებული ფოტო უნდა ეკუთვნოდეს ამ პროდუქტს, ახალი — ჩვენს ბაკეტს და ბილიკს
  const publicPrefix = `${SUPABASE_URL}/storage/v1/object/public/product-images/`;
  for (const img of images) {
    if (img.id && !existingIds.has(img.id)) return { ok: false, error: 'ფოტო სხვა პროდუქტს ეკუთვნის' };
    if (!img.id && img.url !== publicPrefix + img.storage_path) return { ok: false, error: 'ფოტოს ბილიკი არასწორია' };
  }
  const keepIds = new Set(images.filter((i) => i.id).map((i) => i.id));
  const removed = (existing ?? []).filter((e) => !keepIds.has(e.id));
  if (removed.length) {
    await supabase.from('product_images').delete().in('id', removed.map((r) => r.id));
    const paths = removed.map((r) => r.storage_path).filter(Boolean);
    if (paths.length) await supabase.storage.from('product-images').remove(paths);
  }
  const hasCover = images.some((i) => i.is_cover);
  const rows = images.map((img, i) => ({
    ...(img.id ? { id: img.id } : {}),
    product_id: saved.id,
    storage_path: img.storage_path,
    url: img.url,
    alt: img.alt ?? null,
    is_cover: hasCover ? img.is_cover : i === 0,
    sort_order: i,
  }));
  const withId = rows.filter((r) => 'id' in r);
  const withoutId = rows.filter((r) => !('id' in r));
  if (withId.length) {
    const { error: e1 } = await supabase.from('product_images').upsert(withId);
    if (e1) return { ok: false, error: e1.message };
  }
  if (withoutId.length) {
    const { error: e2 } = await supabase.from('product_images').insert(withoutId);
    if (e2) return { ok: false, error: e2.message };
  }

  refreshPublic('products');
  return { ok: true, data: saved };
}

export async function setProductStatus(id: string, status: ProductStatus): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  if (!['draft', 'published', 'hidden'].includes(status)) return { ok: false, error: 'bad status' };
  const { error } = await supabase.from('products').update({ status }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  refreshPublic('products');
  return { ok: true };
}

export async function toggleProductFlag(id: string, flag: 'featured' | 'is_new', value: boolean): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  if (!['featured', 'is_new'].includes(flag)) return { ok: false, error: 'bad flag' };
  const { error } = await supabase.from('products').update({ [flag]: Boolean(value) }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  refreshPublic('products');
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const { data: imgs } = await supabase.from('product_images').select('storage_path').eq('product_id', id);
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  const paths = (imgs ?? []).map((i) => i.storage_path).filter(Boolean);
  if (paths.length) await supabase.storage.from('product-images').remove(paths);
  refreshPublic('products', 'promotions');
  return { ok: true };
}

/** ატვირთული, მაგრამ შეუნახავი ფოტოს წაშლა (ფორმის დატოვებისას/წაშლისას) */
export async function discardUpload(bucket: 'product-images' | 'gallery' | 'site', path: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  if (!['product-images', 'gallery', 'site'].includes(bucket) || !/^[\w/.-]+$/.test(path) || path.includes('..')) {
    return { ok: false, error: 'bad path' };
  }
  // მხოლოდ ის ფაილი, რომელიც ბაზაში არცერთ ჩანაწერს არ ეკუთვნის
  if (bucket === 'product-images') {
    const { count } = await supabase.from('product_images').select('id', { count: 'exact', head: true }).eq('storage_path', path);
    if (count) return { ok: true };
  }
  await supabase.storage.from(bucket).remove([path]);
  return { ok: true };
}
