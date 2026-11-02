'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactNode } from 'react';
import { deleteCategory, saveCategory, saveContent } from '@/app/admin/actions/content';
import type { SiteContent } from '@/lib/content';
import type { Category, Localized } from '@/lib/types';
import { cn, slugify } from '@/lib/utils';
import { ChevronDown, Close, Plus } from '@/components/ui/icons';
import { SingleImageField } from './ImageManager';
import { ConfirmButton, Field, LocalizedField, Toggle, useToast } from './ui';

/* ─── საერთო ─── */
export function useSection<K extends keyof SiteContent>(key: K, initial: SiteContent[K]) {
  const toast = useToast();
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [pending, start] = useTransition();
  const save = () =>
    start(async () => {
      const r = await saveContent(key, value);
      if (!r.ok) return toast(r.error, 'error');
      toast('შენახულია — საიტი განახლდა');
      router.refresh();
    });
  return { value, setValue, save, pending };
}

export function SectionCard({ title, hint, children, onSave, pending }: { title: string; hint?: string; children: ReactNode; onSave: () => void; pending: boolean }) {
  return (
    <section className="a-card space-y-4">
      <div>
        <h2 className="font-medium">{title}</h2>
        {hint && <p className="a-muted text-sm">{hint}</p>}
      </div>
      {children}
      <div className="flex justify-end border-t border-ink/[0.07] pt-4 dark:border-cream/10">
        <button type="button" onClick={onSave} disabled={pending} className="a-btn-primary">
          {pending ? 'ინახება...' : 'შენახვა'}
        </button>
      </div>
    </section>
  );
}

/** მასივის რედაქტორი: დამატება, წაშლა, გადაადგილება */
function ListEditor<T>({ items, onChange, make, render, addLabel, title }: { items: T[]; onChange: (v: T[]) => void; make: () => T; render: (item: T, set: (v: T) => void, i: number) => ReactNode; addLabel: string; title: (item: T, i: number) => string }) {
  const [open, setOpen] = useState<number | null>(null);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const n = [...items];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
    setOpen(j);
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-ink/10 dark:border-cream/10">
          <div className="flex items-center gap-2 px-3 py-2">
            <button type="button" className="flex flex-1 items-center gap-2 text-left text-sm" onClick={() => setOpen(open === i ? null : i)}>
              <ChevronDown width={16} height={16} className={cn('transition-transform', open === i && 'rotate-180')} />
              <span className="truncate">{title(item, i) || `#${i + 1}`}</span>
            </button>
            <button type="button" className="a-btn-ghost h-8 min-h-0 w-8 p-0 text-xs" onClick={() => move(i, -1)} aria-label="ზემოთ">↑</button>
            <button type="button" className="a-btn-ghost h-8 min-h-0 w-8 p-0 text-xs" onClick={() => move(i, 1)} aria-label="ქვემოთ">↓</button>
            <button type="button" className="a-btn-ghost h-8 min-h-0 w-8 p-0" onClick={() => onChange(items.filter((_, k) => k !== i))} aria-label="წაშლა">
              <Close width={14} height={14} />
            </button>
          </div>
          {open === i && <div className="space-y-3 border-t border-ink/10 p-3 dark:border-cream/10">{render(item, (v) => onChange(items.map((x, k) => (k === i ? v : x))), i)}</div>}
        </div>
      ))}
      <button type="button" className="a-btn-ghost text-xs" onClick={() => { onChange([...items, make()]); setOpen(items.length); }}>
        <Plus width={14} height={14} /> {addLabel}
      </button>
    </div>
  );
}

const ka = (l: Localized) => l.ka ?? '';

/* ─── სექციები ─── */
function HeroEditor({ initial }: { initial: SiteContent['hero'] }) {
  const { value: v, setValue: set, save, pending } = useSection('hero', initial);
  return (
    <SectionCard title="მთავარი ბანერი (Hero)" onSave={save} pending={pending}>
      <LocalizedField label="ზედა წარწერა" value={v.eyebrow} onChange={(eyebrow) => set({ ...v, eyebrow })} />
      <LocalizedField label="სათაური" value={v.title} onChange={(title) => set({ ...v, title })} />
      <LocalizedField label="აღწერა" value={v.subtitle} onChange={(subtitle) => set({ ...v, subtitle })} multiline />
      <SingleImageField label="Hero ფოტო" value={v.images[0] ?? ''} onChange={(url) => set({ ...v, images: url ? [url, ...v.images.slice(1)] : v.images.slice(1) })} />
    </SectionCard>
  );
}

function AboutEditor({ initial }: { initial: SiteContent['about'] }) {
  const { value: v, setValue: set, save, pending } = useSection('about', initial);
  return (
    <SectionCard title="ჩვენ შესახებ" onSave={save} pending={pending}>
      <LocalizedField label="სათაური (მთავარ გვერდზე)" value={v.title} onChange={(title) => set({ ...v, title })} />
      <LocalizedField label="მოკლე ტექსტი (მთავარ გვერდზე)" value={v.text} onChange={(text) => set({ ...v, text })} multiline rows={4} />
      <LocalizedField label="სრული ისტორია (/about)" value={v.story} onChange={(story) => set({ ...v, story })} multiline rows={7} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SingleImageField label="ატელიეს ფოტო" value={v.image} onChange={(image) => set({ ...v, image })} />
        <SingleImageField label="დიზაინერის ფოტო" value={v.designerImage} onChange={(designerImage) => set({ ...v, designerImage })} />
      </div>
    </SectionCard>
  );
}

function ServicesEditor({ initial }: { initial: SiteContent['services'] }) {
  const { value: v, setValue: set, save, pending } = useSection('services', initial);
  return (
    <SectionCard title="შეკერვის სერვისები" hint="/services გვერდი — ფასები და ვადები" onSave={save} pending={pending}>
      <ListEditor
        items={v.items}
        onChange={(items) => set({ ...v, items })}
        make={() => ({ title: {}, text: {}, price: {}, time: {} })}
        title={(s) => ka(s.title)}
        addLabel="სერვისის დამატება"
        render={(s, setS) => (
          <>
            <LocalizedField label="სახელი" value={s.title} onChange={(title) => setS({ ...s, title })} />
            <LocalizedField label="აღწერა" value={s.text} onChange={(text) => setS({ ...s, text })} multiline rows={2} />
            <div className="grid gap-3 sm:grid-cols-2">
              <LocalizedField label="ფასი (მაგ. 120 ₾-დან)" value={s.price} onChange={(price) => setS({ ...s, price })} />
              <LocalizedField label="ვადა" value={s.time} onChange={(time) => setS({ ...s, time })} />
            </div>
          </>
        )}
      />
      <h3 className="pt-2 text-sm font-medium">დამატებითი სერვისები</h3>
      <ListEditor
        items={v.extras}
        onChange={(extras) => set({ ...v, extras })}
        make={() => ({ title: {}, text: {} })}
        title={(s) => ka(s.title)}
        addLabel="დამატება"
        render={(s, setS) => (
          <>
            <LocalizedField label="სახელი" value={s.title} onChange={(title) => setS({ ...s, title })} />
            <LocalizedField label="აღწერა" value={s.text} onChange={(text) => setS({ ...s, text })} multiline rows={2} />
          </>
        )}
      />
    </SectionCard>
  );
}

function FaqEditor({ initial }: { initial: SiteContent['faq'] }) {
  const { value: v, setValue: set, save, pending } = useSection('faq', initial);
  return (
    <SectionCard title="ხშირად დასმული კითხვები" onSave={save} pending={pending}>
      <ListEditor
        items={v.items}
        onChange={(items) => set({ items })}
        make={() => ({ q: {}, a: {} })}
        title={(f) => ka(f.q)}
        addLabel="კითხვის დამატება"
        render={(f, setF) => (
          <>
            <LocalizedField label="კითხვა" value={f.q} onChange={(q) => setF({ ...f, q })} />
            <LocalizedField label="პასუხი" value={f.a} onChange={(a) => setF({ ...f, a })} multiline rows={4} />
          </>
        )}
      />
    </SectionCard>
  );
}

function StatsEditor({ initial }: { initial: SiteContent['stats'] }) {
  const { value: v, setValue: set, save, pending } = useSection('stats', initial);
  return (
    <SectionCard title="რიცხვები (counter)" hint="⚠️ მხოლოდ რეალური მონაცემები — მაგ. შეკერილი ნაწარმი, წლები" onSave={save} pending={pending}>
      <ListEditor
        items={v.items}
        onChange={(items) => set({ items })}
        make={() => ({ value: 0, suffix: '+', label: {} })}
        title={(s) => `${s.value}${s.suffix} — ${ka(s.label)}`}
        addLabel="რიცხვის დამატება"
        render={(s, setS) => (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="რიცხვი"><input type="number" min="0" className="a-input" value={s.value} onChange={(e) => setS({ ...s, value: Number(e.target.value) })} /></Field>
              <Field label="სუფიქსი (+, %)"><input className="a-input" maxLength={5} value={s.suffix} onChange={(e) => setS({ ...s, suffix: e.target.value })} /></Field>
            </div>
            <LocalizedField label="წარწერა" value={s.label} onChange={(label) => setS({ ...s, label })} />
          </>
        )}
      />
    </SectionCard>
  );
}

function ReviewsEditor({ initial }: { initial: SiteContent['reviews'] }) {
  const { value: v, setValue: set, save, pending } = useSection('reviews', initial);
  return (
    <SectionCard title="შეფასებები" hint="⚠️ დაამატე მხოლოდ კლიენტების რეალური კომენტარები (მაგ. Facebook-იდან)" onSave={save} pending={pending}>
      <ListEditor
        items={v.items}
        onChange={(items) => set({ items })}
        make={() => ({ name: '', text: {}, source: 'Facebook' })}
        title={(r) => r.name}
        addLabel="შეფასების დამატება"
        render={(r, setR) => (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="სახელი"><input className="a-input" value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} /></Field>
              <Field label="წყარო"><input className="a-input" value={r.source} onChange={(e) => setR({ ...r, source: e.target.value })} /></Field>
            </div>
            <LocalizedField label="ტექსტი" value={r.text} onChange={(text) => setR({ ...r, text })} multiline rows={3} />
          </>
        )}
      />
    </SectionCard>
  );
}

export function ContactEditor({ initial }: { initial: SiteContent['contact'] }) {
  const { value: v, setValue: set, save, pending } = useSection('contact', initial);
  return (
    <SectionCard title="საკონტაქტო ინფორმაცია" onSave={save} pending={pending}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ტელეფონი"><input className="a-input" value={v.phone} onChange={(e) => set({ ...v, phone: e.target.value })} /></Field>
        <Field label="WhatsApp (ციფრები, 995...)"><input className="a-input" inputMode="numeric" value={v.whatsapp} onChange={(e) => set({ ...v, whatsapp: e.target.value.replace(/\D/g, '') })} /></Field>
        <Field label="ელ-ფოსტა"><input className="a-input" type="email" value={v.email} onChange={(e) => set({ ...v, email: e.target.value })} /></Field>
        <Field label="Google Maps embed URL" hint="ცარიელი = რუკა არ ჩანს"><input className="a-input" value={v.mapEmbedUrl} onChange={(e) => set({ ...v, mapEmbedUrl: e.target.value })} placeholder="https://www.google.com/maps/embed?..." /></Field>
      </div>
      <LocalizedField label="მისამართი" value={v.address} onChange={(address) => set({ ...v, address })} />
      <LocalizedField label="სამუშაო საათები" value={v.hours} onChange={(hours) => set({ ...v, hours })} />
    </SectionCard>
  );
}

export function SocialEditor({ initial }: { initial: SiteContent['social'] }) {
  const { value: v, setValue: set, save, pending } = useSection('social', initial);
  const f = (k: keyof typeof v, label: string, ph = 'https://') => (
    <Field label={label}><input className="a-input" value={v[k]} placeholder={ph} onChange={(e) => set({ ...v, [k]: e.target.value })} /></Field>
  );
  return (
    <SectionCard title="სოციალური ქსელები" onSave={save} pending={pending}>
      <div className="grid gap-4 sm:grid-cols-2">
        {f('facebook', 'Facebook')}
        {f('instagram', 'Instagram')}
        {f('instagramHandle', 'Instagram სახელი', '@...')}
        {f('messenger', 'Messenger (m.me/...)')}
        {f('tiktok', 'TikTok')}
      </div>
    </SectionCard>
  );
}

export function DeliveryEditor({ initial }: { initial: SiteContent['delivery'] }) {
  const { value: v, setValue: set, save, pending } = useSection('delivery', initial);
  return (
    <SectionCard title="მიწოდება და ვადები" onSave={save} pending={pending}>
      <LocalizedField label="მიწოდების ინფორმაცია" value={v.text} onChange={(text) => set({ ...v, text })} multiline rows={2} />
      <LocalizedField label="შეკერვის საშუალო ვადა" value={v.sewingTime} onChange={(sewingTime) => set({ ...v, sewingTime })} />
      <LocalizedField label="ფასის შენიშვნა" value={v.priceNote} onChange={(priceNote) => set({ ...v, priceNote })} />
    </SectionCard>
  );
}

function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [items, setItems] = useState(categories);
  const blank: Category = { id: '', slug: '', name: {}, image_url: null, sort_order: categories.length + 1, active: true };
  const [draft, setDraft] = useState<Category | null>(null);

  const save = (c: Category) =>
    start(async () => {
      const r = await saveCategory({
        id: c.id || undefined,
        slug: c.slug,
        name: { ka: c.name.ka ?? '', en: c.name.en ?? '', ru: c.name.ru ?? '' },
        image_url: c.image_url || null,
        sort_order: c.sort_order,
        active: c.active,
      });
      if (!r.ok) return toast(r.error, 'error');
      toast('კატეგორია შენახულია');
      setDraft(null);
      router.refresh();
    });

  const row = (c: Category, set: (c: Category) => void) => (
    <div className="grid gap-3 md:grid-cols-[1fr_160px_100px]">
      <LocalizedField label="სახელი" value={c.name} onChange={(name) => set({ ...c, name, slug: c.id ? c.slug : slugify(name.en || name.ka || '') })} required />
      <Field label="slug"><input className="a-input font-mono" value={c.slug} onChange={(e) => set({ ...c, slug: slugify(e.target.value) })} /></Field>
      <Field label="რიგი"><input type="number" className="a-input" value={c.sort_order} onChange={(e) => set({ ...c, sort_order: Number(e.target.value) })} /></Field>
      <SingleImageField label="ფოტო (მთავარ გვერდზე)" value={c.image_url ?? ''} onChange={(u) => set({ ...c, image_url: u || null })} />
      <div className="md:col-span-2"><Toggle label="აქტიური" checked={c.active} onChange={(active) => set({ ...c, active })} /></div>
    </div>
  );

  return (
    <section className="a-card space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medium">კატეგორიები</h2>
          <p className="a-muted text-sm">გამოიყენება პროდუქტებში, გალერეაში და შეკვეთის ფორმაში</p>
        </div>
        {!draft && <button type="button" className="a-btn-primary text-xs" onClick={() => setDraft(blank)}>+ ახალი</button>}
      </div>
      {draft && (
        <div className="space-y-3 rounded-xl border border-gold/40 p-3">
          {row(draft, setDraft)}
          <div className="flex justify-end gap-2">
            <button type="button" className="a-btn-ghost" onClick={() => setDraft(null)}>გაუქმება</button>
            <button type="button" className="a-btn-primary" disabled={pending} onClick={() => save(draft)}>შენახვა</button>
          </div>
        </div>
      )}
      <ListEditorCats items={items} setItems={setItems} row={row} onSave={save} onDelete={(id) => start(async () => { const r = await deleteCategory(id); if (!r.ok) return toast(r.error, 'error'); toast('წაიშალა'); setItems((l) => l.filter((x) => x.id !== id)); router.refresh(); })} pending={pending} />
    </section>
  );
}

function ListEditorCats({ items, setItems, row, onSave, onDelete, pending }: { items: Category[]; setItems: (f: (l: Category[]) => Category[]) => void; row: (c: Category, set: (c: Category) => void) => ReactNode; onSave: (c: Category) => void; onDelete: (id: string) => void; pending: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className="space-y-2">
      {items.map((c) => (
        <li key={c.id} className="rounded-xl border border-ink/10 dark:border-cream/10">
          <button type="button" className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm" onClick={() => setOpen(open === c.id ? null : c.id)}>
            <span>{c.name.ka} <span className="a-muted font-mono text-xs">/{c.slug}</span>{!c.active && <span className="a-muted"> · გამორთული</span>}</span>
            <ChevronDown width={16} height={16} className={cn('transition-transform', open === c.id && 'rotate-180')} />
          </button>
          {open === c.id && (
            <div className="space-y-3 border-t border-ink/10 p-3 dark:border-cream/10">
              {row(c, (n) => setItems((l) => l.map((x) => (x.id === c.id ? n : x))))}
              <div className="flex justify-between gap-2">
                <ConfirmButton onConfirm={() => onDelete(c.id)}>წაშლა</ConfirmButton>
                <button type="button" className="a-btn-primary" disabled={pending} onClick={() => onSave(c)}>შენახვა</button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ─── ჩანართები ─── */
const TABS = [
  { id: 'hero', label: 'მთავარი ბანერი' },
  { id: 'about', label: 'ჩვენ შესახებ' },
  { id: 'services', label: 'სერვისები' },
  { id: 'faq', label: 'FAQ' },
  { id: 'reviews', label: 'შეფასებები' },
  { id: 'stats', label: 'რიცხვები' },
  { id: 'categories', label: 'კატეგორიები' },
  { id: 'contact', label: 'კონტაქტი' },
  { id: 'social', label: 'სოც. ქსელები' },
  { id: 'delivery', label: 'მიწოდება' },
  { id: 'home', label: 'მთავარი გვერდი' },
] as const;
type Tab = (typeof TABS)[number]['id'];

export function ContentEditor({ content, categories, initialTab }: { content: SiteContent; categories: Category[]; initialTab?: string }) {
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.id === initialTab) ? (initialTab as Tab) : 'hero');
  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="კონტენტის სექციები">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={cn('shrink-0 rounded-xl px-3 py-2 text-left text-sm transition', tab === t.id ? 'bg-white font-medium shadow-sm dark:bg-cream/10' : 'a-muted hover:bg-ink/[0.04] dark:hover:bg-cream/5')}>
            {t.label}
          </button>
        ))}
      </nav>
      <div className="min-w-0">
        {tab === 'hero' && <HeroEditor initial={content.hero} />}
        {tab === 'about' && <AboutEditor initial={content.about} />}
        {tab === 'services' && <ServicesEditor initial={content.services} />}
        {tab === 'faq' && <FaqEditor initial={content.faq} />}
        {tab === 'reviews' && <ReviewsEditor initial={content.reviews} />}
        {tab === 'stats' && <StatsEditor initial={content.stats} />}
        {tab === 'categories' && <CategoriesManager categories={categories} />}
        {tab === 'contact' && <ContactEditor initial={content.contact} />}
        {tab === 'social' && <SocialEditor initial={content.social} />}
        {tab === 'delivery' && <DeliveryEditor initial={content.delivery} />}
        {tab === 'home' && (
          <section className="a-card space-y-3 text-sm">
            <h2 className="font-medium">მთავარი გვერდის ბლოკები</h2>
            <ul className="space-y-2">
              <li><Link className="underline" href="/admin/products">რჩეული პროდუქტები</Link> — პროდუქტების სიაში მონიშნე ★</li>
              <li><Link className="underline" href="/admin/gallery">მთავარი გვერდის გალერეა</Link> — გალერეაში მონიშნე ★</li>
              <li><Link className="underline" href="/admin/promotions">სარეკლამო ბანერები</Link> — აქციებში ჩართე „მთავარ გვერდზე“</li>
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
