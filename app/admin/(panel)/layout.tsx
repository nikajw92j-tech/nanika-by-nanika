import { requireAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { AdminShell } from '@/components/admin/AdminShell';
import { SetupNotice } from '@/components/admin/SetupNotice';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <SetupNotice />;
  const { supabase, admin } = await requireAdmin();
  const { count } = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'new');
  return (
    <AdminShell email={admin.email} newOrders={count ?? 0}>
      {children}
    </AdminShell>
  );
}
