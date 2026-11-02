'use client';

import { compressImage } from '@/lib/image-compress';

export type Bucket = 'product-images' | 'gallery' | 'site';
export type Uploaded = { path: string; url: string; width?: number; height?: number };

async function dimensions(file: File) {
  try {
    const b = await createImageBitmap(file);
    const d = { width: b.width, height: b.height };
    b.close?.();
    return d;
  } catch {
    return {};
  }
}

/** შეკუმშვა ბრაუზერში → /api/admin/upload (სერვერზე ადმინის და ფაილის შემოწმება) */
export async function uploadImage(file: File, bucket: Bucket): Promise<Uploaded> {
  const compressed = await compressImage(file, 2000, 0.82);
  const fd = new FormData();
  fd.append('file', compressed);
  fd.append('bucket', bucket);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'ატვირთვა ვერ მოხერხდა');
  return { ...json, ...(await dimensions(compressed)) };
}
