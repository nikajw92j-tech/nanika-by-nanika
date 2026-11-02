'use client';

import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { BLUR_DATA_URL } from '@/lib/blur';
import { tr } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/client';
import type { Category, GalleryImage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Lightbox } from './Lightbox';

const spans = ['row-span-3', 'row-span-2', 'row-span-3', 'row-span-2', 'row-span-2', 'row-span-3'];

export function GalleryGrid({
  images,
  categories,
  initialCategory,
}: {
  images: GalleryImage[];
  categories: Category[];
  initialCategory?: string;
}) {
  const { locale, dict } = useI18n();
  const [active, setActive] = useState(initialCategory ?? 'all');
  const [openId, setOpenId] = useState<string | null>(null);

  // ფილტრში მხოლოდ ის კატეგორიები, რომლებშიც ფოტოა (+ არჩეული, თუ ბმულიდან მოვიდა)
  const usedCats = useMemo(
    () => categories.filter((c) => c.slug === active || images.some((i) => i.category_slug === c.slug)),
    [categories, images, active],
  );
  const filtered = active === 'all' ? images : images.filter((i) => i.category_slug === active);

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id && images.some((i) => i.id === id)) setOpenId(id);
  }, [images]);

  const openIndex = filtered.findIndex((i) => i.id === openId);

  return (
    <LayoutGroup>
      <div
        role="tablist"
        aria-label="Categories"
        className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0"
      >
        {[{ slug: 'all', label: dict.common.all }, ...usedCats.map((c) => ({ slug: c.slug, label: tr(c.name, locale) }))].map(
          (c) => (
            <button
              key={c.slug}
              role="tab"
              aria-selected={active === c.slug}
              onClick={() => setActive(c.slug)}
              className={cn(
                'relative shrink-0 rounded-full px-5 py-2.5 text-sm transition-colors',
                active === c.slug ? 'text-cream' : 'text-ink/70 hover:text-ink',
              )}
            >
              {active === c.slug && (
                <motion.span layoutId="gallery-filter" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
              )}
              <span className="relative">{c.label}</span>
            </button>
          ),
        )}
      </div>

      <motion.ul layout className="mt-10 grid grid-flow-dense auto-rows-[7.5rem] grid-cols-2 gap-3 md:auto-rows-[9rem] md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((img, i) => {
            const title = tr(img.title, locale);
            return (
              <motion.li
                key={img.id}
                id={img.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn('relative', spans[i % spans.length])}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(img.id)}
                  data-cursor={dict.common.view}
                  className="group photo-soft relative block h-full w-full"
                  aria-label={title || dict.common.view}
                >
                  <motion.div layoutId={`img-${img.id}`} className="absolute inset-0">
                    <Image
                      src={img.url}
                      alt={title || 'Nanika — ნამუშევარი'}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover transition-transform duration-[1.2s] ease-silk group-hover:scale-110"
                    />
                  </motion.div>
                  {title && (
                    <span className="absolute inset-x-0 bottom-0 z-10 translate-y-2 p-4 text-left font-serif text-lg text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:text-sm max-md:opacity-100">
                      {title}
                    </span>
                  )}
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
      {filtered.length === 0 && <p className="py-20 text-center text-taupe">{dict.gallery.empty}</p>}

      <AnimatePresence>
        {openIndex >= 0 && (
          <Lightbox
            images={filtered}
            index={openIndex}
            onChange={(i) => setOpenId(filtered[i].id)}
            onClose={() => {
              setOpenId(null);
              history.replaceState(null, '', window.location.pathname + window.location.search);
            }}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
