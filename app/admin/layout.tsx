import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'ადმინ-პანელი', template: '%s — Nanika Admin' },
  robots: { index: false, follow: false },
};

const themeScript = `try{var t=localStorage.getItem('nanika-admin-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.getElementById('admin-root').classList.add('dark')}catch(e){}`;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="admin-root" className="a-root" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      {children}
    </div>
  );
}
