import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import type { Category, Product } from '@/lib/types';
import { ProductForm } from '@/components/admin/ProductForm';

export const metadata = { title: 'პროდუქტის რედაქტირება' };

export default async function EditProduct({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { supabase } = await requireAdmin();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, product_images(*)').eq('id', params.id).maybeSingle(),
    supabase.from('categories').select('*').order('sort_order'),
  ]);
  if (!product) notFound();
  return <ProductForm key={(product as Product).updated_at} product={product as Product} categories={(categories ?? []) as Category[]} />;
}
