import { requireAdmin } from '@/lib/auth';
import type { Category, GalleryImage } from '@/lib/types';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { PageHeader } from '@/components/admin/ui';

export const metadata = { title: 'გალერეა' };

export default async function GalleryAdmin() {
  const { supabase } = await requireAdmin();
  const [{ data: images }, { data: categories }] = await Promise.all([
    supabase.from('gallery_images').select('*').order('sort_order').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('sort_order'),
  ]);
  const list = (images ?? []) as GalleryImage[];
  return (
    <>
      <PageHeader title="გალერეა" subtitle="ნამუშევრების ფოტოები — ავტომატურად ჩანს /gallery გვერდზე. ★ = მთავარ გვერდზე." />
      <GalleryManager key={list.map((i) => i.id).join()} images={list} categories={(categories ?? []) as Category[]} />
    </>
  );
}
