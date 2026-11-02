import { requireAdmin } from '@/lib/auth';
import type { Category } from '@/lib/types';
import { ProductForm } from '@/components/admin/ProductForm';

export const metadata = { title: 'ახალი პროდუქტი' };

export default async function NewProduct() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('categories').select('*').order('sort_order');
  return <ProductForm categories={(data ?? []) as Category[]} />;
}
