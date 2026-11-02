'use client';

import { useState, useTransition } from 'react';
import { changePassword } from '@/app/admin/actions/auth';
import type { SiteContent } from '@/lib/content';
import { Close, Plus } from '@/components/ui/icons';
import { ContactEditor, DeliveryEditor, SectionCard, SocialEditor, useSection } from './ContentEditor';
import { Field, LocalizedField, useToast } from './ui';

function StoreSettings({ initial }: { initial: SiteContent['settings'] }) {
  const { value: v, setValue: set, save, pending } = useSection('settings', initial);
  const setOpt = (i: number, patch: Partial<SiteContent['settings']['deliveryOptions'][number]>) =>
    set({ ...v, deliveryOptions: v.deliveryOptions.map((o, k) => (k === i ? { ...o, ...patch } : o)) });
  return (
    <SectionCard title="მაღაზია" onSave={save} pending={pending}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="მაღაზიის სახელი">
          <input className="a-input" value={v.storeName} onChange={(e) => set({ ...v, storeName: e.target.value })} />
        </Field>
        <Field label="ვალუტა" hint="ყველა ფასი ლარშია">
          <input className="a-input" value="GEL (₾)" disabled />
        </Field>
      </div>
      <LocalizedField label="შეკერვის საშუალო ვადა" value={v.productionTime} onChange={(productionTime) => set({ ...v, productionTime })} />
      <div>
        <span className="a-label">მიწოდების ვარიანტები და ფასები</span>
        <ul className="space-y-3">
          {v.deliveryOptions.map((o, i) => (
            <li key={i} className="grid gap-3 rounded-xl border border-ink/10 p-3 dark:border-cream/10 md:grid-cols-[1fr_1fr_120px_auto]">
              <LocalizedField label="ზონა" value={o.name} onChange={(name) => setOpt(i, { name })} />
              <LocalizedField label="ვადა" value={o.time} onChange={(time) => setOpt(i, { time })} />
              <Field label="ფასი (₾)">
                <input type="number" min="0" step="0.5" className="a-input" value={o.price ?? ''} placeholder="—" onChange={(e) => setOpt(i, { price: e.target.value === '' ? null : Number(e.target.value) })} />
              </Field>
              <button type="button" className="a-btn-ghost h-10 w-10 self-end p-0" aria-label="წაშლა" onClick={() => set({ ...v, deliveryOptions: v.deliveryOptions.filter((_, k) => k !== i) })}>
                <Close width={16} height={16} />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="a-btn-ghost mt-2 text-xs" onClick={() => set({ ...v, deliveryOptions: [...v.deliveryOptions, { name: {}, time: {}, price: null }] })}>
          <Plus width={14} height={14} /> ზონის დამატება
        </button>
      </div>
      <Field label="უფასო მიწოდება ... ₾-დან" hint="ცარიელი = არ არის">
        <input type="number" min="0" className="a-input max-w-[200px]" value={v.freeDeliveryFrom ?? ''} onChange={(e) => set({ ...v, freeDeliveryFrom: e.target.value === '' ? null : Number(e.target.value) })} />
      </Field>
    </SectionCard>
  );
}

function AccountSettings({ email }: { email: string }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  return (
    <section className="a-card space-y-4">
      <h2 className="font-medium">ადმინისტრატორის ანგარიში</h2>
      <p className="a-muted text-sm">ელ-ფოსტა: <b className="text-ink dark:text-cream">{email}</b></p>
      <form
        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (pw !== pw2) return toast('პაროლები არ ემთხვევა', 'error');
          start(async () => {
            const r = await changePassword(pw);
            if (!r.ok) return toast(r.error, 'error');
            toast('პაროლი შეიცვალა');
            setPw('');
            setPw2('');
          });
        }}
      >
        <Field label="ახალი პაროლი (მინ. 10)">
          <input type="password" autoComplete="new-password" className="a-input" value={pw} onChange={(e) => setPw(e.target.value)} minLength={10} required />
        </Field>
        <Field label="გაიმეორე">
          <input type="password" autoComplete="new-password" className="a-input" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={10} required />
        </Field>
        <button className="a-btn-primary" disabled={pending}>{pending ? '...' : 'შეცვლა'}</button>
      </form>
      <p className="a-muted text-xs">ახალი ადმინისტრატორის დამატება: <code>npm run create-admin -- email პაროლი</code> (იხ. README).</p>
    </section>
  );
}

export function SettingsForm({ content, email }: { content: SiteContent; email: string }) {
  return (
    <div className="space-y-6">
      <StoreSettings initial={content.settings} />
      <ContactEditor initial={content.contact} />
      <SocialEditor initial={content.social} />
      <DeliveryEditor initial={content.delivery} />
      <AccountSettings email={email} />
    </div>
  );
}
