'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signIn } from '@/app/admin/actions/auth';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="a-btn-primary w-full py-3">
      {pending ? 'შესვლა...' : 'შესვლა'}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useFormState(signIn, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="a-label">ელ-ფოსტა</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="a-input" />
      </div>
      <div>
        <label htmlFor="password" className="a-label">პაროლი</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required minLength={6} className="a-input" />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-wine/10 px-3 py-2 text-sm text-wine dark:text-[#F08A92]">{state.error}</p>
      )}
      <Submit />
    </form>
  );
}
