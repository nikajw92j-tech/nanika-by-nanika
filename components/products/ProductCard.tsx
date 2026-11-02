'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BLUR_DATA_URL } from '@/lib/blur';
import { tr } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/client';
import type { PublicProduct } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { ArrowRight } from '@/components/ui/icons';

export function ProductCard({ product, priority = false }: { product: PublicProduct; priority?: boolean }) {
  const { locale, dict } = useI18n();
  const name = tr(product.name, locale);
  const second = product.images.find((i) => i.url !== product.cover)?.url;
  const href = `/products/${product.slug}`;

  return (
    <article className="group">
      <Link href={href} data-cursor={dict.common.view} className="relative block aspect-[3/4] overflow-hidden bg-beige">
        {product.cover ? (
          <>
            <Image
              src={product.cover}
              alt={name}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover transition-all duration-[1.1s] ease-silk group-hover:scale-105"
            />
            {second && (
              <Image
                src={second}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="placeholder-tile h-full w-full">
            <span className="font-serif text-5xl italic text-gold/50">{name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.discountPercent ? (
            <span className="bg-wine px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-cream">
              −{product.discountPercent}%
            </span>
          ) : null}
          {product.is_new && (
            <span className="bg-cream px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-ink">
              {dict.products.new}
            </span>
          )}
        </div>
        <div className="absolute inset-x-3 bottom-3 hidden translate-y-3 gap-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:flex">
          <span className="flex-1 rounded-full bg-cream/95 py-2.5 text-center text-xs font-medium uppercase tracking-[0.15em]">
            {dict.common.viewDetails}
          </span>
        </div>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-xl">
            <Link href={href} className="link-underline">{name}</Link>
          </h3>
          <p className="mt-1 flex items-baseline gap-2 text-sm">
            <span className="font-medium">{formatPrice(product.finalPrice)}</span>
            {product.comparePrice && (
              <s className="text-taupe">{formatPrice(product.comparePrice)}</s>
            )}
          </p>
        </div>
        {product.colors.length > 0 && (
          <ul className="mt-2 flex shrink-0 -space-x-1" aria-label={dict.products.colors}>
            {product.colors.slice(0, 4).map((c) => (
              <li key={c.name + c.hex} title={c.name} className="h-4 w-4 rounded-full border border-cream ring-1 ring-ink/10" style={{ backgroundColor: c.hex }}>
                <span className="sr-only">{c.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <Link href={href} className="flex-1 rounded-full border border-ink/20 py-2 text-center text-xs uppercase tracking-[0.12em] transition-colors hover:border-ink">
          {dict.common.viewDetails}
        </Link>
        <Link
          href={`/order?product=${product.slug}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink py-2 text-center text-xs uppercase tracking-[0.12em] text-cream transition-colors hover:bg-gold hover:text-ink"
        >
          {dict.common.order} <ArrowRight width={14} height={14} />
        </Link>
      </div>
    </article>
  );
}
