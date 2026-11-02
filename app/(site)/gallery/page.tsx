import type { Metadata } from 'next';
import { getCategories, getGallery } from '@/lib/data/public';
import { getDictionary, getLocale } from '@/lib/i18n/server';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { PageHero } from '@/components/ui/SectionHeading';

export function generateMetadata(): Metadata {
  const dict = getDictionary(getLocale());
  return { title: dict.gallery.title, description: dict.gallery.subtitle, alternates: { canonical: '/gallery' } };
}

export default async function GalleryPage({ searchParams }: { searchParams: { category?: string } }) {
  const dict = getDictionary(getLocale());
  const [images, categories] = await Promise.all([getGallery(), getCategories()]);
  const initial = categories.some((c) => c.slug === searchParams.category) ? searchParams.category : undefined;

  return (
    <>
      <PageHero eyebrow={dict.nav.gallery} title={dict.gallery.title} subtitle={dict.gallery.subtitle} />
      <section className="container pb-24 md:pb-36">
        <GalleryGrid images={images} categories={categories} initialCategory={initial} />
      </section>
    </>
  );
}
