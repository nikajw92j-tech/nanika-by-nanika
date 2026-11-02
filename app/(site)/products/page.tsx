import type { Metadata } from 'next';
import { getCategories, getProducts } from '@/lib/data/public';
import { getDictionary, getLocale } from '@/lib/i18n/server';
import { ProductCatalog } from '@/components/products/ProductCatalog';
import { ButtonLink } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/SectionHeading';

export function generateMetadata(): Metadata {
  const dict = getDictionary(getLocale());
  return { title: dict.products.title, description: dict.products.subtitle, alternates: { canonical: '/products' } };
}

export default async function ProductsPage() {
  const dict = getDictionary(getLocale());
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <>
      <PageHero eyebrow={dict.nav.products} title={dict.products.title} subtitle={dict.products.subtitle} />
      <section className="container pb-24 md:pb-36">
        {products.length ? (
          <ProductCatalog products={products} categories={categories} />
        ) : (
          <div className="placeholder-tile flex-col gap-6 px-6 py-24 text-center">
            <p className="max-w-md text-lg text-ink">{dict.products.empty}</p>
            <ButtonLink href="/order">{dict.common.orderNow}</ButtonLink>
          </div>
        )}
      </section>
    </>
  );
}
