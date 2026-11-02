'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setProductStatus, toggleProductFlag } from '@/app/admin/actions/products';
import type { ProductStatus } from '@/lib/types';
import { useToast } from './ui';

export function ProductRowActions({ id, status, featured }: { id: string; status: ProductStatus; featured: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) toast(r.error ?? 'შეცდომა', 'error');
      else {
        toast(msg);
        router.refresh();
      }
    });

  return (
    <div className="flex justify-end gap-1.5">
      <button
        type="button"
        disabled={pending}
        className="a-btn-ghost min-h-0 px-2.5 py-1.5 text-xs"
        title="რჩეული"
        onClick={() => run(() => toggleProductFlag(id, 'featured', !featured), featured ? 'მოიხსნა რჩეულებიდან' : 'დაემატა რჩეულებში')}
      >
        {featured ? '★' : '☆'}
      </button>
      <button
        type="button"
        disabled={pending}
        className="a-btn-ghost min-h-0 px-2.5 py-1.5 text-xs"
        onClick={() =>
          run(
            () => setProductStatus(id, status === 'published' ? 'hidden' : 'published'),
            status === 'published' ? 'დაიმალა საიტიდან' : 'გამოქვეყნდა',
          )
        }
      >
        {status === 'published' ? 'დამალვა' : 'გამოქვეყნება'}
      </button>
    </div>
  );
}
