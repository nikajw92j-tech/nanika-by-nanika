'use client';

import { Reorder } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { addGalleryImages, deleteGalleryImage, reorderGallery, updateGalleryImage } from '@/app/admin/actions/content';
import { ACCEPTED_IMAGE_TYPES } from '@/lib/image-compress';
import type { Category, GalleryImage, Localized } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Upload } from '@/components/ui/icons';
import { uploadImage } from './upload';
import { ConfirmButton, EmptyState, LocalizedField, Toggle, useToast } from './ui';

export function GalleryManager({ images, categories }: { images: GalleryImage[]; categories: Category[] }) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState(images);
  const [dirtyOrder, setDirtyOrder] = useState(false);
  const [uploadCat, setUploadCat] = useState(categories[0]?.slug ?? '');
  const [uploading, setUploading] = useState(0);
  const [drag, setDrag] = useState(false);
  const [filter, setFilter] = useState('all');
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    const files = Array.from(list).filter((f) => ACCEPTED_IMAGE_TYPES.includes(f.type)).slice(0, 30);
    setUploading(files.length);
    const done: { storage_path: string; url: string; category_slug: string | null; width?: number; height?: number }[] = [];
    for (const f of files) {
      try {
        const up = await uploadImage(f, 'gallery');
        done.push({ storage_path: up.path, url: up.url, category_slug: uploadCat || null, width: up.width, height: up.height });
      } catch (e) {
        toast(`${f.name}: ${(e as Error).message}`, 'error');
      }
      setUploading((n) => n - 1);
    }
    if (!done.length) return;
    const r = await addGalleryImages(done);
    if (!r.ok) return toast(r.error, 'error');
    toast(`${done.length} ფოტო დაემატა საიტის გალერეაში`);
    router.refresh();
  };

  const visible = filter === 'all' ? items : items.filter((i) => i.category_slug === filter);

  return (
    <div className="space-y-6">
      <section className="a-card">
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="a-label">ახალი ფოტოების კატეგორია</label>
            <select className="a-input w-56" value={uploadCat} onChange={(e) => setUploadCat(e.target.value)}>
              <option value="">— კატეგორიის გარეშე —</option>
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name.ka}</option>)}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
          className={cn('flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed py-10 text-sm transition', drag ? 'border-gold bg-gold/10' : 'border-ink/15 hover:bg-ink/[0.02] dark:border-cream/15')}
        >
          <Upload width={24} height={24} className="text-gold" />
          {uploading ? `იტვირთება... (${uploading} დარჩა)` : 'ჩააგდე ფოტოები ან დააჭირე ასარჩევად (რამდენიმე ერთად)'}
        </button>
        <input ref={inputRef} type="file" multiple accept={ACCEPTED_IMAGE_TYPES.join(',')} className="sr-only" tabIndex={-1} onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <select className="a-input w-56" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">ყველა ({items.length})</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name.ka} ({items.filter((i) => i.category_slug === c.slug).length})</option>)}
        </select>
        {dirtyOrder && (
          <button
            type="button"
            disabled={pending}
            className="a-btn-primary"
            onClick={() =>
              start(async () => {
                const r = await reorderGallery(items.map((i) => i.id));
                if (!r.ok) return toast(r.error, 'error');
                setDirtyOrder(false);
                toast('თანმიმდევრობა შენახულია');
              })
            }
          >
            თანმიმდევრობის შენახვა
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState title="გალერეა ცარიელია" text="სანამ ფოტოს არ დაამატებ, საიტზე ჩანს საწყისი ფოტოები images/gallery საქაღალდიდან." />
      ) : filter === 'all' ? (
        <Reorder.Group axis="y" values={items} onReorder={(v) => { setItems(v); setDirtyOrder(true); }} className="space-y-3">
          {items.map((img) => (
            <Reorder.Item key={img.id} value={img} className="list-none">
              <GalleryRow img={img} categories={categories} draggable onDeleted={() => setItems((l) => l.filter((x) => x.id !== img.id))} />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <ul className="space-y-3">
          {visible.map((img) => (
            <li key={img.id}>
              <GalleryRow img={img} categories={categories} onDeleted={() => setItems((l) => l.filter((x) => x.id !== img.id))} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GalleryRow({ img, categories, draggable, onDeleted }: { img: GalleryImage; categories: Category[]; draggable?: boolean; onDeleted: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState<Localized>(img.title);
  const [description, setDescription] = useState<Localized>(img.description);
  const [cat, setCat] = useState(img.category_slug ?? '');
  const [featured, setFeatured] = useState(img.featured);
  const [published, setPublished] = useState(img.published);
  const [open, setOpen] = useState(false);

  const save = (patch?: Partial<{ featured: boolean; published: boolean }>) =>
    start(async () => {
      const r = await updateGalleryImage({ id: img.id, category_slug: cat || null, title, description, featured: patch?.featured ?? featured, published: patch?.published ?? published });
      toast(r.ok ? 'შენახულია' : r.error, r.ok ? 'ok' : 'error');
    });

  return (
    <div className={cn('a-card p-3 md:p-4', !published && 'opacity-60')}>
      <div className="flex items-center gap-3">
        {draggable && <span className="a-muted cursor-grab select-none px-1 text-lg" aria-hidden>⋮⋮</span>}
        {/* eslint-disable-next-line @next/next/no-img-element -- ადმინის მინიატურა */}
        <img src={img.url} alt="" className="pointer-events-none h-16 w-14 shrink-0 rounded-lg object-cover" draggable={false} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title.ka || 'უსათაურო'}</p>
          <p className="a-muted text-xs">{categories.find((c) => c.slug === cat)?.name.ka ?? 'კატეგორიის გარეშე'}{featured && ' · ★ მთავარზე'}</p>
        </div>
        <button type="button" className="a-btn-ghost min-h-0 px-2.5 py-1.5 text-xs" onClick={() => { setFeatured(!featured); save({ featured: !featured }); }} title="მთავარ გვერდზე">
          {featured ? '★' : '☆'}
        </button>
        <button type="button" className="a-btn-ghost min-h-0 px-2.5 py-1.5 text-xs" onClick={() => setOpen(!open)}>
          {open ? 'დახურვა' : 'რედაქტ.'}
        </button>
      </div>
      {open && (
        <div className="mt-4 grid gap-4 border-t border-ink/[0.07] pt-4 dark:border-cream/10 md:grid-cols-2">
          <LocalizedField label="სათაური" value={title} onChange={setTitle} />
          <div>
            <label className="a-label">კატეგორია</label>
            <select className="a-input" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">— კატეგორიის გარეშე —</option>
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name.ka}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <LocalizedField label="აღწერა" value={description} onChange={setDescription} multiline rows={2} />
          </div>
          <div className="space-y-1">
            <Toggle label="მთავარ გვერდზე (რჩეული)" checked={featured} onChange={setFeatured} />
            <Toggle label="ჩანს საიტზე" checked={published} onChange={setPublished} />
          </div>
          <div className="flex items-end justify-end gap-2">
            <ConfirmButton
              onConfirm={() =>
                start(async () => {
                  const r = await deleteGalleryImage(img.id);
                  if (!r.ok) return toast(r.error, 'error');
                  toast('ფოტო წაიშალა');
                  onDeleted();
                })
              }
            >
              წაშლა
            </ConfirmButton>
            <button type="button" disabled={pending} className="a-btn-primary" onClick={() => save()}>
              {pending ? '...' : 'შენახვა'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
