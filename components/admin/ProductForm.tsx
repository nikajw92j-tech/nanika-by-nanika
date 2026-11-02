'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteProduct, saveProduct } from '@/app/admin/actions/products';
import type { Availability, Category, Localized, Product, ProductColor, ProductStatus } from '@/lib/types';
import { cn, formatPrice, slugify } from '@/lib/utils';
import { Close, Plus } from '@/components/ui/icons';
import { ImageManager, type ManagedImage } from './ImageManager';
import { ConfirmButton, Field, LocalizedField, PageHeader, Toggle, useToast } from './ui';

const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46'];
const numOrNull = (v: string) => (v.trim() === '' ? null : Number(v));

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(product));

  const [name, setName] = useState<Localized>(product?.name ?? {});
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [description, setDescription] = useState<Localized>(product?.description ?? {});
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [originalPrice, setOriginalPrice] = useState(product?.original_price != null ? String(product.original_price) : '');
  const [discountedPrice, setDiscountedPrice] = useState(product?.discounted_price != null ? String(product.discounted_price) : '');
  const [colors, setColors] = useState<ProductColor[]>(product?.colors ?? []);
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? []);
  const [sizeInput, setSizeInput] = useState('');
  const [fabric, setFabric] = useState<Localized>(product?.fabric ?? {});
  const [availability, setAvailability] = useState<Availability>(product?.availability ?? 'made_to_order');
  const [stock, setStock] = useState(product?.stock_quantity != null ? String(product.stock_quantity) : '');
  const [madeToOrder, setMadeToOrder] = useState(product?.made_to_order ?? true);
  const [sewingTime, setSewingTime] = useState(product?.sewing_time ?? '');
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [isNew, setIsNew] = useState(product?.is_new ?? false);
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'draft');
  const [seoTitle, setSeoTitle] = useState(product?.seo_title ?? '');
  const [seoDescription, setSeoDescription] = useState(product?.seo_description ?? '');
  const [images, setImages] = useState<ManagedImage[]>(
    [...(product?.product_images ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => ({ key: i.id, id: i.id, storage_path: i.storage_path, url: i.url, alt: i.alt, is_cover: i.is_cover })),
  );

  const updateName = (v: Localized) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v.en || v.ka || ''));
  };

  const submit = (nextStatus?: ProductStatus) =>
    start(async () => {
      const s = nextStatus ?? status;
      const res = await saveProduct({
        id: product?.id,
        slug,
        name: { ka: name.ka ?? '', en: name.en ?? '', ru: name.ru ?? '' },
        description,
        category_id: categoryId || null,
        price: Number(price || 0),
        original_price: numOrNull(originalPrice),
        discounted_price: numOrNull(discountedPrice),
        colors,
        sizes,
        fabric,
        availability,
        stock_quantity: numOrNull(stock),
        made_to_order: madeToOrder,
        sewing_time: sewingTime.trim() || null,
        featured,
        is_new: isNew,
        status: s,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        sort_order: product?.sort_order ?? 0,
        images: images.map(({ id, storage_path, url, alt, is_cover }) => ({ id, storage_path, url, alt: alt ?? null, is_cover })),
      });
      if (!res.ok) return toast(res.error, 'error');
      setStatus(s);
      toast(s === 'published' ? 'შენახულია და გამოქვეყნდა საიტზე' : 'შენახულია');
      if (!product && res.data) router.replace(`/admin/products/${res.data.id}`);
      else router.refresh();
    });

  const final = (() => {
    const p = Number(price || 0);
    const d = numOrNull(discountedPrice);
    return d != null && d < p ? d : p;
  })();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="pb-24"
    >
      <PageHeader
        title={product ? name.ka || 'პროდუქტი' : 'ახალი პროდუქტი'}
        subtitle={product ? `/products/${product.slug}` : 'შეავსე ველები და დააჭირე „გამოქვეყნებას“'}
        actions={
          product && (
            <>
              {product.status === 'published' && (
                <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="a-btn-ghost">
                  საიტზე ნახვა ↗
                </a>
              )}
              <ConfirmButton
                onConfirm={() =>
                  start(async () => {
                    const r = await deleteProduct(product.id);
                    if (!r.ok) return toast(r.error, 'error');
                    toast('პროდუქტი წაიშალა');
                    router.replace('/admin/products');
                  })
                }
                confirmText="დიახ, წაშალე"
              >
                წაშლა
              </ConfirmButton>
            </>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="a-card space-y-4">
            <h2 className="font-medium">ძირითადი ინფორმაცია</h2>
            <LocalizedField label="სახელი" value={name} onChange={updateName} required />
            <Field label="URL (slug)" hint="ავტომატურად იქმნება სახელიდან; მხოლოდ ლათინური ასოები და „-“">
              <input
                className="a-input font-mono"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                required
              />
            </Field>
            <LocalizedField label="აღწერა" value={description} onChange={setDescription} multiline rows={5} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="კატეგორია">
                <select className="a-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">— არჩევის გარეშე —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.ka}
                    </option>
                  ))}
                </select>
              </Field>
              <LocalizedField label="ქსოვილი / მასალა" value={fabric} onChange={setFabric} />
            </div>
          </section>

          <section className="a-card">
            <h2 className="mb-1 font-medium">ფოტოები</h2>
            <p className="a-muted mb-4 text-sm">პირველი/★ მონიშნული ფოტო არის მთავარი (ქავერი).</p>
            <ImageManager images={images} onChange={setImages} />
          </section>

          <section className="a-card space-y-4">
            <h2 className="font-medium">ფასი (₾)</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="ფასი *">
                <input className="a-input" type="number" min="0" step="0.01" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </Field>
              <Field label="ძველი ფასი" hint="გადახაზული ფასი (არასავალდებულო)">
                <input className="a-input" type="number" min="0" step="0.01" inputMode="decimal" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
              </Field>
              <Field label="ფასდაკლებული ფასი" hint="ძირითად ფასზე ნაკლები">
                <input className="a-input" type="number" min="0" step="0.01" inputMode="decimal" value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value)} />
              </Field>
            </div>
            <p className="a-muted text-sm">
              საიტზე ფასი: <b className="text-ink dark:text-cream">{formatPrice(final)}</b> (აქტიური აქციები დამატებით ითვლება)
            </p>
          </section>

          <section className="a-card space-y-5">
            <h2 className="font-medium">ფერები და ზომები</h2>
            <div>
              <span className="a-label">ხელმისაწვდომი ფერები</span>
              <ul className="space-y-2">
                {colors.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <input type="color" value={c.hex} onChange={(e) => setColors(colors.map((x, k) => (k === i ? { ...x, hex: e.target.value } : x)))} className="h-10 w-12 cursor-pointer rounded-lg border border-ink/15 bg-transparent dark:border-cream/15" aria-label="ფერი" />
                    <input className="a-input" value={c.name} placeholder="მაგ. შავი" onChange={(e) => setColors(colors.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} />
                    <button type="button" className="a-btn-ghost h-10 w-10 shrink-0 p-0" onClick={() => setColors(colors.filter((_, k) => k !== i))} aria-label="წაშლა">
                      <Close width={16} height={16} />
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="a-btn-ghost mt-2 text-xs" onClick={() => setColors([...colors, { name: '', hex: '#1E1A17' }])}>
                <Plus width={14} height={14} /> ფერის დამატება
              </button>
            </div>
            <div>
              <span className="a-label">ხელმისაწვდომი ზომები</span>
              <div className="flex flex-wrap gap-1.5">
                {SIZE_PRESETS.map((s) => (
                  <button key={s} type="button" onClick={() => setSizes(sizes.includes(s) ? sizes.filter((x) => x !== s) : [...sizes, s])} className={cn('rounded-lg border px-3 py-1.5 text-xs', sizes.includes(s) ? 'border-ink bg-ink text-cream dark:border-gold dark:bg-gold dark:text-ink' : 'border-ink/15 dark:border-cream/15')}>
                    {s}
                  </button>
                ))}
                {sizes.filter((s) => !SIZE_PRESETS.includes(s)).map((s) => (
                  <button key={s} type="button" onClick={() => setSizes(sizes.filter((x) => x !== s))} className="rounded-lg border border-ink bg-ink px-3 py-1.5 text-xs text-cream dark:border-gold dark:bg-gold dark:text-ink">
                    {s} ×
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input className="a-input max-w-[160px]" placeholder="სხვა ზომა" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) setSizes([...sizes, sizeInput.trim()]); setSizeInput(''); } }} />
                <button type="button" className="a-btn-ghost text-xs" onClick={() => { if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) setSizes([...sizes, sizeInput.trim()]); setSizeInput(''); }}>
                  დამატება
                </button>
              </div>
            </div>
          </section>

          <section className="a-card space-y-4">
            <h2 className="font-medium">SEO</h2>
            <Field label="SEO სათაური" hint={`${seoTitle.length}/70 · ცარიელი = პროდუქტის სახელი`}>
              <input className="a-input" maxLength={70} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            </Field>
            <Field label="SEO აღწერა" hint={`${seoDescription.length}/170 · ცარიელი = აღწერის დასაწყისი`}>
              <textarea className="a-input" rows={2} maxLength={170} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
            </Field>
          </section>
        </div>

        <div className="space-y-6">
          <section className="a-card space-y-3 lg:sticky lg:top-6">
            <h2 className="font-medium">სტატუსი</h2>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-ink/[0.05] p-1 dark:bg-cream/10">
              {(['draft', 'published', 'hidden'] as const).map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)} className={cn('rounded-lg py-2 text-xs', status === s ? 'bg-white font-medium shadow-sm dark:bg-[#141210]' : 'a-muted')}>
                  {{ draft: 'მონახაზი', published: 'გამოქვეყნ.', hidden: 'დამალული' }[s]}
                </button>
              ))}
            </div>
            <p className="a-muted text-xs">მხოლოდ „გამოქვეყნებული“ ჩანს საიტზე.</p>
            <div className="space-y-2 border-t border-ink/[0.07] pt-3 dark:border-cream/10">
              <Toggle label="რჩეული" hint="მთავარ გვერდზე" checked={featured} onChange={setFeatured} />
              <Toggle label="ახალი" hint="„ახალი“ ნიშანი ბარათზე" checked={isNew} onChange={setIsNew} />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button type="button" disabled={pending} onClick={() => submit('published')} className="a-btn-primary w-full">
                {pending ? 'ინახება...' : 'შენახვა და გამოქვეყნება'}
              </button>
              <button type="submit" disabled={pending} className="a-btn-ghost w-full">
                შენახვა
              </button>
            </div>
          </section>

          <section className="a-card space-y-4">
            <h2 className="font-medium">ხელმისაწვდომობა</h2>
            <Field label="მდგომარეობა">
              <select className="a-input" value={availability} onChange={(e) => setAvailability(e.target.value as Availability)}>
                <option value="made_to_order">იკერება შეკვეთით</option>
                <option value="in_stock">მარაგშია</option>
                <option value="out_of_stock">ამოიწურა</option>
              </select>
            </Field>
            <Field label="მარაგის რაოდენობა" hint="თუ საჭიროა">
              <input className="a-input" type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} />
            </Field>
            <Toggle label="ინდივიდუალური ზომით შეკვეთა" hint="„ჩემი ზომით შეკერვა“ ღილაკი" checked={madeToOrder} onChange={setMadeToOrder} />
            <Field label="შეკერვის ვადა" hint="მაგ. 5–10 სამუშაო დღე">
              <input className="a-input" value={sewingTime} onChange={(e) => setSewingTime(e.target.value)} />
            </Field>
          </section>
        </div>
      </div>
    </form>
  );
}
