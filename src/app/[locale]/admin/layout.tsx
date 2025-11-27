import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Link } from '@/i18n/routing';
import LogoutButton from '@/components/admin/LogoutButton';
import { ToastProvider } from '@/components/Toast';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <aside className="fixed left-0 top-0 w-64 h-full bg-white dark:bg-gray-800 shadow-lg border-r dark:border-gray-700 overflow-y-auto z-30">
        <div className="p-6 border-b dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-blue-100 text-sm mt-1">mehmetkucuk.nl</p>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <Link href="/admin" className="flex items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                <span className="mr-3">📊</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/leads" className="flex items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                <span className="mr-3">👥</span>
                Leads
              </Link>
            </li>
            <li>
              <Link href="/admin/languages" className="flex items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                <span className="mr-3">🌍</span>
                Languages
              </Link>
            </li>
            <li>
              <Link href="/admin/seo" className="flex items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                <span className="mr-3">🔍</span>
                SEO Settings
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="flex items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                <span className="mr-3">⚙️</span>
                Site Settings
              </Link>
            </li>
            <li className="pt-4 border-t dark:border-gray-700 mt-4">
              <LogoutButton />
            </li>
          </ul>
        </nav>
      </aside>
      <main className="ml-64 flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
      </div>
    </ToastProvider>
  );
}
