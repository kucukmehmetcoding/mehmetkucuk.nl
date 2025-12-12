import {cookies} from 'next/headers';
import {redirect, notFound} from 'next/navigation';
import {prisma} from '@/lib/prisma';
import {isLocale} from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const secret = process.env.ADMIN_JWT_SECRET ?? '';

export default async function AdminPage({params}: {params: {lang: string}}) {
  if (!isLocale(params.lang)) {
    notFound();
  }

  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  const authed = Boolean(secret && token === secret);

  async function loginAction(formData: FormData) {
    'use server';
    const supplied = formData.get('token');
    if (typeof supplied !== 'string' || supplied !== secret) {
      redirect(`/${params.lang}/admin?error=invalid`);
    }
    cookies().set('admin_token', supplied, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    redirect(`/${params.lang}/admin`);
  }

  if (!authed) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Admin Panel</h2>
          <p className="text-slate-400">Lütfen giriş yapın</p>
        </div>
        <form
          action={loginAction}
          className="bg-slate-800 border border-slate-700 rounded-lg p-8 space-y-4"
        >
          <div>
            <label htmlFor="token" className="block text-sm font-medium mb-2">
              Admin Token
            </label>
            <input
              id="token"
              name="token"
              type="password"
              placeholder="Admin token'ını girin"
              required
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    );
  }

  // Fetch dashboard data
  const articles = await prisma.article.findMany({
    include: {
      translations: {
        where: {lang: params.lang},
        take: 1
      }
    },
    orderBy: {createdAt: 'desc'},
    take: 100
  });

  const pending = await prisma.approvalQueue.findMany({
    where: {status: 'pending'},
    include: {translation: true},
    orderBy: {createdAt: 'asc'}
  });

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-400">Site yönetimine hoş geldiniz</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Toplam Haber</p>
          <p className="text-4xl font-bold">{articles.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Yayınlanan</p>
          <p className="text-4xl font-bold">{articles.filter(a => a.published).length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Taslak</p>
          <p className="text-4xl font-bold">{articles.filter(a => !a.published).length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Beklemede</p>
          <p className="text-4xl font-bold">{pending.length}</p>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Articles */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Onay Bekleyen Haberler</h2>
          {pending.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
              <p>Hiç beklemede haber yoktur</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.slice(0, 5).map((item: typeof pending[0]) => (
                <div
                  key={item.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                >
                  <h3 className="font-bold text-sm line-clamp-1">{item.translation.title}</h3>
                  <div className="flex gap-2 mt-2 text-xs text-slate-500">
                    <span className="px-2 py-1 bg-slate-700 rounded">{item.translation.lang.toUpperCase()}</span>
                    <span className="px-2 py-1 bg-slate-700 rounded">{item.translation.author}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Articles */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Son Eklenen Haberler</h2>
          {articles.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
              <p>Henüz haber eklenmemiştir</p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.slice(0, 5).map((article) => {
                const translation = article.translations[0];
                return (
                  <div key={article.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <h3 className="font-bold text-sm line-clamp-1">{translation?.title || 'Untitled'}</h3>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded ${
                          article.published
                            ? 'bg-green-900 text-green-200'
                            : 'bg-yellow-900 text-yellow-200'
                        }`}
                      >
                        {article.published ? 'Yayında' : 'Taslak'}
                      </span>
                      <span className="px-2 py-1 bg-slate-700 rounded text-slate-300">
                        {article.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Quick Actions */}
      <section className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a
            href={`/${params.lang}/admin/articles`}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-center font-medium text-sm transition-colors"
          >
            📰 Haberler
          </a>
          <a
            href={`/${params.lang}/admin/categories`}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-center font-medium text-sm transition-colors"
          >
            🏷️ Kategoriler
          </a>
          <a
            href={`/${params.lang}/admin/translations`}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-center font-medium text-sm transition-colors"
          >
            🌐 Çeviriler
          </a>
          <a
            href={`/${params.lang}/admin/settings`}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-center font-medium text-sm transition-colors"
          >
            ⚙️ Ayarlar
          </a>
        </div>
      </section>
    </div>
  );
}
