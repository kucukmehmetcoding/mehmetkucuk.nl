'use client';

import {useEffect} from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-6xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Bir şeyler yanlış gitti
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Ana Sayfa
          </a>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-slate-500 dark:text-slate-600">
            Hata Kodu: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
