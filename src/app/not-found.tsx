import Link from 'next/link';
import {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Sayfa Bulunamadı - 404',
  description: 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-8xl font-bold text-slate-200 dark:text-slate-800">404</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Sayfa Bulunamadı
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Ana Sayfa
          </Link>
          <Link
            href="/tr/search"
            className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Arama Yap
          </Link>
        </div>
      </div>
    </div>
  );
}
