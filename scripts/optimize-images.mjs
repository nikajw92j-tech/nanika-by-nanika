// ფოტოების ოპტიმიზაცია: images/**  →  public/images/** (WebP, max 2000px, ხარისხი 80)
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = path.resolve('images');
const OUT = path.resolve('public/images');
const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic']);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else if (EXT.has(path.extname(e.name).toLowerCase())) files.push(full);
  }
  return files;
}

const files = await walk(SRC);
let done = 0;
for (const file of files) {
  const rel = path.relative(SRC, file);
  const target = path.join(OUT, rel).replace(/\.[^.]+$/, '.webp');
  await mkdir(path.dirname(target), { recursive: true });
  try {
    const [s, t] = await Promise.all([stat(file), stat(target).catch(() => null)]);
    if (t && t.mtimeMs > s.mtimeMs) continue;
  } catch {}
  await sharp(file)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(target);
  done++;
  console.log('✓', rel, '→', path.relative(process.cwd(), target));
}
console.log(`დასრულდა: ${done} ფაილი ოპტიმიზირებულია (${files.length} სულ).`);
