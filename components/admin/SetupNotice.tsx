/** ნაჩვენებია, სანამ .env-ში Supabase-ის გასაღებები არ არის */
export function SetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="a-card max-w-xl space-y-4">
        <p className="font-serif text-3xl">ადმინ-პანელის გასააქტიურებლად საჭიროა Supabase</p>
        <ol className="a-muted list-decimal space-y-2 pl-5 text-sm">
          <li>შექმენი პროექტი <a className="underline" href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a>-ზე.</li>
          <li>SQL Editor-ში გაუშვი <code>supabase/migrations/0001_init.sql</code>.</li>
          <li><code>.env.example</code> დააკოპირე <code>.env.local</code>-ად და შეავსე <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, <code>SUPABASE_SERVICE_ROLE_KEY</code>.</li>
          <li>შექმენი ადმინი: <code>npm run create-admin -- email@example.com პაროლი</code></li>
          <li>გადატვირთე სერვერი (<code>npm run dev</code>) — დეტალები README.md-ში.</li>
        </ol>
      </div>
    </div>
  );
}
