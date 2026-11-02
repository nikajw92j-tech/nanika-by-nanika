import { NextResponse } from 'next/server';
import ka from '@/locales/ka.json';
import { getGallery, getProductBySlug } from '@/lib/data/public';
import { isServiceRoleConfigured } from '@/lib/supabase/env';
import { createServiceClient } from '@/lib/supabase/service';
import { clientIp, extFor, rateLimit, readValidatedImage } from '@/lib/server/files';
import { isNotifyConfigured, notifyAdmin } from '@/lib/server/notify';
import { MAX_ORDER_FILES, MEASUREMENT_KEYS, makeOrderSchema } from '@/lib/validation/order';
import { siteConfig } from '@/config/site';

export const runtime = 'nodejs';

const schema = makeOrderSchema(ka.order.errors);
const fail = (status: number, error: string) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  if (!rateLimit(`order:${clientIp(req)}`)) return fail(429, 'too_many_requests');

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, 'bad_request');
  }

  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get('payload') ?? ''));
  } catch {
    return fail(400, 'bad_payload');
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'validation', issues: parsed.error.flatten() }, { status: 422 });
  const data = parsed.data;
  if (data.website) return NextResponse.json({ ok: true, orderNumber: null }); // honeypot — ბოტი

  // ფაილების ვალიდაცია: რაოდენობა, ზომა, რეალური ტიპი (magic bytes)
  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_ORDER_FILES) return fail(400, 'too_many_files');
  const images: { buf: Uint8Array; type: string; name: string }[] = [];
  for (const [i, f] of files.entries()) {
    const r = await readValidatedImage(f);
    if ('error' in r) return fail(400, `file_${r.error}`);
    images.push({ buf: r.buf, type: r.type, name: `reference-${i + 1}.${extFor(r.type)}` });
  }

  // პროდუქტი/მოდელი — ფასს და დეტალებს ვიღებთ სერვერიდან, კლიენტს არ ვენდობით
  const product = data.product ? await getProductBySlug(data.product) : null;
  const model = data.model ? (await getGallery()).find((g) => g.id === data.model) : null;
  const sizeFromList = product && !data.customSize && product.sizes.includes(data.size) ? data.size : null;
  const color = product && data.color && !product.colors.some((c) => c.name === data.color) ? null : data.color || null;
  const isFixed = Boolean(product && sizeFromList);
  const total = isFixed ? product!.finalPrice : null;

  const measurements = Object.fromEntries(
    MEASUREMENT_KEYS.filter((k) => data.measurements[k]).map((k) => [k, Number(data.measurements[k]!.replace(',', '.'))]),
  );
  const modelUrl = model ? (model.url.startsWith('http') ? model.url : `${siteConfig.url}${model.url}`) : null;
  const notes = [data.comment, modelUrl ? `გალერეის მოდელი: ${modelUrl}` : ''].filter(Boolean).join('\n\n') || null;

  const canSave = isServiceRoleConfigured();
  if (!canSave && !isNotifyConfigured()) return fail(503, 'not_configured');

  let orderNumber: number | null = null;
  if (canSave) {
    const db = createServiceClient();
    const { data: order, error } = await db
      .from('orders')
      .insert({
        kind: product ? 'product' : 'custom',
        customer_name: data.name,
        phone: data.phone,
        city: data.city,
        contact_method: data.contactMethod,
        category: product?.category?.slug ?? model?.category_slug ?? (data.category || null),
        measurements: Object.keys(measurements).length ? measurements : null,
        measurements_later: data.measurementsLater,
        color,
        desired_date: data.desiredDate || null,
        notes,
        total,
        quote_status: isFixed ? 'fixed' : 'pending',
        status: 'new',
        payment_status: 'unpaid', // ⚠️ გადახდა დასტურდება მხოლოდ ადმინის მიერ, ვერიფიკაციის შემდეგ
        locale: typeof (raw as { locale?: unknown }).locale === 'string' ? String((raw as { locale: string }).locale).slice(0, 2) : 'ka',
      })
      .select('id, order_number')
      .single();
    if (error || !order) {
      console.error('[order] insert', error?.message);
      return fail(500, 'save_failed');
    }
    orderNumber = order.order_number;

    if (product) {
      await db.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name.ka || product.slug,
        product_slug: product.slug,
        color,
        size: sizeFromList,
        custom_size: !sizeFromList,
        quantity: 1,
        unit_price: product.finalPrice,
      });
    }

    if (images.length) {
      const paths: string[] = [];
      for (const img of images) {
        const path = `${order.id}/${crypto.randomUUID()}.${extFor(img.type)}`;
        const { error: upErr } = await db.storage
          .from('order-uploads')
          .upload(path, img.buf, { contentType: img.type, upsert: false });
        if (upErr) console.error('[order] upload', upErr.message);
        else paths.push(path);
      }
      if (paths.length) await db.from('orders').update({ reference_images: paths }).eq('id', order.id);
    }
  }

  const m = Object.entries(measurements).map(([k, v]) => `${k}: ${v}`).join(', ');
  await notifyAdmin({
    subject: `🧵 ახალი შეკვეთა${orderNumber ? ` #${orderNumber}` : ''} — ${data.name}`,
    lines: [
      ['სახელი', data.name],
      ['ტელეფონი', data.phone],
      ['ქალაქი', data.city],
      ['კავშირი', data.contactMethod],
      ['პროდუქტი', product ? `${product.name.ka} (${siteConfig.url}/products/${product.slug})` : null],
      ['კატეგორია', data.category || null],
      ['ზომა', sizeFromList ?? (product ? 'ინდივიდუალური' : null)],
      ['ფერი/ქსოვილი', color],
      ['ზომები (სმ)', data.measurementsLater ? 'მოგვიანებით გამოგზავნის' : m || null],
      ['ფასი', total != null ? `${total} ₾` : 'ინდივიდუალური (დასათვლელი)'],
      ['სასურველი ვადა', data.desiredDate || null],
      ['კომენტარი', notes],
      ['ფოტოები', images.length ? `${images.length} ფაილი` : null],
      ['ადმინ-პანელი', canSave ? `${siteConfig.url}/admin/orders` : null],
    ],
    photos: canSave ? [] : images, // ბაზის გარეშე ფოტოებს პირდაპირ ვგზავნით
  });

  return NextResponse.json({ ok: true, orderNumber });
}
