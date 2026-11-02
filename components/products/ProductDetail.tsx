'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { BLUR_DATA_URL } from '@/lib/blur';
import { tr } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/client';
import type { PublicProduct } from '@/lib/types';
import { cn, formatPrice } from '@/lib/utils';
import { ArrowRight, Clock, Fabric, Ruler } from '@/components/ui/icons';

export function ProductDetail({ product }: { product: PublicProduct }) {
  const { locale, dict } = useI18n();
  const [active, setActive] = useState(Math.max(0, product.images.findIndex((i) => i.url === product.cover)));
  const [color, setColor] = useState(product.colors[0]?.name ?? '');
  const [size, setSize] = useState<string>(product.sizes[0] ?? '');
  const [custom, setCustom] = useState(product.sizes.length === 0);
  const name = tr(product.name, locale);
  const img = product.images[active];
  const unavailable = product.availability === 'out_of_stock' && !product.made_to_order;

  const params = new URLSearchParams({ product: product.slug });
  if (color) params.set('color', color);
  if (custom) params.set('custom', '1');
  else if (size) params.set('size', size);

  const availabilityLabel =
    product.availability === 'in_stock'
      ? dict.products.inStock
      : product.availability === 'out_of_stock'
        ? dict.products.outOfStock
        : dict.products.madeToOrder;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      {/* გალერეა */}
      <div className="lg:col-span-7">
        <div className="flex flex-col-reverse gap-3 md:flex-row">
          {product.images.length > 1 && (
            <ul className="no-scrollbar flex gap-2 overflow-x-auto md:max-h-[640px] md:flex-col md:overflow-y-auto">
              {product.images.map((im, i) => (
                <li key={im.id}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`${name} ${i + 1}`}
                    aria-current={i === active}
                    className={cn('relative block h-24 w-20 shrink-0 overflow-hidden bg-beige transition-opacity', i === active ? 'ring-1 ring-ink' : 'opacity-60 hover:opacity-100')}
                  >
                    <Image src={im.url} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-beige">
            <AnimatePresence mode="wait">
              {img ? (
                <motion.div
                  key={img.id}
                  className="absolute inset-0 touch-pan-y"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  drag={product.images.length > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    const n = product.images.length;
                    if (info.offset.x < -60) setActive((a) => (a + 1) % n);
                    else if (info.offset.x > 60) setActive((a) => (a - 1 + n) % n);
                  }}
                >
                  <Image src={img.url} alt={img.alt || name} fill priority sizes="(min-width: 1024px) 50vw, 100vw" placeholder="blur" blurDataURL={BLUR_DATA_URL} className="object-cover" draggable={false} />
                </motion.div>
              ) : (
                <div className="placeholder-tile absolute inset-0">
                  <span className="font-serif text-7xl italic text-gold/50">{name.charAt(0)}</span>
                </div>
              )}
            </AnimatePresence>
            {product.discountPercent ? (
              <span className="absolute left-4 top-4 bg-wine px-3 py-1 text-xs uppercase tracking-[0.15em] text-cream">−{product.discountPercent}%</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* ინფორმაცია */}
      <div className="lg:col-span-5 lg:pt-6">
        {product.category && <p className="eyebrow mb-4">{tr(product.category.name, locale)}</p>}
        <h1 className="text-h1">{name}</h1>
        <p className="mt-5 flex items-baseline gap-3 text-2xl">
          <span>{formatPrice(product.finalPrice)}</span>
          {product.comparePrice && <s className="text-lg text-taupe">{formatPrice(product.comparePrice)}</s>}
        </p>
        <p className="mt-2 text-sm text-taupe">{availabilityLabel}</p>

        {product.colors.length > 0 && (
          <fieldset className="mt-8">
            <legend className="label">
              {dict.products.color}: <span className="normal-case tracking-normal text-ink">{color}</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {product.colors.map((c) => (
                <label key={c.name + c.hex} className="cursor-pointer" title={c.name}>
                  <input type="radio" name="color" value={c.name} checked={color === c.name} onChange={() => setColor(c.name)} className="peer sr-only" />
                  <span className="block h-9 w-9 rounded-full border-2 border-cream ring-1 ring-ink/15 transition-all peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:ring-gold" style={{ backgroundColor: c.hex }} />
                  <span className="sr-only">{c.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset className="mt-8">
          <legend className="label">{dict.products.size}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={!custom && size === s}
                onClick={() => {
                  setSize(s);
                  setCustom(false);
                }}
                className={cn('min-w-[3rem] rounded-full border px-4 py-2 text-sm transition-colors', !custom && size === s ? 'border-ink bg-ink text-cream' : 'border-ink/20 hover:border-ink')}
              >
                {s}
              </button>
            ))}
            {product.made_to_order && (
              <button
                type="button"
                aria-pressed={custom}
                onClick={() => setCustom(true)}
                className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors', custom ? 'border-gold bg-gold text-ink' : 'border-gold/60 hover:border-gold')}
              >
                <Ruler width={16} height={16} /> {dict.products.customSize}
              </button>
            )}
          </div>
          {custom && <p className="mt-3 text-sm text-taupe">{dict.products.customSizeText}</p>}
        </fieldset>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {unavailable ? (
            <span className="flex-1 rounded-full border border-ink/20 py-4 text-center text-sm text-taupe">{dict.products.outOfStock}</span>
          ) : (
            <Link
              href={`/order?${params.toString()}`}
              className="group inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-ink py-4 text-sm font-medium tracking-wide text-cream transition-colors hover:bg-gold hover:text-ink"
            >
              {dict.common.orderNow}
              <ArrowRight width={18} height={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        <dl className="mt-10 divide-y divide-ink/10 border-y border-ink/10 text-sm">
          {tr(product.fabric, locale) && (
            <div className="flex items-start gap-4 py-4">
              <Fabric className="mt-0.5 shrink-0 text-gold" />
              <dt className="w-32 shrink-0 text-taupe">{dict.products.fabric}</dt>
              <dd>{tr(product.fabric, locale)}</dd>
            </div>
          )}
          {product.sewing_time && (
            <div className="flex items-start gap-4 py-4">
              <Clock className="mt-0.5 shrink-0 text-gold" />
              <dt className="w-32 shrink-0 text-taupe">{dict.products.productionTime}</dt>
              <dd>{product.sewing_time}</dd>
            </div>
          )}
        </dl>

        {tr(product.description, locale) && (
          <div className="mt-8">
            <h2 className="label">{dict.products.description}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/80">{tr(product.description, locale)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
