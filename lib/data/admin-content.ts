import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CONTENT_KEYS, defaultContent, mergeContent, type SiteContent } from '@/lib/content';

/** ადმინისთვის: კონტენტი პირდაპირ ბაზიდან (ქეშის გარეშე), ნაგულისხმევებთან შერწყმული */
export async function loadContent(supabase: SupabaseClient): Promise<SiteContent> {
  const base = defaultContent();
  const { data } = await supabase.from('website_content').select('key, value');
  const out = { ...base } as Record<string, unknown>;
  for (const row of data ?? []) {
    if ((CONTENT_KEYS as string[]).includes(row.key)) {
      out[row.key] = mergeContent((base as Record<string, unknown>)[row.key], row.value);
    }
  }
  return out as SiteContent;
}
