import { getActivePromotions, getCategories, getContent, getGallery, getProducts } from '@/lib/data/public';
import { tr } from '@/lib/i18n/config';
import { getDictionary, getLocale } from '@/lib/i18n/server';
import { StitchLine } from '@/components/animations/StitchLine';
import { Marquee } from '@/components/animations/Marquee';
import { Stagger, StaggerItem } from '@/components/animations/Reveal';
import { ProductCard } from '@/components/products/ProductCard';
import { AboutShort } from '@/components/sections/AboutShort';
import { BeforeAfter } from '@/components/sections/BeforeAfter';
import { Categories } from '@/components/sections/Categories';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { GalleryPreview } from '@/components/sections/GalleryPreview';
import { Hero } from '@/components/sections/Hero';
import { Process } from '@/components/sections/Process';
import { PromoBanner } from '@/components/sections/PromoBanner';
import { Reviews } from '@/components/sections/Reviews';
import { SocialFeed } from '@/components/sections/SocialFeed';
import { Stats } from '@/components/sections/Stats';
import { WhyNanika } from '@/components/sections/WhyNanika';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ArrowRight } from '@/components/ui/icons';

export default async function HomePage() {
  const locale = getLocale();
  const dict = getDictionary(locale);
  const [content, gallery, categories, products, promotions] = await Promise.all([
    getContent(),
    getGallery(),
    getCategories(),
    getProducts(),
    getActivePromotions(),
  ]);

  const featuredGallery = gallery.filter((g) => g.featured);
  const previewSource = (featuredGallery.length ? featuredGallery : gallery).slice(0, 12);
  // მინიმუმ 8 უჯრა — დანარჩენი ბრენდის ფერის placeholder-ია (TODO: დაამატე ფოტოები)
  const preview = [
    ...previewSource.map((g) => ({ id: g.id, url: g.url, title: tr(g.title, locale) })),
    ...Array.from({ length: Math.max(0, 8 - previewSource.length) }, (_, i) => ({
      id: `ph-${i}`,
      url: null,
      title: '',
    })),
  ];

  const categoryCards = categories.slice(0, 7).map((c) => ({
    slug: c.slug,
    name: tr(c.name, locale),
    image: c.image_url ?? gallery.find((g) => g.category_slug === c.slug)?.url ?? null,
  }));

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const promoProducts = products.filter((p) => p.discountPercent).slice(0, 4);
  const showcase = featuredProducts.length ? featuredProducts : promoProducts;

  return (
    <>
      <Hero
        eyebrow={tr(content.hero.eyebrow, locale)}
        title={tr(content.hero.title, locale)}
        subtitle={tr(content.hero.subtitle, locale)}
        image={content.hero.images[0] ?? null}
      />
      <PromoBanner
        cta={dict.common.viewDetails}
        promos={promotions
          .filter((p) => p.show_on_home)
          .map((p) => ({
            id: p.id,
            title: tr(p.title, locale),
            subtitle: tr(p.subtitle, locale),
            image: p.image_url,
            link: p.link,
            discount: p.discount_percent,
          }))}
      />
      <Marquee items={dict.marquee} />
      <AboutShort
        eyebrow={dict.aboutShort.eyebrow}
        title={tr(content.about.title, locale)}
        text={tr(content.about.text, locale)}
        signature={dict.aboutShort.signature}
        cta={dict.aboutShort.cta}
        image={content.about.image}
      />
      <Categories
        eyebrow={dict.categories.eyebrow}
        title={dict.categories.title}
        subtitle={dict.categories.subtitle}
        items={categoryCards}
        viewLabel={dict.common.view}
        soonLabel={dict.common.photoSoon}
      />
      <WhyNanika eyebrow={dict.why.eyebrow} title={dict.why.title} items={dict.why.items} />
      <Process eyebrow={dict.process.eyebrow} title={dict.process.title} steps={dict.process.steps} />

      {showcase.length > 0 && (
        <section className="container py-24 md:py-36">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHeading eyebrow={dict.featured.eyebrow} title={dict.featured.title} />
            <ButtonLink href="/products" variant="outline" icon={<ArrowRight width={18} height={18} />}>
              {dict.featured.cta}
            </ButtonLink>
          </div>
          <Stagger className="mt-14 grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {showcase.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <GalleryPreview
        eyebrow={dict.galleryPreview.eyebrow}
        title={dict.galleryPreview.title}
        cta={dict.galleryPreview.cta}
        items={preview}
        viewLabel={dict.common.view}
        placeholderLabel={dict.common.photoSoon}
      />
      <StitchLine />
      <BeforeAfter
        eyebrow={dict.beforeAfter.eyebrow}
        title={dict.beforeAfter.title}
        subtitle={dict.beforeAfter.subtitle}
        beforeLabel={dict.beforeAfter.before}
        afterLabel={dict.beforeAfter.after}
        hint={dict.beforeAfter.hint}
        pairs={content.beforeAfter.pairs.map((p) => ({ ...p, caption: tr(p.caption, locale) }))}
      />
      <Stats
        eyebrow={dict.stats.eyebrow}
        items={content.stats.items.map((s) => ({ ...s, label: tr(s.label, locale) }))}
      />
      <Reviews
        eyebrow={dict.reviews.eyebrow}
        title={dict.reviews.title}
        placeholder={dict.reviews.placeholder}
        facebook={content.social.facebook}
        items={content.reviews.items.map((r) => ({ ...r, text: tr(r.text, locale) }))}
      />
      <SocialFeed
        eyebrow={dict.social.eyebrow}
        title={dict.social.title}
        facebookLabel={dict.social.facebook}
        facebook={content.social.facebook}
        instagram={content.social.instagram}
        images={gallery.slice(0, 6).map((g) => ({ url: g.url, alt: tr(g.title, locale) || 'Nanika' }))}
      />
      <StitchLine flip className="mb-8" />
      <CtaBanner
        title={dict.cta.title}
        text={dict.cta.text}
        formLabel={dict.common.form}
        whatsapp={content.contact.whatsapp}
        messenger={content.social.messenger}
      />
    </>
  );
}
