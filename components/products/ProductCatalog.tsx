'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { tr } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/client';
import type { Category, PublicProduct } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Search } from '@/components/ui/icons';
import { ProductCard } from './ProductCard';

type Sort = 'new' | 'asc' | 'desc';

export function ProductCatalog({ products, categories }: { products: PublicProduct[]; categories: Category[] }) {
  const { locale, dict } = useI18n();
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState<Sort>('new');
  const [q, setQ] = useState('');

  const usedCats = categories.filter((c) => products.some((p) => p.category_id === c.id));

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    const out = products.filter((p) => {
      if (cat !== 'all' && p.category?.slug !== cat) return false;
      if (!query) return true;
      return [p.name.ka, p.name.en, p.name.ru, p.description.ka, p.description.en, p.description.ru]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(query));
    });
    if (sort === 'asc') out.sort((a, b) => a.finalPrice - b.finalPrice);
    if (sort === 'desc') out.sort((a, b) => b.finalPrice - a.finalPrice);
    return out;
  }, [products, cat, sort, q]);

  return (
    <>
      <div className="flex flex-col gap-5 border-b border-ink/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:px-0">
          {[{ slug: 'all', label: dict.common.all }, ...usedCats.map((c) => ({ slug: c.slug, label: tr(c.name, locale) }))].map((c) => (
            <button
              key={c.slug}
              role="tab"
              aria-selected={cat === c.slug}
              onClick={() => setCat(c.slug)}
              className={cn('relative shrink-0 rounded-full px-5 py-2.5 text-sm transition-colors', cat === c.slug ? 'text-cream' : 'text-ink/70 hover:text-ink')}
            >
              {cat === c.slug && <motion.span layoutId="product-filter" className="absolute inset-0 -z-10 rounded-full bg-ink" />}
              <span className="relative">{c.label}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <label className="relative flex-1 lg:w-64">
            <span className="sr-only">{dict.common.search}</span>
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-taupe" width={18} height={18} />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={dict.products.search}
              className="input pl-7"
            />
          </label>
          <label>
            <span className="sr-only">{dict.products.sort}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="input w-auto cursor-pointer pr-6 text-sm">
              <option value="new">{dict.products.sortNew}</option>
              <option value="asc">{dict.products.sortAsc}</option>
              <option value="desc">{dict.products.sortDesc}</option>
            </select>
          </label>
        </div>
      </div>

      <motion.ul layout className="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductCard product={p} priority={i < 4} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {list.length === 0 && <p className="py-20 text-center text-taupe">{dict.products.noResults}</p>}
    </>
  );
}
