import { z } from 'zod';
import { SUPABASE_URL } from '@/lib/supabase/env';

export const localized = (max = 300) =>
  z
    .object({ ka: z.string().max(max), en: z.string().max(max), ru: z.string().max(max) })
    .partial()
    .default({});

const httpsUrl = z.string().trim().url().startsWith('https://');
/** მხოლოდ ჩვენი ბაკეტების ან ლოკალური ფოტოები */
export const imageUrl = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (v) =>
      (v.startsWith('/images/') && !v.includes('..')) ||
      (Boolean(SUPABASE_URL) && v.startsWith(`${SUPABASE_URL}/storage/v1/object/public/`)),
    'Invalid image URL',
  );

export const imageItem = z.object({
  id: z.string().uuid().optional(),
  storage_path: z.string().max(400),
  url: imageUrl,
  alt: z.string().max(200).nullable().optional(),
  is_cover: z.boolean(),
});

export const productSchema = z
  .object({
    id: z.string().uuid().optional(),
    slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'slug: მხოლოდ ლათინური ასოები, ციფრები და „-“').min(2).max(80),
    name: z.object({ ka: z.string().trim().min(1, 'სახელი (ქართ.) სავალდებულოა').max(160), en: z.string().max(160).default(''), ru: z.string().max(160).default('') }),
    description: localized(5000),
    category_id: z.string().uuid().nullable(),
    price: z.coerce.number().min(0).max(1_000_000),
    original_price: z.coerce.number().min(0).max(1_000_000).nullable(),
    discounted_price: z.coerce.number().min(0).max(1_000_000).nullable(),
    colors: z.array(z.object({ name: z.string().trim().min(1).max(40), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/) })).max(30),
    sizes: z.array(z.string().trim().min(1).max(20)).max(30),
    fabric: localized(300),
    availability: z.enum(['in_stock', 'made_to_order', 'out_of_stock']),
    stock_quantity: z.coerce.number().int().min(0).max(100000).nullable(),
    made_to_order: z.boolean(),
    sewing_time: z.string().trim().max(80).nullable(),
    featured: z.boolean(),
    is_new: z.boolean(),
    status: z.enum(['draft', 'published', 'hidden']),
    seo_title: z.string().trim().max(70).nullable(),
    seo_description: z.string().trim().max(170).nullable(),
    sort_order: z.coerce.number().int().min(0).max(100000).default(0),
    images: z.array(imageItem).max(20),
  })
  .refine((p) => p.discounted_price == null || p.discounted_price < p.price, {
    path: ['discounted_price'],
    message: 'ფასდაკლებული ფასი ძირითადზე ნაკლები უნდა იყოს',
  });
export type ProductInput = z.input<typeof productSchema>;

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).min(2).max(40),
  name: z.object({ ka: z.string().trim().min(1).max(60), en: z.string().max(60).default(''), ru: z.string().max(60).default('') }),
  image_url: imageUrl.nullable(),
  sort_order: z.coerce.number().int().min(0).max(1000),
  active: z.boolean(),
});

export const gallerySchema = z.object({
  id: z.string().uuid(),
  category_slug: z.string().max(40).nullable(),
  title: localized(160),
  description: localized(600),
  featured: z.boolean(),
  published: z.boolean(),
});

export const promotionSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.object({ ka: z.string().trim().min(1).max(120), en: z.string().max(120).default(''), ru: z.string().max(120).default('') }),
    subtitle: localized(300),
    image_url: imageUrl.nullable(),
    storage_path: z.string().max(400).nullable(),
    link: z
      .string()
      .trim()
      .max(300)
      .refine((v) => v.startsWith('/') || v.startsWith('https://'), 'ბმული უნდა იწყებოდეს / ან https://')
      .nullable(),
    discount_percent: z.coerce.number().gt(0).lt(100).nullable(),
    product_ids: z.array(z.string().uuid()).max(500),
    starts_at: z.string().datetime({ offset: true }).nullable(),
    ends_at: z.string().datetime({ offset: true }).nullable(),
    active: z.boolean(),
    show_on_home: z.boolean(),
    sort_order: z.coerce.number().int().min(0).max(1000).default(0),
  })
  .refine((p) => !p.starts_at || !p.ends_at || new Date(p.ends_at) > new Date(p.starts_at), {
    path: ['ends_at'],
    message: 'დასრულების თარიღი დაწყებაზე გვიან უნდა იყოს',
  });

const L = localized(2000);
/** website_content-ის თითოეული გასაღების სქემა */
export const contentSchemas = {
  hero: z.object({ eyebrow: L, title: L, subtitle: L, images: z.array(imageUrl).max(5) }),
  about: z.object({ title: L, text: localized(3000), story: localized(6000), image: z.union([imageUrl, z.literal('')]), designerImage: z.union([imageUrl, z.literal('')]) }),
  contact: z.object({
    phone: z.string().trim().max(40),
    whatsapp: z.string().trim().regex(/^\d{8,15}$/, 'WhatsApp: მხოლოდ ციფრები ქვეყნის კოდით (995...)'),
    email: z.string().trim().email(),
    address: L,
    hours: L,
    mapEmbedUrl: z.union([z.literal(''), z.string().trim().startsWith('https://www.google.com/maps/embed', 'მხოლოდ Google Maps embed ბმული')]),
  }),
  social: z.object({
    facebook: z.union([z.literal(''), httpsUrl]),
    instagram: z.union([z.literal(''), httpsUrl]),
    instagramHandle: z.string().max(60),
    messenger: z.union([z.literal(''), httpsUrl]),
    tiktok: z.union([z.literal(''), httpsUrl]),
  }),
  delivery: z.object({ text: L, sewingTime: L, priceNote: L }),
  services: z.object({
    items: z.array(z.object({ title: L, text: L, price: L, time: L })).max(30),
    extras: z.array(z.object({ title: L, text: L })).max(20),
  }),
  faq: z.object({ items: z.array(z.object({ q: L, a: localized(4000) })).max(50) }),
  stats: z.object({ items: z.array(z.object({ value: z.coerce.number().min(0).max(1e7), suffix: z.string().max(5), label: L })).max(6) }),
  reviews: z.object({ items: z.array(z.object({ name: z.string().trim().min(1).max(80), text: localized(1500), source: z.string().max(60) })).max(50) }),
  beforeAfter: z.object({ pairs: z.array(z.object({ before: imageUrl, after: imageUrl, caption: L })).max(10) }),
  settings: z.object({
    storeName: z.string().trim().min(1).max(80),
    currency: z.literal('GEL'),
    productionTime: L,
    deliveryOptions: z.array(z.object({ name: L, price: z.coerce.number().min(0).max(10000).nullable(), time: L })).max(20),
    freeDeliveryFrom: z.coerce.number().min(0).max(1e6).nullable(),
  }),
} as const;
