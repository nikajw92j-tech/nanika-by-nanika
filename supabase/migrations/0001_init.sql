-- ═══════════════════════════════════════════════════════════════════════════
--  Nanika by Nanika — მონაცემთა ბაზის სქემა
--  გაუშვი Supabase Dashboard → SQL Editor-ში (ან `supabase db push`).
--  სკრიპტი იდემპოტენტურია — განმეორებით გაშვება უსაფრთხოა.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─── ადმინისტრატორები ──────────────────────────────────────────────────────
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text,
  created_at timestamptz not null default now()
);

-- security definer: RLS პოლიტიკებში რეკურსიის გარეშე ამოწმებს, არის თუ არა მომხმარებელი ადმინი
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- updated_at ტრიგერი
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─── კატეგორიები ──────────────────────────────────────────────────────────
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name       jsonb not null default '{}'::jsonb,   -- {"ka": "...", "en": "...", "ru": "..."}
  image_url  text,
  sort_order int not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── პროდუქტები ───────────────────────────────────────────────────────────
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name             jsonb not null default '{}'::jsonb,
  description      jsonb not null default '{}'::jsonb,
  category_id      uuid references public.categories (id) on delete set null,
  price            numeric(10, 2) not null check (price >= 0),
  original_price   numeric(10, 2) check (original_price >= 0),
  discounted_price numeric(10, 2) check (discounted_price >= 0),
  colors           jsonb not null default '[]'::jsonb,  -- [{"name": "შავი", "hex": "#000000"}]
  sizes            text[] not null default '{}',
  fabric           jsonb not null default '{}'::jsonb,
  availability     text not null default 'made_to_order'
                   check (availability in ('in_stock', 'made_to_order', 'out_of_stock')),
  stock_quantity   int check (stock_quantity >= 0),
  made_to_order    boolean not null default true,
  sewing_time      text,
  featured         boolean not null default false,
  is_new           boolean not null default false,
  status           text not null default 'draft' check (status in ('draft', 'published', 'hidden')),
  seo_title        text,
  seo_description  text,
  view_count       int not null default 0,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_category_idx on public.products (category_id);
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

create table if not exists public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  url          text not null,
  alt          text,
  is_cover     boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images (product_id, sort_order);

-- ნახვების მთვლელი (ანონიმურად გამოძახებადი, მხოლოდ გამოქვეყნებულ პროდუქტზე)
create or replace function public.increment_product_view(p_slug text)
returns void language sql security definer set search_path = public as $$
  update public.products set view_count = view_count + 1
  where slug = p_slug and status = 'published';
$$;
revoke all on function public.increment_product_view(text) from public;
grant execute on function public.increment_product_view(text) to anon, authenticated;

-- ─── შეკვეთები ────────────────────────────────────────────────────────────
create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     int not null unique default nextval('public.order_number_seq'),
  kind             text not null default 'custom' check (kind in ('custom', 'product')),
  customer_name    text not null,
  phone            text not null,
  city             text not null,
  contact_method   text not null default 'phone' check (contact_method in ('phone', 'whatsapp', 'messenger')),
  category         text,
  measurements     jsonb,                 -- {"bust": 90, "waist": 70, ...} ან null
  measurements_later boolean not null default false,
  reference_images text[] not null default '{}',   -- order-uploads ბაკეტის ბილიკები (პრივატული)
  color            text,
  fabric           text,
  desired_date     date,
  notes            text,
  total            numeric(10, 2),         -- null = ფასი ინდივიდუალურად დასათვლელია
  quote_status     text not null default 'pending' check (quote_status in ('fixed', 'pending', 'quoted')),
  status           text not null default 'new'
                   check (status in ('new', 'confirmed', 'in_production', 'ready', 'shipped', 'completed', 'cancelled')),
  payment_status   text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  paid_at          timestamptz,
  payment_note     text,                  -- რა საფუძვლით დადასტურდა გადახდა (ადმინის მიერ)
  admin_notes      text,
  locale           text default 'ka',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at desc);
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_id   uuid references public.products (id) on delete set null,
  product_name text not null,
  product_slug text,
  color        text,
  size         text,
  custom_size  boolean not null default false,
  quantity     int not null default 1 check (quantity between 1 and 50),
  unit_price   numeric(10, 2),
  created_at   timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- სწრაფი კითხვები / შეტყობინებები საიტიდან
create table if not exists public.customer_requests (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  message    text not null,
  status     text not null default 'new' check (status in ('new', 'answered', 'archived')),
  created_at timestamptz not null default now()
);

-- ─── გალერეა ──────────────────────────────────────────────────────────────
create table if not exists public.gallery_images (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text,
  url           text not null,
  category_slug text,
  title         jsonb not null default '{}'::jsonb,
  description   jsonb not null default '{}'::jsonb,
  featured      boolean not null default false,  -- მთავარ გვერდზე
  published     boolean not null default true,
  sort_order    int not null default 0,
  width         int,
  height        int,
  created_at    timestamptz not null default now()
);
create index if not exists gallery_sort_idx on public.gallery_images (sort_order);

-- ─── საიტის კონტენტი (key → JSON) ─────────────────────────────────────────
create table if not exists public.website_content (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
drop trigger if exists content_touch on public.website_content;
create trigger content_touch before update on public.website_content
  for each row execute function public.touch_updated_at();

-- ─── აქციები ──────────────────────────────────────────────────────────────
create table if not exists public.promotions (
  id               uuid primary key default gen_random_uuid(),
  title            jsonb not null default '{}'::jsonb,
  subtitle         jsonb not null default '{}'::jsonb,
  image_url        text,
  storage_path     text,
  link             text,
  discount_percent numeric(5, 2) check (discount_percent > 0 and discount_percent < 100),
  product_ids      uuid[] not null default '{}',
  starts_at        timestamptz,
  ends_at          timestamptz,
  active           boolean not null default false,
  show_on_home     boolean not null default true,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

-- ═══════════════════════════════════════════════════════════════════════════
--  Row Level Security
-- ═══════════════════════════════════════════════════════════════════════════
alter table public.admin_users       enable row level security;
alter table public.categories        enable row level security;
alter table public.products          enable row level security;
alter table public.product_images    enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.customer_requests enable row level security;
alter table public.gallery_images    enable row level security;
alter table public.website_content   enable row level security;
alter table public.promotions        enable row level security;

-- admin_users: ადმინს შეუძლია მხოლოდ წაკითხვა; დამატება მხოლოდ service-role-ით / SQL-ით
drop policy if exists "admins read admins" on public.admin_users;
create policy "admins read admins" on public.admin_users for select using (public.is_admin());

-- categories
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (active or public.is_admin());
drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- products
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (status = 'published' or public.is_admin());
drop policy if exists "admin write products" on public.products;
create policy "admin write products" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- product_images
drop policy if exists "public read product images" on public.product_images;
create policy "public read product images" on public.product_images for select using (
  public.is_admin() or exists (
    select 1 from public.products p where p.id = product_id and p.status = 'published'
  )
);
drop policy if exists "admin write product images" on public.product_images;
create policy "admin write product images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

-- orders / order_items / customer_requests — მხოლოდ ადმინი. საჯარო ჩაწერა ხდება სერვერიდან (service-role),
-- ამიტომ anon როლისთვის INSERT პოლიტიკა განზრახ არ არსებობს.
drop policy if exists "admin all orders" on public.orders;
create policy "admin all orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all order items" on public.order_items;
create policy "admin all order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all requests" on public.customer_requests;
create policy "admin all requests" on public.customer_requests for all using (public.is_admin()) with check (public.is_admin());

-- gallery
drop policy if exists "public read gallery" on public.gallery_images;
create policy "public read gallery" on public.gallery_images for select using (published or public.is_admin());
drop policy if exists "admin write gallery" on public.gallery_images;
create policy "admin write gallery" on public.gallery_images for all using (public.is_admin()) with check (public.is_admin());

-- website_content (საჯარო ტექსტები; საიდუმლო გასაღებები აქ არ ინახება — მხოლოდ .env-ში)
drop policy if exists "public read content" on public.website_content;
create policy "public read content" on public.website_content for select using (true);
drop policy if exists "admin write content" on public.website_content;
create policy "admin write content" on public.website_content for all using (public.is_admin()) with check (public.is_admin());

-- promotions
drop policy if exists "public read promotions" on public.promotions;
create policy "public read promotions" on public.promotions for select using (active or public.is_admin());
drop policy if exists "admin write promotions" on public.promotions;
create policy "admin write promotions" on public.promotions for all using (public.is_admin()) with check (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
--  Storage
-- ═══════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true,  5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('gallery',        'gallery',        true,  5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('site',           'site',           true,  5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('order-uploads',  'order-uploads',  false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- საჯარო ბაკეტები: კითხვა ყველას, ჩაწერა/წაშლა მხოლოდ ადმინს
drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects for select
  using (bucket_id in ('product-images', 'gallery', 'site'));

drop policy if exists "admin insert media" on storage.objects;
create policy "admin insert media" on storage.objects for insert
  with check (bucket_id in ('product-images', 'gallery', 'site') and public.is_admin());

drop policy if exists "admin update media" on storage.objects;
create policy "admin update media" on storage.objects for update
  using (bucket_id in ('product-images', 'gallery', 'site') and public.is_admin());

drop policy if exists "admin delete media" on storage.objects;
create policy "admin delete media" on storage.objects for delete
  using (bucket_id in ('product-images', 'gallery', 'site', 'order-uploads') and public.is_admin());

-- შეკვეთის ფოტოები პრივატულია: ატვირთვა მხოლოდ სერვერიდან (service-role), ნახვა მხოლოდ ადმინს
drop policy if exists "admin read order uploads" on storage.objects;
create policy "admin read order uploads" on storage.objects for select
  using (bucket_id = 'order-uploads' and public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
--  საწყისი კატეგორიები (TODO: ადმინ-პანელიდან შეცვალე/დაამატე)
-- ═══════════════════════════════════════════════════════════════════════════
insert into public.categories (slug, name, sort_order) values
  ('kaba',       '{"ka": "კაბები",          "en": "Dresses",         "ru": "Платья"}',          1),
  ('sagamos',    '{"ka": "საღამოს კაბები",  "en": "Evening dresses", "ru": "Вечерние платья"}', 2),
  ('kostiumi',   '{"ka": "კოსტიუმები",      "en": "Suits",           "ru": "Костюмы"}',         3),
  ('kvedabolo',  '{"ka": "ქვედაბოლოები",    "en": "Skirts",          "ru": "Юбки"}',            4),
  ('sharvali',   '{"ka": "შარვლები",        "en": "Trousers",        "ru": "Брюки"}',           5),
  ('bluza',      '{"ka": "ბლუზები",         "en": "Blouses",         "ru": "Блузки"}',          6),
  ('sportuli',   '{"ka": "სპორტული",        "en": "Sportswear",      "ru": "Спортивная одежда"}', 7),
  ('sabavshvo',  '{"ka": "საბავშვო",        "en": "Kids",            "ru": "Детская одежда"}',  8),
  ('erovnuli',   '{"ka": "ეროვნული სამოსი", "en": "National wear",   "ru": "Национальная одежда"}', 9)
on conflict (slug) do nothing;
