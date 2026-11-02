# Nanika by Nanika — ვებსაიტი და ადმინ-პანელი

ქართული ტანსაცმლის ბრენდის საიტი: ინდივიდუალური შეკერვა, კოლექცია, გალერეა, შეკვეთის ფორმა და სრული ადმინ-პანელი.

**სტეკი:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Lenis · Supabase (PostgreSQL, Storage, Auth) · Zod · react-hook-form

---

## 1. ლოკალურად გაშვება

```bash
npm install
cp .env.example .env.local      # შეავსე მნიშვნელობები (იხ. ქვემოთ)
npm run dev                     # http://localhost:3000
```

> საიტი მუშაობს **Supabase-ის გარეშეც** — მაშინ ჩანს სტატიკური ტექსტები (`locales/`) და ფოტოები (`public/images/`).
> ადმინ-პანელი, კოლექცია და შეკვეთების შენახვა მოითხოვს Supabase-ს.

## 2. Supabase-ის დაყენება (ერთხელ)

1. შექმენი უფასო პროექტი: <https://supabase.com> → New project.
2. **SQL Editor** → ჩასვი და გაუშვი `supabase/migrations/0001_init.sql`-ის შიგთავსი.
   ქმნის ცხრილებს, RLS უსაფრთხოების წესებს, ფოტოების ბაკეტებს და საწყის კატეგორიებს.
3. **Project Settings → API**-დან დააკოპირე `.env.local`-ში:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` — service_role key (⚠️ საიდუმლოა, არასოდეს გაუზიარო და არ დაუმატო `NEXT_PUBLIC_`)
4. შექმენი ადმინისტრატორი:
   ```bash
   npm run create-admin -- nana_janiashvili@yahoo.com "ძლიერი-პაროლი-10+"
   ```
5. **Authentication → Providers → Email**: გამორთე „Allow new users to sign up“ (რეგისტრაცია საჭირო არ არის — ადმინს ქმნის მხოლოდ სკრიპტი).
6. შედი: `/admin/login`.

## 3. შეკვეთის შეტყობინებები (სურვილისამებრ)

ახალ შეკვეთაზე შეტყობინება მოდის ერთ-ერთზე ან ორივეზე:

| არხი | ცვლადები |
|---|---|
| **Telegram** | `TELEGRAM_BOT_TOKEN` (@BotFather), `TELEGRAM_CHAT_ID` (@userinfobot) — ბოტს ჯერ მიწერე /start |
| **ელ-ფოსტა (Resend)** | `RESEND_API_KEY`, `ORDER_EMAIL_TO`, `ORDER_EMAIL_FROM` (დადასტურებული დომენიდან) |

თუ არც Supabase და არც შეტყობინებები არ არის კონფიგურირებული, ფორმა აჩვენებს შეცდომას და WhatsApp-ის ბმულს.

## 4. Vercel-ზე გაშვება

1. ატვირთე პროექტი GitHub-ზე → <https://vercel.com/new> → Import.
2. **Environment Variables**-ში დაამატე ყველა ცვლადი `.env.example`-დან (`NEXT_PUBLIC_SITE_URL` = შენი დომენი).
3. Deploy. დომენის მიბმა: Project → Settings → Domains.

კოდის განახლება: `git push` → Vercel ავტომატურად აახლებს საიტს.

## 5. ადმინ-პანელი (`/admin`) — კოდის გარეშე მართვა

| გვერდი | რას აკეთებს |
|---|---|
| **მიმოხილვა** | სტატისტიკა, შემოსავალი (მხოლოდ გადახდილი), გრაფიკი, ნანახი პროდუქტები, ბოლო შეკვეთები |
| **პროდუქტები** | დამატება / რედაქტირება / წაშლა / გამოქვეყნება / დამალვა; ფოტოები (drag & drop, თანმიმდევრობა, მთავარი ფოტო, ჩანაცვლება, ავტომატური შეკუმშვა); ფასი, ფერები, ზომები, SEO |
| **შეკვეთები** | ძებნა, ფილტრი, სტატუსი (ახალი → დადასტურებული → იკერება → მზადაა → გაგზავნილი → დასრულებული / გაუქმებული), ფასის შეთავაზება, გადახდა, კლიენტის ფოტოები; შეტყობინებების ჩანართი |
| **გალერეა** | ფოტოების მასობრივი ატვირთვა, კატეგორია, აღწერა, თანმიმდევრობა, ★ მთავარ გვერდზე, წაშლა |
| **აქციები** | ბანერები, % ფასდაკლება არჩეულ პროდუქტებზე, დაწყების/დასრულების თარიღები |
| **კონტენტი** | Hero, ჩვენ შესახებ, სერვისები, FAQ, შეფასებები, რიცხვები, ინსპირაცია→შედეგი, კატეგორიები, კონტაქტი, სოც. ქსელები — სამ ენაზე |
| **პარამეტრები** | მაღაზია, მიწოდების ზონები და ფასები, კონტაქტი, პაროლის შეცვლა |

ყველა ცვლილება საიტზე ჩანს **მაშინვე** (revalidation) — redeploy არ არის საჭირო.

**გადახდა:** შეკვეთა არასოდეს ინიშნება „გადახდილად“ ავტომატურად. ადმინი ნიშნავს ხელით, მხოლოდ დადასტურების საფუძვლის მითითებით.

## 6. უსაფრთხოება

- Row Level Security ყველა ცხრილზე: საჯარო მომხმარებელი კითხულობს მხოლოდ გამოქვეყნებულ პროდუქტებს, გალერეას და კონტენტს; **შეკვეთებს და კლიენტის მონაცემებს ვერ ხედავს**.
- ადმინის ყველა მოქმედება მოწმდება სერვერზე (`assertAdmin()` → `admin_users`) + RLS (`is_admin()`).
- შეკვეთები ინახება მხოლოდ სერვერიდან (service-role, ვალიდაციით); კლიენტის ფოტოები — პრივატულ ბაკეტში, ადმინი ხედავს 1-საათიანი ბმულით.
- ფაილები: ზომა ≤ 4 მბ, ტიპი მოწმდება შიგთავსით (magic bytes), არა მხოლოდ გაფართოებით.
- სპამისგან: honeypot ველი + rate limit.

## 7. ფოტოების დამატება

**რეკომენდებული:** ადმინ-პანელი → გალერეა / პროდუქტები (ტელეფონიდანაც მუშაობს).

**ბაზის გარეშე (სტატიკური):**
1. ჩააგდე ფოტო `images/gallery/`-ში, სახელით `კატეგორია-ნომერი.jpg` (მაგ. `kaba-03.jpg`, `sagamos-01.jpg`) — კატეგორია ავტომატურად განისაზღვრება პრეფიქსიდან.
2. `npm run optimize-images` → WebP, max 2000px, ხარისხი 80 → `public/images/`.
3. დაამატე ფაილი სიაში: `data/gallery.ts`.

კატეგორიის პრეფიქსები: `kaba`, `sagamos`, `kostiumi`, `kvedabolo`, `sharvali`, `bluza`, `sportuli`, `sabavshvo`, `erovnuli`.

## 8. ტექსტების შეცვლა

- ადმინიდან: **კონტენტი** და **პარამეტრები** (უპირატესია).
- კოდში: `locales/ka.json`, `locales/en.json`, `locales/ru.json`; კონტაქტები — `config/site.ts`.
- ყველა შესავსები ადგილი მონიშნულია `[TODO]`-ით — მოძებნე: `grep -rn "TODO" locales config data`.

## 9. ბრძანებები

| ბრძანება | |
|---|---|
| `npm run dev` | დეველოპმენტი |
| `npm run build` / `npm start` | production build / გაშვება |
| `npm run lint` · `npm run format` | ESLint · Prettier |
| `npm run optimize-images` | ფოტოების ოპტიმიზაცია |
| `npm run create-admin -- email პაროლი` | ადმინის შექმნა / პაროლის აღდგენა |

## 10. სტრუქტურა

```
app/(site)/          საჯარო გვერდები (მთავარი, gallery, products, services, how-to-order, about, order)
app/admin/           ადმინ-პანელი + server actions
app/api/             order, request, admin/upload
components/sections  საიტის სექციები      components/animations  ანიმაციები
components/admin     ადმინის კომპონენტები components/ui          ღილაკები, აიკონები
config/site.ts       კონტაქტები           locales/*.json         ტექსტები (KA/EN/RU)
lib/                 მონაცემები, ვალიდაცია, Supabase, i18n
supabase/migrations  SQL სქემა
```
