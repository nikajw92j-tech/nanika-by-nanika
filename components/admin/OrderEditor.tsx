'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { setRequestStatus, updateOrder } from '@/app/admin/actions/orders';
import { orderStatusLabel, paymentLabel, quoteLabel } from '@/lib/admin-labels';
import { PAYMENT_STATUSES, type Order, type OrderStatus, type PaymentStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from '@/components/ui/icons';
import { Field, useToast } from './ui';

const FLOW: OrderStatus[] = ['new', 'confirmed', 'in_production', 'ready', 'shipped', 'completed'];

export function OrderEditor({ order }: { order: Order }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [payment, setPayment] = useState<PaymentStatus>(order.payment_status);
  const [paymentNote, setPaymentNote] = useState(order.payment_note ?? '');
  const [total, setTotal] = useState(order.total != null ? String(order.total) : '');
  const [quote, setQuote] = useState(order.quote_status);
  const [notes, setNotes] = useState(order.admin_notes ?? '');
  const markingPaid = payment === 'paid' && order.payment_status !== 'paid';

  const save = (override?: Partial<{ status: OrderStatus }>) =>
    start(async () => {
      const r = await updateOrder(order.id, {
        status: override?.status ?? status,
        payment_status: payment,
        payment_note: paymentNote.trim() || null,
        total: total.trim() === '' ? null : Number(total),
        quote_status: quote,
        admin_notes: notes.trim() || null,
      });
      if (!r.ok) return toast(r.error, 'error');
      if (override?.status) setStatus(override.status);
      toast('შეკვეთა განახლდა');
      router.refresh();
    });

  const stepIndex = FLOW.indexOf(status);
  const next = stepIndex >= 0 && stepIndex < FLOW.length - 1 ? FLOW[stepIndex + 1] : null;

  return (
    <div className="space-y-6">
      <section className="a-card">
        <h2 className="mb-4 font-medium">სტატუსი</h2>
        <ol className="mb-5 flex flex-wrap gap-1.5">
          {FLOW.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition',
                  status === s ? 'border-ink bg-ink text-cream dark:border-gold dark:bg-gold dark:text-ink' : i < stepIndex ? 'border-gold/50 text-[#8C6A3F] dark:text-gold' : 'border-ink/15 dark:border-cream/15',
                )}
              >
                {i < stepIndex && status !== 'cancelled' && <Check width={12} height={12} />}
                {orderStatusLabel[s]}
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => setStatus('cancelled')} className={cn('rounded-full border px-3 py-1.5 text-xs', status === 'cancelled' ? 'border-wine bg-wine text-cream' : 'border-wine/30 text-wine dark:text-[#F08A92]')}>
              {orderStatusLabel.cancelled}
            </button>
          </li>
        </ol>
        {next && status === order.status && (
          <button type="button" disabled={pending} onClick={() => save({ status: next })} className="a-btn-primary">
            → {orderStatusLabel[next]}
          </button>
        )}
      </section>

      <section className="a-card space-y-4">
        <h2 className="font-medium">ფასი და გადახდა</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="შეკვეთის ფასი (₾)" hint="ინდივიდუალური შეკვეთისთვის — შეთანხმებული ფასი">
            <input className="a-input" type="number" min="0" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} />
          </Field>
          <Field label="ფასის სტატუსი">
            <select className="a-input" value={quote} onChange={(e) => setQuote(e.target.value as Order['quote_status'])}>
              {(['fixed', 'pending', 'quoted'] as const).map((q) => <option key={q} value={q}>{quoteLabel[q]}</option>)}
            </select>
          </Field>
          <Field label="გადახდის სტატუსი">
            <select className="a-input" value={payment} onChange={(e) => setPayment(e.target.value as PaymentStatus)}>
              {PAYMENT_STATUSES.map((p) => <option key={p} value={p}>{paymentLabel[p]}</option>)}
            </select>
          </Field>
          <Field label={`გადახდის დადასტურება${markingPaid ? ' *' : ''}`} hint="მაგ. ბანკის ტრანზაქციის ნომერი, თარიღი">
            <input className={cn('a-input', markingPaid && !paymentNote.trim() && 'border-gold')} value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} />
          </Field>
        </div>
        {markingPaid && (
          <p className="rounded-xl bg-gold/10 px-3 py-2 text-xs">
            ⚠️ მონიშნე „გადახდილად“ მხოლოდ მას შემდეგ, რაც თანხის მიღება გადაამოწმე (ბანკის ამონაწერი / ტრანზაქცია). შემოსავლის სტატისტიკა ითვლის მხოლოდ ასეთ შეკვეთებს.
          </p>
        )}
        {order.paid_at && <p className="a-muted text-xs">გადახდა დადასტურდა: {new Date(order.paid_at).toLocaleString('ka-GE')}</p>}
      </section>

      <section className="a-card space-y-3">
        <Field label="შიდა შენიშვნები (კლიენტი ვერ ხედავს)">
          <textarea className="a-input" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <button type="button" disabled={pending} onClick={() => save()} className="a-btn-primary w-full sm:w-auto">
          {pending ? 'ინახება...' : 'ცვლილებების შენახვა'}
        </button>
      </section>
    </div>
  );
}

export function RequestActions({ id, status }: { id: string; status: 'new' | 'answered' | 'archived' }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <select
      className="a-input w-auto py-1.5 text-xs"
      value={status}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          const r = await setRequestStatus(id, e.target.value);
          if (!r.ok) toast(r.error, 'error');
          router.refresh();
        })
      }
    >
      <option value="new">ახალი</option>
      <option value="answered">ნაპასუხები</option>
      <option value="archived">არქივი</option>
    </select>
  );
}

