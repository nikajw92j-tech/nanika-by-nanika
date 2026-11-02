import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { orderStatusLabel, orderStatusTone } from '@/lib/admin-labels';
import type { Order, OrderStatus } from '@/lib/types';
import { formatDate, formatPrice } from '@/lib/utils';
import { OrdersChart } from '@/components/admin/OrdersChart';
import { Badge, PageHeader } from '@/components/admin/ui';

export const metadata = { title: 'მიმოხილვა' };

const PENDING: OrderStatus[] = ['confirmed', 'in_production', 'ready', 'shipped'];

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const since = new Date(Date.now() - 29 * 864e5);
  since.setHours(0, 0, 0, 0);

  const [products, published, orders, recent, viewed, lastMonth, requests] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('orders').select('status, payment_status, total'),
    supabase
      .from('orders')
      .select('id, order_number, customer_name, city, status, total, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('products').select('id, name, slug, view_count').order('view_count', { ascending: false }).limit(5),
    supabase.from('orders').select('created_at').gte('created_at', since.toISOString()),
    supabase.from('customer_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ]);

  const all = (orders.data ?? []) as Pick<Order, 'status' | 'payment_status' | 'total'>[];
  const count = (f: (o: (typeof all)[number]) => boolean) => all.filter(f).length;
  // შემოსავალი — მხოლოდ დადასტურებული, გადახდილი შეკვეთებიდან
  const revenue = all
    .filter((o) => o.payment_status === 'paid' && o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.total ?? 0), 0);

  const days = Array.from({ length: 30 }, (_, i) => new Date(since.getTime() + i * 864e5).toISOString().slice(0, 10));
  const perDay = days.map((date) => ({
    date,
    count: (lastMonth.data ?? []).filter((o) => new Date(o.created_at).toISOString().slice(0, 10) === date).length,
  }));

  const stats = [
    { label: 'სულ პროდუქტი', value: products.count ?? 0, href: '/admin/products' },
    { label: 'აქტიური პროდუქტი', value: published.count ?? 0, href: '/admin/products?status=published' },
    { label: 'სულ შეკვეთა', value: all.length, href: '/admin/orders' },
    { label: 'ახალი შეკვეთა', value: count((o) => o.status === 'new'), href: '/admin/orders?status=new', accent: true },
    { label: 'მიმდინარე', value: count((o) => PENDING.includes(o.status)), href: '/admin/orders?status=pending' },
    { label: 'დასრულებული', value: count((o) => o.status === 'completed'), href: '/admin/orders?status=completed' },
  ];
  const viewedList = viewed.data ?? [];
  const maxViews = Math.max(1, viewedList[0]?.view_count ?? 1);

  return (
    <>
      <PageHeader
        title="მიმოხილვა"
        subtitle="მაღაზიის მდგომარეობა ერთ ეკრანზე"
        actions={
          <Link href="/admin/products/new" className="a-btn-primary">
            + ახალი პროდუქტი
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="a-card sm:col-span-2 lg:row-span-2 lg:flex lg:flex-col lg:justify-between">
          <p className="a-muted text-sm">შემოსავალი</p>
          <p className="mt-2 font-serif text-5xl md:text-6xl">{formatPrice(revenue)}</p>
          <p className="a-muted mt-3 text-xs">მხოლოდ გადახდილად დადასტურებული შეკვეთები</p>
        </div>
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="a-card transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="a-muted text-sm">{s.label}</p>
            <p className={`mt-1 font-serif text-4xl ${s.accent && s.value > 0 ? 'text-[#8C6A3F] dark:text-gold' : ''}`}>
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      {(requests.count ?? 0) > 0 && (
        <Link href="/admin/orders?tab=requests" className="a-card mt-3 flex items-center justify-between text-sm hover:shadow-md">
          <span>
            💬 ახალი შეტყობინებები: <b>{requests.count}</b>
          </span>
          <span className="a-muted">ნახვა →</span>
        </Link>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="a-card lg:col-span-2">
          <h2 className="mb-4 font-medium">შეკვეთები — ბოლო 30 დღე</h2>
          <OrdersChart data={perDay} />
        </section>
        <section className="a-card">
          <h2 className="mb-4 font-medium">ყველაზე ნანახი პროდუქტები</h2>
          {viewedList.length ? (
            <ol className="space-y-3">
              {viewedList.map((p, i) => (
                <li key={p.id}>
                  <div className="flex justify-between gap-3 text-sm">
                    <Link href={`/admin/products/${p.id}`} className="truncate hover:underline">
                      {i + 1}. {(p.name as { ka?: string }).ka || p.slug}
                    </Link>
                    <span className="a-muted tabular-nums">{p.view_count}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-ink/[0.06] dark:bg-cream/10">
                    <div className="h-1.5 rounded-full bg-[#8C6A3F] dark:bg-gold" style={{ width: `${(p.view_count / maxViews) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="a-muted text-sm">ჯერ მონაცემები არ არის.</p>
          )}
        </section>
      </div>

      <section className="a-card mt-6 overflow-x-auto p-0 md:p-0">
        <div className="flex items-center justify-between p-5 pb-2">
          <h2 className="font-medium">ბოლო შეკვეთები</h2>
          <Link href="/admin/orders" className="a-muted text-sm hover:underline">
            ყველა →
          </Link>
        </div>
        {recent.data?.length ? (
          <table className="a-table w-full text-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>კლიენტი</th>
                <th className="hidden sm:table-cell">ქალაქი</th>
                <th>სტატუსი</th>
                <th className="text-right">ფასი</th>
                <th className="hidden md:table-cell">თარიღი</th>
              </tr>
            </thead>
            <tbody>
              {(recent.data as Order[]).map((o) => (
                <tr key={o.id} className="hover:bg-ink/[0.02] dark:hover:bg-cream/[0.03]">
                  <td>
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                      #{o.order_number}
                    </Link>
                  </td>
                  <td>{o.customer_name}</td>
                  <td className="hidden sm:table-cell">{o.city}</td>
                  <td>
                    <Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge>
                  </td>
                  <td className="text-right tabular-nums">{o.total != null ? formatPrice(o.total) : '—'}</td>
                  <td className="a-muted hidden md:table-cell">{formatDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="a-muted p-5 pt-2 text-sm">შეკვეთები ჯერ არ არის.</p>
        )}
      </section>
    </>
  );
}
