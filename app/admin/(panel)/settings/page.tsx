import { requireAdmin } from '@/lib/auth';
import { loadContent } from '@/lib/data/admin-content';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { PageHeader } from '@/components/admin/ui';

export const metadata = { title: 'პარამეტრები' };

export default async function SettingsAdmin() {
  const { supabase, admin } = await requireAdmin();
  const content = await loadContent(supabase);
  return (
    <>
      <PageHeader title="პარამეტრები" subtitle="მაღაზია, კონტაქტი, მიწოდება და ანგარიში" />
      <SettingsForm content={content} email={admin.email} />
    </>
  );
}
