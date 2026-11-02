import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { measurementLabel, orderStatusLabel, orderStatusTone, paymentLabel, paymentTone } from '@/lib/admin-labels';
import type { Order } from '@/lib/types';
import { formatDate, formatPrice } from '@/lib/utils';
import { OrderEditor } from '@/components/admin/OrderEditor';
import { Badge, PageHeader } from '@/components/admin/ui';

export const metadata = { title: 'შეკვეთა' };

const methodLabel = { phone: 'ტელეფონი', whatsapp: 'WhatsApp', messenger: 'Messenger' };

export default async function OrderDetail({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const order = data as Order;

  // პრივატული ფოტოები — დროებითი (1 სთ) ხელმოწერილი ბმულებით, მხოლოდ ადმინისთვის
  const signed = order.reference_images.length
    ? (await supabase.storage.from('order-uploads').createSignedUrls(order.reference_images, 3600)).data ?? []
    : [];
  const digits = order.phone.replace(/\D/g, '');
  const wa = digits.length === 9 && digits.startsWith('5') ? `995${digits}` : digits;

  const info: [string, React.ReactNode][] = [
    ['კლიენტი', order.customer_name],
    ['ტელეფონი', <a key="p" href={`tel:${order.phone}`} className="underline">{order.phone}</a>],
    ['ქალაქი', order.city],
    ['კავშირის გზა', methodLabel[order.contact_method]],
    ['კატეგორია', order.category ?? '—'],
    ['ფერი / ქსოვილი', order.color ?? '—'],
    ['სასურველი ვადა', order.desired_date ?? '—'],
    ['თარიღი', formatDate(order.created_at)],
  ];

  return (
    <>
      <PageHeader
        title={`შეკვეთა #${order.order_number}`}
        subtitle={order.kind === 'product' ? 'კოლექციის პროდუქტი' : 'ინდივიდუალური შეკერვა'}
        actions={
          <>
            <Link href="/admin/orders" className="a-btn-ghost">← ყველა</Link>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="a-btn-ghost">WhatsApp</a>
            <a href={`tel:${order.phone}`} className="a-btn-primary">დარეკვა</a>
          </>
        }
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge tone={orderStatusTone[order.status]}>{orderStatusLabel[order.status]}</Badge>
        <Badge tone={paymentTone[order.payment_status]}>{paymentLabel[order.payment_status]}</Badge>
        <Badge tone="gold">{order.total != null ? formatPrice(order.total) : 'ფასი დასათვლელია'}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="a-card">
            <h2 className="mb-4 font-medium">დეტალები</h2>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {info.map(([k, v]) => (
                <div key={k}>
                  <dt className="a-muted text-xs">{k}</dt>
                  <dd className="mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {order.order_items && order.order_items.length > 0 && (
            <section className="a-card">
              <h2 className="mb-3 font-medium">არჩეული პროდუქტი</h2>
              {order.order_items.map((it) => (
                <div key={it.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    {it.product_slug ? <a href={`/products/${it.product_slug}`} target="_blank" rel="noreferrer" className="font-medium underline">{it.product_name}</a> : <span className="font-medium">{it.product_name}</span>}
                    <p className="a-muted text-xs">
                      ზომა: {it.custom_size ? 'ინდივიდუალური' : it.size ?? '—'} · ფერი: {it.color ?? '—'} · რაოდ.: {it.quantity}
                    </p>
                  </div>
                  {it.unit_price != null && <span className="tabular-nums">{formatPrice(it.unit_price)}</span>}
                </div>
              ))}
            </section>
          )}

          <section className="a-card">
            <h2 className="mb-3 font-medium">ზომები (სმ)</h2>
            {order.measurements_later && <p className="mb-2 text-sm text-[#8C6A3F] dark:text-gold">კლიენტი ზომებს მოგვიანებით გამოგზავნის</p>}
            {order.measurements && Object.keys(order.measurements).length ? (
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {Object.entries(order.measurements).map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-ink/[0.04] p-3 dark:bg-cream/5">
                    <dt className="a-muted text-xs">{measurementLabel[k] ?? k}</dt>
                    <dd className="font-serif text-2xl">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              !order.measurements_later && <p className="a-muted text-sm">ზომები არ არის მითითებული.</p>
            )}
          </section>

          {order.notes && (
            <section className="a-card">
              <h2 className="mb-2 font-medium">კლიენტის კომენტარი</h2>
              <p className="whitespace-pre-line break-words text-sm">{order.notes}</p>
            </section>
          )}

          <section className="a-card">
            <h2 className="mb-3 font-medium">ატვირთული ფოტოები ({signed.length})</h2>
            {signed.length ? (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {signed.map((s) =>
                  s.signedUrl ? (
                    <li key={s.path}>
                      <a href={s.signedUrl} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden rounded-xl bg-ink/5">
                        {/* eslint-disable-next-line @next/next/no-img-element -- ხელმოწერილი პრივატული ბმული */}
                        <img src={s.signedUrl} alt="რეფერენსი" className="h-full w-full object-cover transition hover:scale-105" />
                      </a>
                    </li>
                  ) : null,
                )}
              </ul>
            ) : (
              <p className="a-muted text-sm">ფოტო არ არის ატვირთული.</p>
            )}
          </section>
        </div>

        <div className="lg:col-span-2">
          <OrderEditor order={order} />
        </div>
      </div>
    </>
  );
}
