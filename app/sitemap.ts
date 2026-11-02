import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getProducts } from '@/lib/data/public';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages = ['', '/gallery', '/products', '/services', '/how-to-order', '/about', '/order'].map((p) => ({
    url: `${siteConfig.url}${p}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.8,
  }));
  const products = (await getProducts()).map((p) => ({
    url: `${siteConfig.url}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  return [...pages, ...products];
}
