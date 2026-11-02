// ადმინისტრატორის შექმნა: npm run create-admin -- email@example.com "ძლიერი-პაროლი"
// საჭიროა .env.local-ში NEXT_PUBLIC_SUPABASE_URL და SUPABASE_SERVICE_ROLE_KEY.
import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

const [email, password] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !password) {
  console.error('გამოყენება: npm run create-admin -- email@example.com "პაროლი"');
  process.exit(1);
}
if (password.length < 10) {
  console.error('პაროლი მინიმუმ 10 სიმბოლო უნდა იყოს.');
  process.exit(1);
}
if (!url || !key) {
  console.error('.env.local-ში აკლია NEXT_PUBLIC_SUPABASE_URL ან SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

let userId;
const { data: created, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
if (error) {
  // მომხმარებელი უკვე არსებობს — ვპოულობთ
  const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!existing) {
    console.error('შეცდომა:', error.message);
    process.exit(1);
  }
  userId = existing.id;
  await db.auth.admin.updateUserById(userId, { password });
  console.log('მომხმარებელი უკვე არსებობდა — პაროლი განახლდა.');
} else {
  userId = created.user.id;
}

const { error: e2 } = await db.from('admin_users').upsert({ user_id: userId, email });
if (e2) {
  console.error('admin_users ცხრილში ჩაწერა ვერ მოხერხდა (გაუშვი მიგრაცია?):', e2.message);
  process.exit(1);
}
console.log(`✓ ადმინისტრატორი მზადაა: ${email} → /admin/login`);
