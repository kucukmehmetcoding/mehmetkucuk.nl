'use client';

import {Clock, User, Tag} from 'lucide-react';

interface ArticleMetaProps {
  author: string;
  publishedAt: string;
  readingTime: string;
  category: string;
  categorySlug: string;
  lang: string;
}

export default function ArticleMeta({
  author,
  publishedAt,
  readingTime,
  category,
  categorySlug,
  lang,
}: ArticleMetaProps) {
  return (
    <>
      {/* Category Badge */}
      <a
        href={`/${lang}/category/${categorySlug}`}
        className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
      >
        <Tag className="w-3 h-3" />
        {category}
      </a>

      {/* Meta Info - rendered separately */}
    </>
  );
}

export function ArticleMetaInfo({
  author,
  publishedAt,
  readingTime,
}: {
  author: string;
  publishedAt: string;
  readingTime: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4" />
        <span>{author}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <time>{publishedAt}</time>
      </div>
      <div className="flex items-center gap-2">
        <span>📖</span>
        <span>{readingTime}</span>
      </div>
    </div>
  );
}
