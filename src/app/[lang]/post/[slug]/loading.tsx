export default function PostLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero skeleton */}
      <div className="relative w-full h-96 bg-slate-200 dark:bg-slate-800 animate-pulse" />
      
      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-4 w-3/4" />
        
        {/* Meta */}
        <div className="flex gap-4 mb-8">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-24" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-32" />
        </div>
        
        {/* Body paragraphs */}
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-4/5" />
        </div>
      </div>
    </div>
  );
}
