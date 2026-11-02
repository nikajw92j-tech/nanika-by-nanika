'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ACCEPTED_IMAGE_TYPES, compressImage } from '@/lib/image-compress';
import { cn } from '@/lib/utils';
import { Close, Upload } from '@/components/ui/icons';

const MAX_RAW = 10 * 1024 * 1024;

export function ImageDrop({
  files,
  onChange,
  max,
  hint,
  removeLabel,
  errors,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  max: number;
  hint: string;
  removeLabel: string;
  errors: { fileType: string; fileSize: string; tooMany: string };
}) {
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const add = async (list: FileList | null) => {
    if (!list) return;
    setError(null);
    const incoming = Array.from(list);
    if (files.length + incoming.length > max) setError(errors.tooMany);
    const accepted: File[] = [];
    setBusy(true);
    for (const f of incoming.slice(0, Math.max(0, max - files.length))) {
      if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) {
        setError(errors.fileType);
        continue;
      }
      if (f.size > MAX_RAW) {
        setError(errors.fileSize);
        continue;
      }
      accepted.push(await compressImage(f, 1800, 0.8));
    }
    setBusy(false);
    onChange([...files, ...accepted]);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          add(e.dataTransfer.files);
        }}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-3 border border-dashed px-6 py-12 text-center transition-colors',
          drag ? 'border-gold bg-gold/10' : 'border-ink/25 hover:border-gold hover:bg-beige/40',
        )}
      >
        <motion.span animate={{ y: drag ? -4 : 0 }} className="flex h-14 w-14 items-center justify-center rounded-full bg-beige text-gold">
          <Upload width={24} height={24} />
        </motion.span>
        <span className="max-w-xs text-sm text-taupe">{busy ? '…' : hint}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          add(e.target.files);
          e.target.value = '';
        }}
      />
      {error && <p className="field-error" role="alert">{error}</p>}
      {files.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          <AnimatePresence>
            {previews.map((src, i) => (
              <motion.li key={src} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative aspect-square overflow-hidden bg-beige">
                {/* eslint-disable-next-line @next/next/no-img-element -- ლოკალური blob preview */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange(files.filter((_, k) => k !== i))}
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink/80 text-cream"
                  aria-label={removeLabel}
                >
                  <Close width={14} height={14} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
