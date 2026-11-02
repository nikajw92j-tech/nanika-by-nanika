'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deletePromotion, savePromotion, togglePromotion } from '@/app/admin/actions/content';
import type { Localized, Promotion } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SingleImageField } from './ImageManager';
import { Badge, ConfirmButton, EmptyState, Field, LocalizedField, Toggle, useToast } from './ui';

type ProductLite = { id: string; name: string; price: number };

const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

function state(p: Promotion) {
  const now = Date.now();
  if (!p.active) return { label: 'გამორთული', tone: 'neutral' as const };
  if (p.starts_at && new Date(p.starts_at).getTime() > now) return { label: 'დაგეგმილი', tone: 'blue' as const };
  if (p.ends_at && new Date(p.ends_at).getTime() <= now) return { label: 'დასრულებული', tone: 'red' as const };
  return { label: 'აქტიური', tone: 'green' as const };
}

export function PromotionsManager({ promotions, products }: { promotions: Promotion[]; products: ProductLite[] }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<Promotion | 'new' | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      {!editing && (
        <button type="button" className="a-btn-primary" onClick={() => setEditing('new')}>
          + ახალი აქცია
        </button>
      )}
      {editing && (
        <PromotionForm
          key={editing === 'new' ? 'new' : editing.id}
          promotion={editing === 'new' ? null : editing}
          products={products}
          onDone={() => {
            setEditing(null);
            router.refresh();
          }}
          onCancel={() => setEditing(null)}
        />
      )}
      {promotions.length === 0 && !editing ? (
        <EmptyState title="აქციები ჯერ არ არის" text="შექმენი ბანერი მთავარი გვერდისთვის ან ფასდაკლება არჩეულ პროდუქტებზე." />
      ) : (
        <ul className="space-y-3">
          {promotions.map((p) => {
            const s = state(p);
            return (
              <li key={p.id} className="a-card flex flex-wrap items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- ადმინის მინიატურა */}
                {p.image_url ? <img src={p.image_url} alt="" className="h-14 w-20 rounded-lg object-cover" /> : <div className="h-14 w-20 rounded-lg bg-wine/80" />}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{p.title.ka}</p>
                  <p className="a-muted text-xs">
                    {p.discount_percent ? `−${p.discount_percent}% · ${p.product_ids.length} პროდუქტი · ` : ''}
                    {p.starts_at ? new Date(p.starts_at).toLocaleDateString('ka-GE') : '...'} → {p.ends_at ? new Date(p.ends_at).toLocaleDateString('ka-GE') : '...'}
                    {p.show_on_home && ' · მთავარზე'}
                  </p>
                </div>
                <Badge tone={s.tone}>{s.label}</Badge>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    className="a-btn-ghost text-xs"
                    onClick={() =>
                      start(async () => {
                        const r = await togglePromotion(p.id, !p.active);
                        if (!r.ok) return toast(r.error, 'error');
                        toast(p.active ? 'აქცია გამოირთო' : 'აქცია ჩაირთო');
                        router.refresh();
                      })
                    }
                  >
                    {p.active ? 'გამორთვა' : 'ჩართვა'}
                  </button>
                  <button type="button" className="a-btn-ghost text-xs" onClick={() => setEditing(p)}>
                    რედაქტ.
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function PromotionForm({ promotion, products, onDone, onCancel }: { promotion: Promotion | null; products: ProductLite[]; onDone: () => void; onCancel: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState<Localized>(promotion?.title ?? {});
  const [subtitle, setSubtitle] = useState<Localized>(promotion?.subtitle ?? {});
  const [image, setImage] = useState(promotion?.image_url ?? '');
  const [path, setPath] = useState<string | null>(promotion?.storage_path ?? null);
  const [link, setLink] = useState(promotion?.link ?? '/products');
  const [discount, setDiscount] = useState(promotion?.discount_percent != null ? String(promotion.discount_percent) : '');
  const [selected, setSelected] = useState<string[]>(promotion?.product_ids ?? []);
  const [startsAt, setStartsAt] = useState(toLocalInput(promotion?.starts_at ?? null));
  const [endsAt, setEndsAt] = useState(toLocalInput(promotion?.ends_at ?? null));
  const [active, setActive] = useState(promotion?.active ?? true);
  const [home, setHome] = useState(promotion?.show_on_home ?? true);
  const [q, setQ] = useState('');

  const submit = () =>
    start(async () => {
      const r = await savePromotion({
        id: promotion?.id,
        title: { ka: title.ka ?? '', en: title.en ?? '', ru: title.ru ?? '' },
        subtitle,
        image_url: image || null,
        storage_path: image ? path : null,
        link: link.trim() || null,
        discount_percent: discount.trim() ? Number(discount) : null,
        product_ids: selected,
        starts_at: fromLocalInput(startsAt),
        ends_at: fromLocalInput(endsAt),
        active,
        show_on_home: home,
        sort_order: promotion?.sort_order ?? 0,
      });
      if (!r.ok) return toast(r.error, 'error');
      toast('აქცია შენახულია — საიტი განახლდა');
      onDone();
    });

  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <section className="a-card space-y-5">
      <h2 className="font-medium">{promotion ? 'აქციის რედაქტირება' : 'ახალი აქცია'}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <LocalizedField label="სათაური" value={title} onChange={setTitle} required />
        <LocalizedField label="ქვესათაური" value={subtitle} onChange={setSubtitle} />
        <SingleImageField label="ბანერის ფოტო" value={image} onChange={(u, p) => { setImage(u); setPath(p); }} />
        <Field label="ბმული" hint="მაგ. /products ან /products/slug">
          <input className="a-input" value={link} onChange={(e) => setLink(e.target.value)} />
        </Field>
        <Field label="დაწყება">
          <input type="datetime-local" className="a-input" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </Field>
        <Field label="დასრულება">
          <input type="datetime-local" className="a-input" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </Field>
        <Field label="ფასდაკლება (%)" hint="ცარიელი = მხოლოდ ბანერი, ფასდაკლების გარეშე">
          <input type="number" min="1" max="99" className="a-input" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </Field>
        <div className="space-y-1">
          <Toggle label="აქტიური" checked={active} onChange={setActive} />
          <Toggle label="ბანერი მთავარ გვერდზე" checked={home} onChange={setHome} />
        </div>
      </div>
      {discount.trim() && (
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="a-label mb-0">პროდუქტები ფასდაკლებით ({selected.length})</span>
            <div className="flex gap-2">
              <input className="a-input w-48 py-1.5 text-xs" placeholder="ძებნა..." value={q} onChange={(e) => setQ(e.target.value)} />
              <button type="button" className="a-btn-ghost min-h-0 py-1.5 text-xs" onClick={() => setSelected(products.map((p) => p.id))}>ყველა</button>
              <button type="button" className="a-btn-ghost min-h-0 py-1.5 text-xs" onClick={() => setSelected([])}>გასუფთავება</button>
            </div>
          </div>
          <ul className="grid max-h-64 gap-1 overflow-y-auto rounded-xl border border-ink/10 p-2 dark:border-cream/10 sm:grid-cols-2">
            {filtered.map((p) => {
              const on = selected.includes(p.id);
              return (
                <li key={p.id}>
                  <label className={cn('flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm', on && 'bg-gold/10')}>
                    <span className="flex items-center gap-2">
                      <input type="checkbox" checked={on} onChange={() => setSelected(on ? selected.filter((x) => x !== p.id) : [...selected, p.id])} className="accent-[rgb(var(--gold))]" />
                      {p.name}
                    </span>
                    <span className="a-muted text-xs tabular-nums">
                      {p.price} ₾{discount && ` → ${Math.round(p.price * (1 - Number(discount) / 100))} ₾`}
                    </span>
                  </label>
                </li>
              );
            })}
            {filtered.length === 0 && <li className="a-muted p-2 text-sm">პროდუქტები არ არის.</li>}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap justify-between gap-2">
        {promotion ? (
          <ConfirmButton
            onConfirm={() =>
              start(async () => {
                const r = await deletePromotion(promotion.id);
                if (!r.ok) return toast(r.error, 'error');
                toast('აქცია წაიშალა');
                onDone();
              })
            }
          >
            წაშლა
          </ConfirmButton>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button type="button" className="a-btn-ghost" onClick={onCancel}>გაუქმება</button>
          <button type="button" className="a-btn-primary" disabled={pending} onClick={submit}>{pending ? 'ინახება...' : 'შენახვა'}</button>
        </div>
      </div>
    </section>
  );
}
