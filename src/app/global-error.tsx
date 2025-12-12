'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <span className="text-6xl">💥</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Kritik Hata
          </h1>
          <p className="text-slate-400 mb-8">
            Uygulama beklenmeyen bir hatayla karşılaştı. Lütfen sayfayı yenileyin.
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
              className="px-6 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
            >
              Ana Sayfa
            </a>
          </div>
          {error.digest && (
            <p className="mt-6 text-xs text-slate-600">
              Hata Kodu: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
