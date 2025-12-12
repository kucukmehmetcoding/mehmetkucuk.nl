import Image from 'next/image';
import Link from 'next/link';
import {calculateReadingTime} from '@/lib/seo';

interface PostCardProps {
  id: string;
  slug: string;
  title: string;
  summary: string;
  imageUrl?: string;
  author: string;
  publishedAt: Date;
  category: string;
  lang: string;
  content?: string;
  variant?: 'compact' | 'featured';
}

export default function PostCard({
  slug,
  title,
  summary,
  imageUrl,
  author,
  publishedAt,
  category,
  lang,
  content = '',
  variant = 'compact',
}: PostCardProps) {
  const readingTime = content ? calculateReadingTime(content) : 5;
  const formattedDate = new Date(publishedAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : lang === 'nl' ? 'nl-NL' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const commonClasses = variant === 'featured'
    ? 'group flex flex-col bg-white dark:bg-slate-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700'
    : 'group flex flex-col bg-white dark:bg-slate-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700';

  return (
    <Link href={`/${lang}/post/${slug}`}>
      <article className={commonClasses}>
        {/* Image */}
        {imageUrl && (
          <div className={variant === 'featured' ? 'relative w-full h-64 overflow-hidden bg-slate-200 dark:bg-slate-700' : 'relative w-full h-40 overflow-hidden bg-slate-200 dark:bg-slate-700'}>
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes={variant === 'featured' ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : '(max-width: 768px) 100vw, 50vw'}
              priority={variant === 'featured'}
            />
          </div>
        )}

        {/* Content */}
        <div className={variant === 'featured' ? 'flex flex-col flex-1 p-6' : 'flex flex-col flex-1 p-4'}>
          {/* Category Badge */}
          <div className="mb-3">
            <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded uppercase">
              {category}
            </span>
          </div>

          {/* Title */}
          <h2 className={variant === 'featured'
            ? 'text-2xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'
            : 'text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'
          }>
            {title}
          </h2>

          {/* Summary */}
          <p className={variant === 'featured'
            ? 'text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 flex-1'
            : 'text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 flex-1 text-sm'
          }>
            {summary}
          </p>

          {/* Meta Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>{author}</span>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>
            <time dateTime={publishedAt.toISOString()}>
              {formattedDate}
            </time>
          </div>
        </div>
      </article>
    </Link>
  );
}
