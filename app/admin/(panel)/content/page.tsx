import { requireAdmin } from '@/lib/auth';
import { loadContent } from '@/lib/data/admin-content';
import type { Category } from '@/lib/types';
import { ContentEditor } from '@/components/admin/ContentEditor';
import { PageHeader } from '@/components/admin/ui';

export const metadata = { title: 'კონტენტი' };

export default async function ContentAdmin({ searchParams }: { searchParams: { tab?: string } }) {
  const { supabase } = await requireAdmin();
  const [content, { data: categories }] = await Promise.all([
    loadContent(supabase),
    supabase.from('categories').select('*').order('sort_order'),
  ]);
  return (
    <>
      <PageHeader title="საიტის კონტენტი" subtitle="ტექსტები სამ ენაზე (KA / EN / RU). ცარიელი EN/RU ველი = ჩანს ქართული ტექსტი." />
      <ContentEditor content={content} categories={(categories ?? []) as Category[]} initialTab={searchParams.tab} />
    </>
  );
}
