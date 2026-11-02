import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { extFor, readValidatedImage } from '@/lib/server/files';

export const runtime = 'nodejs';

const BUCKETS = ['product-images', 'gallery', 'site'] as const;
type Bucket = (typeof BUCKETS)[number];

/**
 * ადმინის ფოტოს ატვირთვა: სერვერზე მოწმდება ადმინის სესია, ფაილის ზომა და რეალური ტიპი.
 * ატვირთვა ხდება ადმინის სესიით — Storage RLS დამატებით ამოწმებს is_admin()-ს.
 */
export async function POST(req: Request) {
  const auth = await getAdmin();
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const bucket = String(form?.get('bucket') ?? '') as Bucket;
  if (!(file instanceof File)) return NextResponse.json({ error: 'no_file' }, { status: 400 });
  if (!BUCKETS.includes(bucket)) return NextResponse.json({ error: 'bad_bucket' }, { status: 400 });

  const r = await readValidatedImage(file);
  if ('error' in r) {
    return NextResponse.json(
      { error: r.error === 'size' ? 'ფაილი ძალიან დიდია (მაქს. 4 მბ)' : 'დაშვებულია მხოლოდ JPG, PNG, WEBP, AVIF' },
      { status: 400 },
    );
  }

  const now = new Date();
  const path = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.${extFor(r.type)}`;
  const { error } = await auth.supabase.storage
    .from(bucket)
    .upload(path, r.buf, { contentType: r.type, cacheControl: '31536000', upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = auth.supabase.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({ path, url: data.publicUrl, bucket });
}
