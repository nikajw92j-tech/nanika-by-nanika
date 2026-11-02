export type Locale = 'ka' | 'en' | 'ru';
export type Localized = Partial<Record<Locale, string>>;

export type Category = {
  id: string;
  slug: string;
  name: Localized;
  image_url: string | null;
  sort_order: number;
  active: boolean;
};

export type ProductColor = { name: string; hex: string };
export type ProductStatus = 'draft' | 'published' | 'hidden';
export type Availability = 'in_stock' | 'made_to_order' | 'out_of_stock';

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  url: string;
  alt: string | null;
  is_cover: boolean;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  category_id: string | null;
  price: number;
  original_price: number | null;
  discounted_price: number | null;
  colors: ProductColor[];
  sizes: string[];
  fabric: Localized;
  availability: Availability;
  stock_quantity: number | null;
  made_to_order: boolean;
  sewing_time: string | null;
  featured: boolean;
  is_new: boolean;
  status: ProductStatus;
  seo_title: string | null;
  seo_description: string | null;
  view_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  product_images?: ProductImage[];
};

/** საჯარო საიტისთვის მომზადებული პროდუქტი — საბოლოო ფასით და ქავერით. */
export type PublicProduct = Product & {
  images: ProductImage[];
  cover: string | null;
  finalPrice: number;
  comparePrice: number | null;
  discountPercent: number | null;
  category: Category | null;
};

export type GalleryImage = {
  id: string;
  storage_path: string | null;
  url: string;
  category_slug: string | null;
  title: Localized;
  description: Localized;
  featured: boolean;
  published: boolean;
  sort_order: number;
  width: number | null;
  height: number | null;
};

export const ORDER_STATUSES = [
  'new', 'confirmed', 'in_production', 'ready', 'shipped', 'completed', 'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  color: string | null;
  size: string | null;
  custom_size: boolean;
  quantity: number;
  unit_price: number | null;
};

export type Order = {
  id: string;
  order_number: number;
  kind: 'custom' | 'product';
  customer_name: string;
  phone: string;
  city: string;
  contact_method: 'phone' | 'whatsapp' | 'messenger';
  category: string | null;
  measurements: Record<string, number | string> | null;
  measurements_later: boolean;
  reference_images: string[];
  color: string | null;
  fabric: string | null;
  desired_date: string | null;
  notes: string | null;
  total: number | null;
  quote_status: 'fixed' | 'pending' | 'quoted';
  status: OrderStatus;
  payment_status: PaymentStatus;
  paid_at: string | null;
  payment_note: string | null;
  admin_notes: string | null;
  locale: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type CustomerRequest = {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: 'new' | 'answered' | 'archived';
  created_at: string;
};

export type Promotion = {
  id: string;
  title: Localized;
  subtitle: Localized;
  image_url: string | null;
  storage_path: string | null;
  link: string | null;
  discount_percent: number | null;
  product_ids: string[];
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  show_on_home: boolean;
  sort_order: number;
  created_at: string;
};
