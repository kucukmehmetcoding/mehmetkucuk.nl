import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {getArticleBySlug} from '@/lib/db';
import {isLocale} from '@/lib/i18n';
import {buildArticleMetadata} from '@/lib/seo';
import {JsonLd} from '@/components/JsonLd';
import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/Breadcrumb';
import {getCategoryName} from '@/lib/categories';
import type {Language} from '@prisma/client';

// Dynamic imports for client components
const SocialShareButtons = dynamic(() => import('@/components/SocialShareButtons'), {ssr: false});
const ArticleMeta = dynamic(() => import('@/components/ArticleMeta'), {ssr: false});
const ArticleMetaInfo = dynamic(() => import('@/components/ArticleMeta').then(mod => ({default: mod.ArticleMetaInfo})), {ssr: false});

// ISR: Revalidate every hour for better performance
export const revalidate = 3600;

export async function generateMetadata({params}: {params: {lang: string; slug: string}}): Promise<Metadata> {
  if (!isLocale(params.lang)) {
    return {};
  }
  const article = await getArticleBySlug(params.slug, params.lang as Language);
  const translation = article?.translations.at(0);
  if (!article || !translation) {
    return {};
  }
  return buildArticleMetadata(translation.slug, translation, article.imageUrl || undefined);
}

export default async function ArticlePage({params}: {params: {lang: string; slug: string}}) {
  if (!isLocale(params.lang)) {
    notFound();
  }
  const article = await getArticleBySlug(params.slug, params.lang as Language);
  const translation = article?.translations.at(0);
  if (!article || !translation) {
    notFound();
  }

  // Canonical URL uses the translation slug under /post.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mehmetkucuk.nl';
  const canonicalUrl = `${siteUrl}/${params.lang}/post/${translation.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: translation.title,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: translation.author
    },
    image: article.imageUrl,
    mainEntityOfPage: canonicalUrl
  };

  // Use canonical URL for social sharing.
  const articleUrl = canonicalUrl;
  const categoryName = getCategoryName(article.category, params.lang as Language);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(
      params.lang === 'tr' ? 'tr-TR' : params.lang === 'nl' ? 'nl-NL' : 'en-US',
      {day: 'numeric', month: 'long', year: 'numeric'}
    );
  };

  const readingTime = Math.ceil(translation.body.split(/\s+/).length / 200);
  const readingTimeLabel = {
    tr: `${readingTime} dk okuma`,
    en: `${readingTime} min read`,
    nl: `${readingTime} min lezen`,
  }[params.lang] || `${readingTime} min read`;

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <JsonLd data={jsonLd} />

      {/* Floating Share Buttons (Desktop) */}
      <SocialShareButtons
        url={articleUrl}
        title={translation.title}
        summary={translation.summary}
        lang={params.lang}
        variant="floating"
      />

      {/* Hero Section with Image */}
      <div className="relative">
        {article.imageUrl ? (
          <div className="relative h-[300px] sm:h-[400px] md:h-[500px]">
            <Image
              src={article.imageUrl}
              alt={translation.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          </div>
        ) : (
          <div className="h-[200px] sm:h-[300px] bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600" />
        )}

        {/* Content Overlay */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-48">
          <div className="bg-white dark:bg-slate-900 rounded-t-2xl p-6 sm:p-8 shadow-xl">
            {/* Breadcrumb */}
            <Breadcrumb
              lang={params.lang}
              items={[
                {label: params.lang === 'tr' ? 'Haberler' : params.lang === 'nl' ? 'Nieuws' : 'News', href: `/${params.lang}/news`},
                {label: categoryName, href: `/${params.lang}/category/${article.category}`},
                {label: translation.title},
              ]}
            />

            {/* Category Badge */}
            <ArticleMeta
              author={translation.author}
              publishedAt={formatDate(article.publishedAt || new Date())}
              readingTime={readingTimeLabel}
              category={categoryName}
              categorySlug={article.category}
              lang={params.lang}
            />

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-4 leading-tight">
              {translation.title}
            </h1>

            {/* Summary */}
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
              {translation.summary}
            </p>

            {/* Meta Info */}
            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
              <ArticleMetaInfo
                author={translation.author}
                publishedAt={formatDate(article.publishedAt || new Date())}
                readingTime={readingTimeLabel}
              />
            </div>

            {/* Share Buttons (Horizontal) */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <SocialShareButtons
                url={articleUrl}
                title={translation.title}
                summary={translation.summary}
                lang={params.lang}
                variant="horizontal"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-b-2xl p-6 sm:p-8 shadow-xl">
          <div
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:text-slate-900 dark:prose-headings:text-white
              prose-p:text-slate-700 dark:prose-p:text-slate-300
              prose-a:text-blue-600 dark:prose-a:text-blue-400
              prose-strong:text-slate-900 dark:prose-strong:text-white
              prose-code:bg-slate-100 dark:prose-code:bg-slate-800
              prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800
              prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{__html: translation.body}}
          />

          {/* Source Attribution */}
          {article.source && (
            <aside className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>{params.lang === 'tr' ? 'Kaynak' : params.lang === 'nl' ? 'Bron' : 'Source'}:</strong>{' '}
                <a
                  href={article.source.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {article.source.originalSource}
                </a>
              </p>
            </aside>
          )}

          {/* Bottom Share Section */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">
              {params.lang === 'tr' ? 'Bu haberi paylaş:' : params.lang === 'nl' ? 'Deel dit artikel:' : 'Share this article:'}
            </p>
            <SocialShareButtons
              url={articleUrl}
              title={translation.title}
              summary={translation.summary}
              lang={params.lang}
              variant="horizontal"
            />
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16" />
    </article>
  );
}
