export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-8 w-48" />
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 9}).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm">
              {/* Image skeleton */}
              <div className="h-48 bg-slate-200 dark:bg-slate-800 animate-pulse" />
              
              {/* Content skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-20" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-5/6" />
                <div className="flex gap-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-16" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
