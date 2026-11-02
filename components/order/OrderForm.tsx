'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { waHref } from '@/config/site';
import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils';
import {
  MAX_ORDER_FILES,
  MEASUREMENT_KEYS,
  makeOrderSchema,
  type OrderData,
} from '@/lib/validation/order';
import { scrollToY } from '@/components/animations/SmoothScroll';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Check, ChevronLeft } from '@/components/ui/icons';
import { ImageDrop } from './ImageDrop';

export type SelectedModel = {
  kind: 'product' | 'gallery';
  id: string;
  title: string;
  image: string | null;
  sizes: string[];
  colors: string[];
  price: string | null;
};

type Props = {
  categories: { slug: string; name: string }[];
  selected: SelectedModel | null;
  initial: { color?: string; size?: string; custom?: boolean; category?: string };
  whatsapp: string;
};

export function OrderForm({ categories, selected, initial, whatsapp }: Props) {
  const { dict, locale } = useI18n();
  const t = dict.order;
  const schema = useMemo(() => makeOrderSchema(t.errors), [t.errors]);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrderData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      product: selected?.kind === 'product' ? selected.id : '',
      model: selected?.kind === 'gallery' ? selected.id : '',
      category: initial.category ?? '',
      measurementsLater: false,
      measurements: Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, ''])),
      color: initial.color ?? '',
      size: initial.size ?? '',
      customSize: selected?.kind === 'product' ? (initial.custom ?? !initial.size) : true,
      desiredDate: '',
      comment: '',
      name: '',
      phone: '',
      city: '',
      contactMethod: 'phone',
      website: '',
    },
  });

  const later = watch('measurementsLater');
  const customSize = watch('customSize');
  const category = watch('category');

  const stepFields: FieldPath<OrderData>[][] = [
    ['category'],
    [],
    ['measurements.bust', 'measurements.waist', 'measurements.hips', 'measurements.shoulders', 'measurements.sleeve', 'measurements.length', 'measurements.height'],
    ['color', 'desiredDate', 'comment'],
    ['name', 'phone', 'city', 'contactMethod'],
  ];
  const total = t.steps.length;

  const go = async (d: number) => {
    if (d > 0) {
      const ok = await trigger(stepFields[step]);
      if (!ok) return;
    }
    setDir(d);
    setStep((s) => Math.min(total - 1, Math.max(0, s + d)));
    const top = document.getElementById('order-form')?.getBoundingClientRect().top;
    if (top !== undefined && top < 0) scrollToY(window.scrollY + top - 120);
  };

  const onSubmit = async (data: OrderData) => {
    setStatus('sending');
    const fd = new FormData();
    fd.append('payload', JSON.stringify({ ...data, locale }));
    files.forEach((f) => fd.append('files', f));
    try {
      const res = await fetch('/api/order', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error);
      setOrderNumber(json.orderNumber);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const err = (msg?: string) => msg && <p className="field-error" role="alert">{msg}</p>;

  if (status === 'done') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-16 text-center">
        <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden>
          <motion.circle cx="60" cy="60" r="54" fill="none" stroke="rgb(var(--gold))" strokeWidth="2" strokeDasharray="6 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
          <motion.path d="M38 62 L53 77 L84 45" fill="none" stroke="rgb(var(--ink))" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.6 }} />
        </svg>
        <h2 className="mt-8 font-serif text-5xl">{t.successTitle}</h2>
        <p className="mt-4 max-w-md text-taupe">{t.successText}</p>
        {orderNumber && (
          <p className="mt-6 rounded-full border border-gold/50 px-5 py-2 text-sm">
            {t.orderNumber}: <b>#{orderNumber}</b>
          </p>
        )}
        <Button
          variant="outline"
          className="mt-10"
          onClick={() => {
            reset();
            setFiles([]);
            setStep(0);
            setStatus('idle');
          }}
        >
          {t.newOrder}
        </Button>
      </motion.div>
    );
  }

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -40 }),
  };

  return (
    <form id="order-form" onSubmit={handleSubmit(onSubmit)} noValidate className="relative">
      {/* honeypot */}
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register('website')} />

      <div className="mb-10">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-taupe">
          <span>{t.stepOf.replace('{n}', String(step + 1)).replace('{total}', String(total))}</span>
          <span className="text-ink">{t.steps[step]}</span>
        </div>
        <div className="h-px w-full bg-ink/10">
          <motion.div className="h-px bg-gold" animate={{ width: `${((step + 1) / total) * 100}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <ol className="mt-4 hidden justify-between sm:flex">
          {t.steps.map((s, i) => (
            <li key={s} className={cn('flex items-center gap-2 text-xs', i <= step ? 'text-ink' : 'text-taupe/70')}>
              <span className={cn('flex h-6 w-6 items-center justify-center rounded-full border text-[0.65rem] transition-colors', i < step ? 'border-gold bg-gold text-ink' : i === step ? 'border-ink' : 'border-ink/20')}>
                {i < step ? <Check width={12} height={12} /> : i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="relative min-h-[360px] overflow-hidden">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            {step === 0 && (
              <fieldset>
                {selected && (
                  <div className="mb-8 flex items-center gap-4 border border-gold/40 bg-beige/40 p-4">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-beige">
                      {selected.image && <Image src={selected.image} alt="" fill sizes="64px" className="object-cover" />}
                    </div>
                    <div>
                      <p className="label">{t.selectedModel}</p>
                      <p className="font-serif text-xl">{selected.title}</p>
                      {selected.price && <p className="text-sm text-taupe">{selected.price}</p>}
                    </div>
                  </div>
                )}
                <legend className="mb-5 font-serif text-3xl">{t.category}</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {categories.map((c) => (
                    <label key={c.slug} className={cn('cursor-pointer border px-4 py-4 text-center text-sm transition-all', category === c.slug ? 'border-ink bg-ink text-cream' : 'border-ink/15 hover:border-ink/50')}>
                      <input type="radio" value={c.slug} className="sr-only" {...register('category')} />
                      {c.name}
                    </label>
                  ))}
                </div>
                {err(errors.category?.message)}
              </fieldset>
            )}

            {step === 1 && (
              <fieldset>
                <legend className="mb-2 font-serif text-3xl">{t.photos}</legend>
                {selected && <p className="mb-5 text-sm text-taupe">{t.photosOptional}</p>}
                <div className="mt-4">
                  <ImageDrop files={files} onChange={setFiles} max={MAX_ORDER_FILES} hint={t.photosHint} removeLabel={t.remove} errors={t.errors} />
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset>
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
                  <legend className="font-serif text-3xl">{t.measurements}</legend>
                  <Link href="/how-to-order#measurements" target="_blank" className="link-underline text-sm text-gold">
                    {t.guideLink} ↗
                  </Link>
                </div>
                {selected?.kind === 'product' && selected.sizes.length > 0 && (
                  <div className="mb-6">
                    <p className="label">{t.size}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selected.sizes.map((s) => (
                        <button key={s} type="button" onClick={() => { setValue('size', s); setValue('customSize', false); }} className={cn('min-w-[3rem] rounded-full border px-4 py-2 text-sm', !customSize && watch('size') === s ? 'border-ink bg-ink text-cream' : 'border-ink/20')}>
                          {s}
                        </button>
                      ))}
                      <button type="button" onClick={() => setValue('customSize', true)} className={cn('rounded-full border px-4 py-2 text-sm', customSize ? 'border-gold bg-gold text-ink' : 'border-gold/60')}>
                        {t.sizeCustom}
                      </button>
                    </div>
                  </div>
                )}
                {customSize && (
                  <>
                    <label className="mb-6 flex cursor-pointer items-center gap-3 text-sm">
                      <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--gold))]" {...register('measurementsLater')} />
                      {t.measureLater}
                    </label>
                    <div className={cn('grid grid-cols-2 gap-x-6 gap-y-4 transition-opacity sm:grid-cols-3', later && 'pointer-events-none opacity-40')}>
                      {dict.howTo.points.map((p) => {
                        const key = p.id as (typeof MEASUREMENT_KEYS)[number];
                        return (
                          <div key={p.id}>
                            <label htmlFor={`m-${p.id}`} className="label">{p.name}</label>
                            <input id={`m-${p.id}`} inputMode="decimal" placeholder="—" className="input" disabled={later} {...register(`measurements.${key}`)} />
                            {err(errors.measurements?.[key]?.message)}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </fieldset>
            )}

            {step === 3 && (
              <fieldset className="space-y-6">
                <legend className="mb-2 font-serif text-3xl">{t.steps[3]}</legend>
                <div>
                  <label htmlFor="color" className="label">{t.color}</label>
                  {selected?.kind === 'product' && selected.colors.length > 0 ? (
                    <select id="color" className="input" {...register('color')}>
                      {selected.colors.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input id="color" className="input" placeholder={t.colorPlaceholder} {...register('color')} />
                  )}
                </div>
                <div>
                  <label htmlFor="date" className="label">{t.desiredDate}</label>
                  <input id="date" type="date" min={new Date().toISOString().slice(0, 10)} className="input" {...register('desiredDate')} />
                  {err(errors.desiredDate?.message)}
                </div>
                <div>
                  <label htmlFor="comment" className="label">{t.comment}</label>
                  <textarea id="comment" rows={4} className="input resize-none" placeholder={t.commentPlaceholder} {...register('comment')} />
                </div>
              </fieldset>
            )}

            {step === 4 && (
              <fieldset className="space-y-6">
                <legend className="mb-2 font-serif text-3xl">{t.steps[4]}</legend>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="label">{t.name} *</label>
                    <input id="name" autoComplete="name" className="input" {...register('name')} />
                    {err(errors.name?.message)}
                  </div>
                  <div>
                    <label htmlFor="phone" className="label">{t.phone} *</label>
                    <input id="phone" type="tel" autoComplete="tel" placeholder="5XX XX XX XX" className="input" {...register('phone')} />
                    {err(errors.phone?.message)}
                  </div>
                </div>
                <div>
                  <label htmlFor="city" className="label">{t.city} *</label>
                  <input id="city" autoComplete="address-level2" className="input" {...register('city')} />
                  {err(errors.city?.message)}
                </div>
                <div>
                  <p className="label">{t.contactMethod}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(['phone', 'whatsapp', 'messenger'] as const).map((m) => (
                      <label key={m} className={cn('cursor-pointer rounded-full border px-5 py-2.5 text-sm transition-colors', watch('contactMethod') === m ? 'border-ink bg-ink text-cream' : 'border-ink/20 hover:border-ink')}>
                        <input type="radio" value={m} className="sr-only" {...register('contactMethod')} />
                        {t.methods[m]}
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {status === 'error' && (
        <div role="alert" className="mt-6 border border-wine/40 bg-wine/5 p-4 text-sm">
          <b>{t.errorTitle}.</b> {t.errorText}{' '}
          <a href={waHref(whatsapp)} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between gap-4">
        {step > 0 ? (
          <button type="button" onClick={() => go(-1)} className="inline-flex items-center gap-2 text-sm text-taupe hover:text-ink">
            <ChevronLeft width={16} height={16} /> {dict.common.back}
          </button>
        ) : (
          <span />
        )}
        {step < total - 1 ? (
          <Button type="button" onClick={() => go(1)} icon={<ArrowRight width={18} height={18} />}>
            {dict.common.next}
          </Button>
        ) : (
          <Button type="submit" disabled={status === 'sending'} icon={<ArrowRight width={18} height={18} />}>
            {status === 'sending' ? t.sending : t.submit}
          </Button>
        )}
      </div>
    </form>
  );
}
