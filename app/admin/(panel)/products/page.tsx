import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { productStatusLabel } from '@/lib/admin-labels';
import type { Category, Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { ProductRowActions } from '@/components/admin/ProductRowActions';
import { Badge, EmptyState, PageHeader } from '@/components/admin/ui';

export const metadata = { title: 'პროდუქტები' };

export default async function ProductsAdmin({ searchParams }: { searchParams: { q?: string; status?: string; category?: string } }) {
  const { supabase } = await requireAdmin();
  let query = supabase.from('products').select('*, product_images(url, is_cover, sort_order)').order('created_at', { ascending: false });
  if (searchParams.status && ['draft', 'published', 'hidden'].includes(searchParams.status)) query = query.eq('status', searchParams.status);
  if (searchParams.category) query = query.eq('category_id', searchParams.category);
  const q = searchParams.q?.trim().slice(0, 60);
  if (q) query = query.or(`slug.ilike.%${q.replace(/[%,()]/g, '')}%,name->>ka.ilike.%${q.replace(/[%,()]/g, '')}%`);

  const [{ data: products }, { data: categories }] = await Promise.all([query, supabase.from('categories').select('*').order('sort_order')]);
  const list = (products ?? []) as Product[];
  const cats = (categories ?? []) as Category[];

  return (
    <>
      <PageHeader
        title="პროდუქტები"
        subtitle={`${list.length} პროდუქტი`}
        actions={
          <>
            <Link href="/admin/content?tab=categories" className="a-btn-ghost">კატეგორიები</Link>
            <Link href="/admin/products/new" className="a-btn-primary">+ ახალი პროდუქტი</Link>
          </>
        }
      />
      <form className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input name="q" defaultValue={searchParams.q} placeholder="ძებნა სახელით ან slug-ით..." className="a-input sm:max-w-xs" />
        <select name="status" defaultValue={searchParams.status ?? ''} className="a-input sm:w-44">
          <option value="">ყველა სტატუსი</option>
          <option value="published">გამოქვეყნებული</option>
          <option value="draft">მონახაზი</option>
          <option value="hidden">დამალული</option>
        </select>
        <select name="category" defaultValue={searchParams.category ?? ''} className="a-input sm:w-48">
          <option value="">ყველა კატეგორია</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name.ka}</option>)}
        </select>
        <button className="a-btn-ghost">ფილტრი</button>
      </form>

      {list.length === 0 ? (
        <EmptyState title="პროდუქტები ჯერ არ არის" text="დაამატე პირველი პროდუქტი — ის ავტომატურად გამოჩნდება საიტზე /products გვერდზე." action={<Link href="/admin/products/new" className="a-btn-primary">+ ახალი პროდუქტი</Link>} />
      ) : (
        <div className="a-card overflow-x-auto p-0 md:p-0">
          <table className="a-table w-full text-sm">
            <thead>
              <tr><th></th><th>სახელი</th><th className="hidden md:table-cell">კატეგორია</th><th className="text-right">ფასი</th><th>სტატუსი</th><th className="hidden sm:table-cell text-right">ნახვა</th><th></th></tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const imgs = [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
                const cover = imgs.find((i) => i.is_cover)?.url ?? imgs[0]?.url;
                return (
                  <tr key={p.id} className="hover:bg-ink/[0.02] dark:hover:bg-cream/[0.03]">
                    <td className="w-14">
                      <div className="h-14 w-11 overflow-hidden rounded-lg bg-ink/5 dark:bg-cream/10">
                        {/* eslint-disable-next-line @next/next/no-img-element -- ადმინის მინიატურა */}
                        {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
                      </div>
                    </td>
                    <td>
                      <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">{p.name.ka || p.slug}</Link>
                      <div className="a-muted text-xs">{p.featured && '★ რჩეული · '}{p.is_new && 'ახალი · '}{p.slug}</div>
                    </td>
                    <td className="hidden md:table-cell">{cats.find((c) => c.id === p.category_id)?.name.ka ?? '—'}</td>
                    <td className="whitespace-nowrap text-right tabular-nums">
                      {p.discounted_price != null ? <><s className="a-muted mr-1">{formatPrice(p.price)}</s>{formatPrice(p.discounted_price)}</> : formatPrice(p.price)}
                    </td>
                    <td><Badge tone={p.status === 'published' ? 'green' : p.status === 'draft' ? 'neutral' : 'red'}>{productStatusLabel[p.status]}</Badge></td>
                    <td className="a-muted hidden text-right tabular-nums sm:table-cell">{p.view_count}</td>
                    <td><ProductRowActions id={p.id} status={p.status} featured={p.featured} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
