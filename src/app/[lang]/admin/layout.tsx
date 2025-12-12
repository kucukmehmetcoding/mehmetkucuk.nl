import {ReactNode} from 'react';
import {cookies} from 'next/headers';
import {notFound} from 'next/navigation';
import {isLocale} from '@/lib/i18n';
import Sidebar from '@/components/admin/Sidebar';

const secret = process.env.ADMIN_JWT_SECRET ?? '';

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: {lang: string};
}) {
  if (!isLocale(params.lang)) {
    notFound();
  }

  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  const authed = Boolean(secret && token === secret);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col">
      {/* Admin Header */}
      {authed && (
        <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <a href={`/${params.lang}`} className="text-sm hover:text-blue-400 transition-colors">
                ← Siteyе Dön
              </a>
              <form
                action={async () => {
                  'use server';
                  cookies().delete('admin_token');
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Çıkış Yap
                </button>
              </form>
            </div>
          </div>
        </header>
      )}

      {/* Admin Content */}
      {authed ? (
        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar lang={params.lang} />

          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      ) : (
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            {children}
          </div>
        </main>
      )}
    </div>
  );
}
