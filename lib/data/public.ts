import 'server-only';
import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { staticCategories } from '@/data/categories';
import { staticGallery } from '@/data/gallery';
import { CONTENT_KEYS, defaultContent, mergeContent, type SiteContent } from '@/lib/content';
import type { Category, GalleryImage, Product, Promotion, PublicProduct } from '@/lib/types';
import { TAGS } from './tags';

const REVALIDATE = 120; // წამი — აქციების დაწყება/დასრულება დროში

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    if (!isSupabaseConfigured()) return staticCategories;
    const { data, error } = await createPublicClient()
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order');
    if (error) {
      console.error('[categories]', error.message);
      return staticCategories;
    }
    return data as Category[];
  },
  ['categories'],
  { tags: [TAGS.categories], revalidate: REVALIDATE },
);

export const getContent = unstable_cache(
  async (): Promise<SiteContent> => {
    const base = defaultContent();
    if (!isSupabaseConfigured()) return base;
    const { data, error } = await createPublicClient().from('website_content').select('key, value');
    if (error) {
      console.error('[content]', error.message);
      return base;
    }
    const out = { ...base } as Record<string, unknown>;
    for (const row of data ?? []) {
      if ((CONTENT_KEYS as string[]).includes(row.key)) {
        out[row.key] = mergeContent((base as Record<string, unknown>)[row.key], row.value);
      }
    }
    return out as SiteContent;
  },
  ['content'],
  { tags: [TAGS.content], revalidate: REVALIDATE },
);

const fetchPromotions = unstable_cache(
  async (): Promise<Promotion[]> => {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await createPublicClient()
      .from('promotions')
      .select('*')
      .eq('active', true)
      .order('sort_order');
    if (error) {
      console.error('[promotions]', error.message);
      return [];
    }
    return data as Promotion[];
  },
  ['promotions'],
  { tags: [TAGS.promotions], revalidate: REVALIDATE },
);

/** აქტიური და დროის ფანჯარაში მყოფი აქციები */
export async function getActivePromotions() {
  const now = Date.now();
  return (await fetchPromotions()).filter(
    (p) =>
      (!p.starts_at || new Date(p.starts_at).getTime() <= now) &&
      (!p.ends_at || new Date(p.ends_at).getTime() > now),
  );
}

export function priceProduct(
  p: Product,
  promotions: Promotion[],
  categories: Category[],
): PublicProduct {
  const images = [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const cover = images.find((i) => i.is_cover)?.url ?? images[0]?.url ?? null;
  const base = Number(p.price);
  let final =
    p.discounted_price != null && Number(p.discounted_price) < base
      ? Number(p.discounted_price)
      : base;
  const pct = Math.max(
    0,
    ...promotions
      .filter((pr) => pr.discount_percent && pr.product_ids.includes(p.id))
      .map((pr) => Number(pr.discount_percent)),
  );
  if (pct > 0) final = Math.min(final, Math.round(base * (1 - pct / 100)));
  const compare = Math.max(Number(p.original_price ?? 0), base);
  const comparePrice = compare > final ? compare : null;
  return {
    ...p,
    price: base,
    images,
    cover,
    finalPrice: final,
    comparePrice,
    discountPercent: comparePrice ? Math.round((1 - final / comparePrice) * 100) : null,
    category: categories.find((c) => c.id === p.category_id) ?? null,
  };
}

const fetchProducts = unstable_cache(
  async (): Promise<Product[]> => {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await createPublicClient()
      .from('products')
      .select('*, product_images(*)')
      .eq('status', 'published')
      .order('sort_order')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[products]', error.message);
      return [];
    }
    return data as Product[];
  },
  ['products'],
  { tags: [TAGS.products], revalidate: REVALIDATE },
);

export async function getProducts(): Promise<PublicProduct[]> {
  const [products, promotions, categories] = await Promise.all([
    fetchProducts(),
    getActivePromotions(),
    getCategories(),
  ]);
  return products.map((p) => priceProduct(p, promotions, categories));
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export const getGallery = unstable_cache(
  async (): Promise<GalleryImage[]> => {
    if (!isSupabaseConfigured()) return staticGallery;
    const { data, error } = await createPublicClient()
      .from('gallery_images')
      .select('*')
      .eq('published', true)
      .order('sort_order')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[gallery]', error.message);
      return staticGallery;
    }
    // სანამ ადმინიდან ფოტო არ დაემატება, ვაჩვენებთ სტატიკურ ფოტოებს
    return data.length ? (data as GalleryImage[]) : staticGallery;
  },
  ['gallery'],
  { tags: [TAGS.gallery], revalidate: REVALIDATE },
);

export async function trackProductView(slug: string) {
  if (!isSupabaseConfigured()) return;
  try {
    await createPublicClient().rpc('increment_product_view', { p_slug: slug });
  } catch {
    // ნახვის დათვლა არაკრიტიკულია
  }
}
