import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { orderStatusLabel, orderStatusTone, paymentLabel, paymentTone, quoteLabel } from '@/lib/admin-labels';
import { ORDER_STATUSES, type CustomerRequest, type Order } from '@/lib/types';
import { cn, formatDate, formatPrice } from '@/lib/utils';
import { RequestActions } from '@/components/admin/OrderEditor';
import { Badge, EmptyState, PageHeader } from '@/components/admin/ui';

export const metadata = { title: 'შეკვეთები' };

type Search = { q?: string; status?: string; payment?: string; tab?: string };

export default async function OrdersAdmin({ searchParams }: { searchParams: Search }) {
  const { supabase } = await requireAdmin();
  const tab = searchParams.tab === 'requests' ? 'requests' : 'orders';

  const { count: newRequests } = await supabase.from('customer_requests').select('id', { count: 'exact', head: true }).eq('status', 'new');

  const tabs = (
    <div className="mb-5 flex gap-1 rounded-xl bg-ink/[0.05] p-1 dark:bg-cream/10 sm:w-fit">
      {[
        { id: 'orders', label: 'შეკვეთები', href: '/admin/orders' },
        { id: 'requests', label: `შეტყობინებები${newRequests ? ` (${newRequests})` : ''}`, href: '/admin/orders?tab=requests' },
      ].map((t) => (
        <Link key={t.id} href={t.href} className={cn('flex-1 rounded-lg px-4 py-2 text-center text-sm', tab === t.id ? 'bg-white font-medium shadow-sm dark:bg-[#141210]' : 'a-muted')}>
          {t.label}
        </Link>
      ))}
    </div>
  );

  if (tab === 'requests') {
    const { data } = await supabase.from('customer_requests').select('*').order('created_at', { ascending: false }).limit(200);
    const list = (data ?? []) as CustomerRequest[];
    return (
      <>
        <PageHeader title="შეკვეთები" />
        {tabs}
        {list.length === 0 ? (
          <EmptyState title="შეტყობინებები არ არის" />
        ) : (
          <ul className="space-y-3">
            {list.map((r) => (
              <li key={r.id} className={cn('a-card', r.status === 'archived' && 'opacity-60')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{r.name} · <a href={`tel:${r.phone}`} className="underline">{r.phone}</a></p>
                    <p className="a-muted text-xs">{formatDate(r.created_at)}</p>
                  </div>
                  <RequestActions id={r.id} status={r.status} />
                </div>
                <p className="mt-3 whitespace-pre-line text-sm">{r.message}</p>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  let query = supabase.from('orders').select('*, order_items(product_name, size, color)').order('created_at', { ascending: false }).limit(300);
  if (searchParams.status === 'pending') query = query.in('status', ['confirmed', 'in_production', 'ready', 'shipped']);
  else if (searchParams.status && (ORDER_STATUSES as readonly string[]).includes(searchParams.status)) query = query.eq('status', searchParams.status);
  if (searchParams.payment && ['unpaid', 'paid', 'refunded'].includes(searchParams.payment)) query = query.eq('payment_status', searchParams.payment);
  const q = searchParams.q?.trim().replace(/[%,()]/g, '').slice(0, 60);
  if (q) {
    query = /^\d+$/.test(q)
      ? query.or(`order_number.eq.${q},phone.ilike.%${q}%`)
      : query.or(`customer_name.ilike.%${q}%,city.ilike.%${q}%,phone.ilike.%${q}%`);
  }
  const { data } = await query;
  const list = (data ?? []) as Order[];

  return (
    <>
      <PageHeader title="შეკვეთები" subtitle={`${list.length} შეკვეთა`} />
      {tabs}
      <form className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input name="q" defaultValue={searchParams.q} placeholder="სახელი, ტელეფონი, ქალაქი ან #ნომერი" className="a-input sm:max-w-xs" />
        <select name="status" defaultValue={searchParams.status ?? ''} className="a-input sm:w-48">
          <option value="">ყველა სტატუსი</option>
          <option value="pending">მიმდინარე (ყველა)</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{orderStatusLabel[s]}</option>)}
        </select>
        <select name="payment" defaultValue={searchParams.payment ?? ''} className="a-input sm:w-44">
          <option value="">ყველა გადახდა</option>
          <option value="unpaid">გადაუხდელი</option>
          <option value="paid">გადახდილი</option>
          <option value="refunded">დაბრუნებული</option>
        </select>
        <button className="a-btn-ghost">ფილტრი</button>
      </form>

      {list.length === 0 ? (
        <EmptyState title="შეკვეთები ვერ მოიძებნა" text="საიტიდან გაგზავნილი შეკვეთები აქ გამოჩნდება." />
      ) : (
        <>
          {/* მობილური — ბარათები */}
          <ul className="space-y-3 md:hidden">
            {list.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="a-card block">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">#{o.order_number} · {o.customer_name}</span>
                    <Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge>
                  </div>
                  <p className="a-muted mt-1 text-sm">{o.order_items?.[0]?.product_name ?? o.category ?? 'ინდივიდუალური'} · {o.city}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span>{o.total != null ? formatPrice(o.total) : quoteLabel[o.quote_status]}</span>
                    <Badge tone={paymentTone[o.payment_status]}>{paymentLabel[o.payment_status]}</Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="a-card hidden overflow-x-auto p-0 md:block md:p-0">
            <table className="a-table w-full text-sm">
              <thead>
                <tr><th>#</th><th>კლიენტი</th><th>პროდუქტი</th><th>ქალაქი</th><th className="text-right">ფასი</th><th>სტატუსი</th><th>გადახდა</th><th>თარიღი</th></tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id} className={cn('hover:bg-ink/[0.02] dark:hover:bg-cream/[0.03]', o.status === 'new' && 'bg-gold/[0.06]')}>
                    <td><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">#{o.order_number}</Link></td>
                    <td>
                      <Link href={`/admin/orders/${o.id}`} className="hover:underline">{o.customer_name}</Link>
                      <div className="a-muted text-xs">{o.phone}</div>
                    </td>
                    <td className="max-w-[200px] truncate">{o.order_items?.[0]?.product_name ?? (o.category ? `ინდივ. · ${o.category}` : 'ინდივიდუალური')}</td>
                    <td>{o.city}</td>
                    <td className="whitespace-nowrap text-right tabular-nums">{o.total != null ? formatPrice(o.total) : <span className="a-muted text-xs">{quoteLabel[o.quote_status]}</span>}</td>
                    <td><Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge></td>
                    <td><Badge tone={paymentTone[o.payment_status]}>{paymentLabel[o.payment_status]}</Badge></td>
                    <td className="a-muted whitespace-nowrap">{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
