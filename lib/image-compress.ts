/**
 * ფოტოს შეკუმშვა ბრაუზერში ატვირთვამდე: max ზომა + WebP.
 * ტელეფონის 8–12 მბ ფოტო ხდება ~200–600 კბ, რაც Vercel-ის ლიმიტში ეტევა.
 */
export async function compressImage(file: File, maxSize = 2000, quality = 0.82): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', quality));
    if (!blob || blob.type !== 'image/webp') {
      const jpeg = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', quality));
      if (!jpeg) return file;
      return new File([jpeg], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
    }
    // თუ შეკუმშვამ ფაილი არ შეამცირა, ვტოვებთ ორიგინალს
    if (blob.size >= file.size && scale === 1 && ['image/webp', 'image/jpeg'].includes(file.type)) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
  } catch {
    return file;
  }
}

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif'];
