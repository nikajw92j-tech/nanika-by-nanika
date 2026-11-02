import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { SetupNotice } from '@/components/admin/SetupNotice';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'შესვლა' };

export default async function LoginPage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;
  if (await getAdmin()) redirect('/admin');
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="a-card w-full max-w-sm p-8">
        <div className="mb-8 text-center">
          <p className="font-serif text-3xl uppercase tracking-[0.22em]">Nanika</p>
          <p className="a-muted mt-1 text-xs uppercase tracking-[0.3em]">ადმინ-პანელი</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
