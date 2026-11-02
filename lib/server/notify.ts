import 'server-only';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export const isNotifyConfigured = () =>
  Boolean(
    (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) ||
      (process.env.RESEND_API_KEY && process.env.ORDER_EMAIL_TO),
  );

/** ადმინისტრატორის შეტყობინება ახალ შეკვეთაზე: Telegram და/ან ელ-ფოსტა (Resend) */
export async function notifyAdmin({
  subject,
  lines,
  photos = [],
}: {
  subject: string;
  lines: [string, string | null | undefined][];
  photos?: { name: string; buf: Uint8Array; type: string }[];
}) {
  const rows = lines.filter(([, v]) => v && String(v).trim());
  const tasks: Promise<unknown>[] = [];

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (token && chat) {
    const text = `<b>${esc(subject)}</b>\n\n${rows.map(([k, v]) => `<b>${esc(k)}:</b> ${esc(String(v))}`).join('\n')}`;
    tasks.push(
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat, text: text.slice(0, 4000), parse_mode: 'HTML' }),
      }).then(async () => {
        for (const p of photos.slice(0, 5)) {
          const fd = new FormData();
          fd.append('chat_id', chat);
          fd.append('document', new Blob([new Uint8Array(p.buf)], { type: p.type }), p.name);
          await fetch(`https://api.telegram.org/bot${token}/sendDocument`, { method: 'POST', body: fd });
        }
      }),
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_EMAIL_TO;
  if (resendKey && to) {
    const html = `<h2 style="font-family:Georgia,serif">${esc(subject)}</h2><table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows
      .map(([k, v]) => `<tr><td style="color:#736359;vertical-align:top"><b>${esc(k)}</b></td><td>${esc(String(v)).replace(/\n/g, '<br>')}</td></tr>`)
      .join('')}</table>`;
    tasks.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.ORDER_EMAIL_FROM || 'Nanika <onboarding@resend.dev>',
          to: to.split(',').map((s) => s.trim()),
          subject,
          html,
          attachments: photos.slice(0, 5).map((p) => ({
            filename: p.name,
            content: Buffer.from(p.buf).toString('base64'),
          })),
        }),
      }),
    );
  }

  const results = await Promise.allSettled(tasks);
  results.forEach((r) => r.status === 'rejected' && console.error('[notify]', r.reason));
  return results.some((r) => r.status === 'fulfilled');
}
