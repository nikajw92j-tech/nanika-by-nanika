import type { GalleryImage } from '@/lib/types';

/**
 * სტატიკური გალერეა — public/images/gallery/ საქაღალდიდან.
 * ახალი ფოტოს დამატება (ბაზის გარეშე):
 *   1. ჩააგდე ფოტო images/gallery/-ში სახელით "კატეგორია-ნომერი.jpg" (მაგ. kaba-03.jpg)
 *   2. გაუშვი: npm run optimize-images
 *   3. დაამატე ფაილის სახელი ქვემოთ სიაში (.webp გაფართოებით)
 * Supabase-ის დაკავშირების შემდეგ ფოტოები ემატება ადმინ-პანელიდან (/admin/gallery).
 */
const files: { file: string; title?: string; width: number; height: number }[] = [
  { file: 'kostiumi-01.webp', title: 'წითელი კოსტიუმი', width: 206, height: 206 },
  { file: 'kostiumi-02.webp', title: 'ჟაკეტი ატელიეში', width: 206, height: 206 },
  { file: 'sportuli-01.webp', title: 'ჰუდი ქართული დროშით', width: 206, height: 206 },
  { file: 'brendi-01.webp', title: 'Nanika — Made in Georgia', width: 206, height: 206 },
  { file: 'brendi-02.webp', title: 'Nanika ბირკა', width: 206, height: 206 },
];

/** ფაილის სახელის პრეფიქსიდან კატეგორიის დადგენა: kaba-01.webp → kaba */
export const categoryFromFilename = (file: string) =>
  (file.split('/').pop() ?? file).split('-')[0].toLowerCase();

export const staticGallery: GalleryImage[] = files.map((f, i) => ({
  id: `static-${i}`,
  storage_path: null,
  url: `/images/gallery/${f.file}`,
  category_slug: categoryFromFilename(f.file),
  title: { ka: f.title ?? '' },
  description: {},
  featured: true,
  published: true,
  sort_order: i,
  width: f.width,
  height: f.height,
}));
