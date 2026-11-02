'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/client';

export function QuestionForm() {
  const { dict } = useI18n();
  const t = dict.order;
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  return state === 'done' ? (
    <p className="text-sm text-ink">{t.questionSent}</p>
  ) : (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setState('sending');
        const res = await fetch('/api/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(fd)),
        }).catch(() => null);
        setState(res?.ok ? 'done' : 'error');
      }}
    >
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div>
        <label htmlFor="q-name" className="label">{t.name}</label>
        <input id="q-name" name="name" required minLength={2} className="input" />
      </div>
      <div>
        <label htmlFor="q-phone" className="label">{t.phone}</label>
        <input id="q-phone" name="phone" type="tel" required pattern="\+?[\d\s()-]{9,20}" className="input" />
      </div>
      <div>
        <label htmlFor="q-msg" className="label">{t.message}</label>
        <textarea id="q-msg" name="message" required minLength={3} rows={3} className="input resize-none" />
      </div>
      {state === 'error' && <p className="field-error" role="alert">{t.errorText}</p>}
      <button type="submit" disabled={state === 'sending'} className="link-underline text-sm font-medium uppercase tracking-[0.2em] text-ink disabled:opacity-50">
        {state === 'sending' ? t.sending : t.send} →
      </button>
    </form>
  );
}
