import 'server-only';
import { revalidatePath, revalidateTag } from 'next/cache';
import { TAGS } from '@/lib/data/tags';

/** ადმინის ცვლილების შემდეგ საჯარო საიტის განახლება — redeploy-ის გარეშე */
export function refreshPublic(...tags: (keyof typeof TAGS)[]) {
  tags.forEach((t) => revalidateTag(TAGS[t]));
  revalidatePath('/', 'layout');
}
