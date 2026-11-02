'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { tr } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/client';
import type { GalleryImage } from '@/lib/types';
import { ArrowRight, ChevronLeft, ChevronRight, Close } from '@/components/ui/icons';

export function Lightbox({
  images,
  index,
  onChange,
  onClose,
}: {
  images: GalleryImage[];
  index: number;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const { locale, dict } = useI18n();
  const img = images[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const go = (d: number) => onChange((index + d + images.length) % images.length);

  useEffect(() => {
    window.__lenis?.stop();
    document.body.style.overflow = 'hidden';
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      window.__lenis?.start();
      document.body.style.overflow = '';
      prev?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const title = tr(img.title, locale);
  const description = tr(img.description, locale);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={title || dict.gallery.title}
      className="fixed inset-0 z-[80] flex flex-col bg-ink/95 text-cream backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-4 md:p-6" onClick={(e) => e.stopPropagation()}>
        <span className="text-sm tabular-nums text-cream/60">
          {index + 1} / {images.length}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 hover:border-cream"
        >
          <Close />
          <span className="sr-only">{dict.common.close}</span>
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 md:px-20">
        <motion.div
          key={img.id}
          layoutId={`img-${img.id}`}
          className="relative h-full max-h-[70vh] w-full max-w-3xl touch-pan-y"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) go(1);
            else if (info.offset.x > 80) go(-1);
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Image src={img.url} alt={title || 'Nanika'} fill sizes="(min-width: 768px) 768px, 100vw" className="object-contain" draggable={false} />
        </motion.div>
        {images.length > 1 && (
          <>
            <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label={dict.common.prev} className="absolute left-3 hidden h-12 w-12 items-center justify-center rounded-full border border-cream/20 hover:border-cream md:flex">
              <ChevronLeft />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label={dict.common.next} className="absolute right-3 hidden h-12 w-12 items-center justify-center rounded-full border border-cream/20 hover:border-cream md:flex">
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      <div className="container flex flex-col items-center gap-4 py-6 text-center md:flex-row md:justify-between md:text-left" onClick={(e) => e.stopPropagation()}>
        <div>
          {title && <p className="font-serif text-2xl">{title}</p>}
          {description && <p className="mt-1 max-w-xl text-sm text-cream/70">{description}</p>}
        </div>
        <Link
          href={`/order?model=${encodeURIComponent(img.id)}`}
          className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-gold"
        >
          {dict.common.wantThis} <ArrowRight width={16} height={16} />
        </Link>
      </div>
    </motion.div>
  );
}
