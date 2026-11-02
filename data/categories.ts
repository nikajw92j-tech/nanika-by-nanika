import type { Category } from '@/lib/types';

/** ნაგულისხმევი კატეგორიები (გამოიყენება, სანამ Supabase არ არის დაკავშირებული). TODO: დააზუსტე. */
export const staticCategories: Category[] = [
  ['kaba', 'კაბები', 'Dresses', 'Платья'],
  ['sagamos', 'საღამოს კაბები', 'Evening dresses', 'Вечерние платья'],
  ['kostiumi', 'კოსტიუმები', 'Suits', 'Костюмы'],
  ['kvedabolo', 'ქვედაბოლოები', 'Skirts', 'Юбки'],
  ['sharvali', 'შარვლები', 'Trousers', 'Брюки'],
  ['bluza', 'ბლუზები', 'Blouses', 'Блузки'],
  ['sportuli', 'სპორტული', 'Sportswear', 'Спортивная одежда'],
  ['sabavshvo', 'საბავშვო', 'Kids', 'Детская одежда'],
  ['erovnuli', 'ეროვნული სამოსი', 'National wear', 'Национальная одежда'],
].map(([slug, ka, en, ru], i) => ({
  id: `static-${slug}`,
  slug,
  name: { ka, en, ru },
  image_url: null,
  sort_order: i + 1,
  active: true,
}));
