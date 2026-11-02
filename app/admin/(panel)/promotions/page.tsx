import { requireAdmin } from '@/lib/auth';
import type { Promotion } from '@/lib/types';
import { PromotionsManager } from '@/components/admin/PromotionsManager';
import { PageHeader } from '@/components/admin/ui';

export const metadata = { title: 'აქციები' };

export default async function PromotionsAdmin() {
  const { supabase } = await requireAdmin();
  const [{ data: promotions }, { data: products }] = await Promise.all([
    supabase.from('promotions').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('id, name, price').order('created_at', { ascending: false }),
  ]);
  return (
    <>
      <PageHeader title="აქციები და ფასდაკლებები" subtitle="ბანერები მთავარ გვერდზე და ფასდაკლება არჩეულ პროდუქტებზე, თარიღებით." />
      <PromotionsManager
        promotions={(promotions ?? []) as Promotion[]}
        products={(products ?? []).map((p) => ({ id: p.id, name: (p.name as { ka?: string }).ka ?? '', price: Number(p.price) }))}
      />
    </>
  );
}
