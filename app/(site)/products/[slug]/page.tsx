import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { getProductBySlug, getProducts, trackProductView } from '@/lib/data/public';
import { tr } from '@/lib/i18n/config';
import { getDictionary, getLocale } from '@/lib/i18n/server';
import { Stagger, StaggerItem } from '@/components/animations/Reveal';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductDetail } from '@/components/products/ProductDetail';
import { SectionHeading } from '@/components/ui/SectionHeading';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  const locale = getLocale();
  const title = product.seo_title || tr(product.name, locale);
  const description = product.seo_description || tr(product.description, locale).slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title, description, images: product.cover ? [{ url: product.cover }] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();
  const locale = getLocale();
  const dict = getDictionary(locale);
  void trackProductView(product.slug);

  const all = await getProducts();
  const related = all
    .filter((p) => p.id !== product.id)
    .sort((a, b) => Number(b.category_id === product.category_id) - Number(a.category_id === product.category_id))
    .slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tr(product.name, locale),
    description: tr(product.description, locale),
    image: product.images.map((i) => i.url),
    brand: { '@type': 'Brand', name: siteConfig.name },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GEL',
      price: product.finalPrice,
      availability:
        product.availability === 'out_of_stock'
          ? 'https://schema.org/OutOfStock'
          : product.availability === 'in_stock'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/PreOrder',
      url: `${siteConfig.url}/products/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className="container pb-24 pt-[calc(var(--header-h)+2.5rem)] md:pt-[calc(var(--header-h)+4rem)]">
        <ProductDetail product={product} />
      </section>
      {related.length > 0 && (
        <section className="container pb-24 md:pb-36">
          <SectionHeading title={dict.products.related} />
          <Stagger className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </>
  );
}
