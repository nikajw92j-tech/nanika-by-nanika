'use client';

import { Reorder } from 'framer-motion';
import { useRef, useState } from 'react';
import { ACCEPTED_IMAGE_TYPES } from '@/lib/image-compress';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Close, Star, Upload } from '@/components/ui/icons';
import { uploadImage, type Bucket } from './upload';
import { useToast } from './ui';

export type ManagedImage = {
  key: string; // სტაბილური React key
  id?: string;
  storage_path: string;
  url: string;
  alt?: string | null;
  is_cover: boolean;
};

/**
 * ფოტოების მართვა: მრავალი ფოტოს ატვირთვა (drag & drop / ტელეფონის გალერეა), preview,
 * გადალაგება (drag ან ისრები), მთავარი ფოტოს არჩევა, ჩანაცვლება და წაშლა.
 */
export function ImageManager({
  images,
  onChange,
  bucket = 'product-images',
  max = 20,
}: {
  images: ManagedImage[];
  onChange: (imgs: ManagedImage[]) => void;
  bucket?: Bucket;
  max?: number;
}) {
  const toast = useToast();
  const [uploading, setUploading] = useState(0);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceKey = useRef<string | null>(null);
  const latest = useRef(images);
  latest.current = images;

  const addFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    const files = Array.from(list).filter((f) => {
      const ok = ACCEPTED_IMAGE_TYPES.includes(f.type);
      if (!ok) toast(`${f.name}: დაუშვებელი ფორმატი`, 'error');
      return ok;
    });
    const room = max - latest.current.length;
    if (files.length > room) toast(`მაქსიმუმ ${max} ფოტო`, 'error');
    const batch = files.slice(0, Math.max(0, room));
    setUploading((n) => n + batch.length);
    await Promise.all(
      batch.map(async (f) => {
        try {
          const up = await uploadImage(f, bucket);
          const next = [...latest.current, { key: up.path, storage_path: up.path, url: up.url, is_cover: latest.current.length === 0 }];
          latest.current = next;
          onChange(next);
        } catch (e) {
          toast(`${f.name}: ${(e as Error).message}`, 'error');
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
  };

  const replace = async (file: File | undefined) => {
    const key = replaceKey.current;
    if (!file || !key) return;
    setUploading((n) => n + 1);
    try {
      const up = await uploadImage(file, bucket);
      onChange(latest.current.map((i) => (i.key === key ? { key: up.path, storage_path: up.path, url: up.url, is_cover: i.is_cover, alt: i.alt } : i)));
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setUploading((n) => n - 1);
    }
  };

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const setCover = (key: string) => onChange(images.map((i) => ({ ...i, is_cover: i.key === key })));
  const remove = (key: string) => {
    const next = images.filter((i) => i.key !== key);
    if (next.length && !next.some((i) => i.is_cover)) next[0] = { ...next[0], is_cover: true };
    onChange(next);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            setDrag(true);
          }
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn('rounded-2xl border-2 border-dashed p-3 transition-colors', drag ? 'border-gold bg-gold/10' : 'border-ink/15 dark:border-cream/15')}
      >
        {images.length > 0 && (
          <Reorder.Group axis="x" values={images} onReorder={onChange} className="no-scrollbar mb-3 flex gap-3 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <Reorder.Item key={img.key} value={img} className="group relative w-32 shrink-0 cursor-grab touch-pan-x active:cursor-grabbing sm:w-36">
                <div className={cn('relative aspect-[3/4] overflow-hidden rounded-xl bg-ink/5', img.is_cover && 'ring-2 ring-gold ring-offset-2 ring-offset-white dark:ring-offset-[#1C1916]')}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- ადმინის preview */}
                  <img src={img.url} alt="" className="pointer-events-none h-full w-full object-cover" draggable={false} />
                  {img.is_cover && <span className="absolute left-1.5 top-1.5 rounded-full bg-gold px-2 py-0.5 text-[0.6rem] font-semibold text-ink">მთავარი</span>}
                  <button type="button" onClick={() => remove(img.key)} className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink/75 text-cream" aria-label="წაშლა">
                    <Close width={14} height={14} />
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="a-btn-ghost h-7 min-h-0 w-7 p-0 disabled:opacity-30" aria-label="მარცხნივ">
                    <ChevronLeft width={14} height={14} />
                  </button>
                  <button type="button" onClick={() => setCover(img.key)} className={cn('a-btn-ghost h-7 min-h-0 flex-1 px-1 text-[0.65rem]', img.is_cover && 'text-gold')} title="მთავარ ფოტოდ">
                    <Star width={12} height={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      replaceKey.current = img.key;
                      replaceRef.current?.click();
                    }}
                    className="a-btn-ghost h-7 min-h-0 flex-1 px-1 text-[0.65rem]"
                  >
                    შეცვლა
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="a-btn-ghost h-7 min-h-0 w-7 p-0 disabled:opacity-30" aria-label="მარჯვნივ">
                    <ChevronRight width={14} height={14} />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
        <button type="button" onClick={() => inputRef.current?.click()} disabled={images.length >= max} className="flex w-full flex-col items-center gap-2 rounded-xl py-6 text-sm transition hover:bg-ink/[0.03] dark:hover:bg-cream/5">
          <Upload width={22} height={22} className="text-gold" />
          <span>{uploading ? `იტვირთება ${uploading} ფოტო...` : 'ჩააგდე ფოტოები აქ ან დააჭირე ასარჩევად'}</span>
          <span className="a-muted text-xs">JPG, PNG, WEBP · ავტომატურად იკუმშება · გადაათრიე თანმიმდევრობის შესაცვლელად</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} multiple className="sr-only" tabIndex={-1} onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
      <input ref={replaceRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} className="sr-only" tabIndex={-1} onChange={(e) => { replace(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}

/** ერთი ფოტოს ველი (hero, ბანერი, კატეგორია...) */
export function SingleImageField({
  value,
  onChange,
  bucket = 'site',
  label,
}: {
  value: string;
  onChange: (url: string, path: string | null) => void;
  bucket?: Bucket;
  label: string;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <span className="a-label">{label}</span>
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-ink/5 dark:bg-cream/10">
          {/* eslint-disable-next-line @next/next/no-img-element -- ადმინის preview */}
          {value && <img src={value} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="a-btn-ghost text-xs" disabled={busy} onClick={() => ref.current?.click()}>
            {busy ? 'იტვირთება...' : value ? 'შეცვლა' : 'ატვირთვა'}
          </button>
          {value && (
            <button type="button" className="a-btn-ghost text-xs" onClick={() => onChange('', null)}>
              მოშორება
            </button>
          )}
        </div>
      </div>
      <input
        ref={ref}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          setBusy(true);
          try {
            const up = await uploadImage(f, bucket);
            onChange(up.url, up.path);
          } catch (err) {
            toast((err as Error).message, 'error');
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
