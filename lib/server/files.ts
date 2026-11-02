import 'server-only';

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel-ის 4.5 მბ request ლიმიტის ქვემოთ

/** MIME ტიპის დადგენა ფაილის შიგთავსით (magic bytes) — Content-Type-ს არ ვენდობით */
export function sniffImageType(buf: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif' | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  const ascii = (s: number, e: number) => String.fromCharCode(...buf.slice(s, e));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  if (ascii(4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 12))) return 'image/avif';
  return null;
}

export const extFor = (mime: string) =>
  ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' })[mime] ?? 'bin';

export async function readValidatedImage(file: File) {
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) return { error: 'size' as const };
  const buf = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(buf);
  if (!type) return { error: 'type' as const };
  return { buf, type };
}

/** მარტივი in-memory rate limit (ერთ ინსტანსზე) — სპამისგან ძირითადი დაცვა */
const hits = new Map<string, number[]>();
export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= limit) return false;
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return true;
}

export const clientIp = (req: Request) =>
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
