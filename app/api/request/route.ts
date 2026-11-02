import { NextResponse } from 'next/server';
import { isServiceRoleConfigured } from '@/lib/supabase/env';
import { createServiceClient } from '@/lib/supabase/service';
import { clientIp, rateLimit } from '@/lib/server/files';
import { isNotifyConfigured, notifyAdmin } from '@/lib/server/notify';
import { requestSchema } from '@/lib/validation/order';

export const runtime = 'nodejs';

/** სწრაფი კითხვა / შეტყობინება საიტიდან → customer_requests */
export async function POST(req: Request) {
  if (!rateLimit(`request:${clientIp(req)}`)) {
    return NextResponse.json({ ok: false, error: 'too_many_requests' }, { status: 429 });
  }
  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'validation' }, { status: 422 });
  const { name, phone, message, website } = parsed.data;
  if (website) return NextResponse.json({ ok: true });

  if (!isServiceRoleConfigured() && !isNotifyConfigured()) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }
  if (isServiceRoleConfigured()) {
    const { error } = await createServiceClient().from('customer_requests').insert({ name, phone, message });
    if (error) {
      console.error('[request]', error.message);
      return NextResponse.json({ ok: false, error: 'save_failed' }, { status: 500 });
    }
  }
  await notifyAdmin({
    subject: `💬 ახალი შეტყობინება — ${name}`,
    lines: [
      ['სახელი', name],
      ['ტელეფონი', phone],
      ['შეტყობინება', message],
    ],
  });
  return NextResponse.json({ ok: true });
}
