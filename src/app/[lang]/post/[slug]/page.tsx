import {Metadata, ResolvingMetadata} from 'next';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {prisma} from '@/lib/prisma';
import {buildArticleMetadata, generateNewsArticleSchema, calculateReadingTime, generateBreadcrumbSchema} from '@/lib/seo';
import {SUPPORTED_LANGS} from '@/lib/i18n';
import {getCategoryName} from '@/lib/categories';
import PostCard from '@/components/PostCard';
import {Clock, User, Calendar} from 'lucide-react';
import ShareButton from '@/components/ShareButton';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mehmetkucuk.nl';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export async function generateMetadata(
  {params}: {params: {lang: string; slug: string}},
  parent: ResolvingMetadata
): Promise<Metadata> {
  const {lang, slug} = params;

  try {
    // First try to find by Translation.slug (new SEO-friendly way)
    let translation = await prisma.translation.findFirst({
      where: {lang: lang as any, slug},
      include: {article: {include: {translations: {select: {lang: true, slug: true}}}}},
    });

    // Fallback: try Article.slug for backward compatibility
    if (!translation) {
      const article = await prisma.article.findUnique({
        where: {slug},
        include: {
          translations: true,
        },
      });
      if (article?.translations) {
        const found = article.translations.find(t => t.lang === lang);
        if (found) {
          translation = {...found, article: {...article, translations: article.translations.map(t => ({lang: t.lang, slug: t.slug}))}};
        }
      }
    }

    if (!translation) {
      return {title: 'Article Not Found'};
    }

    // Build alternate language map
    const alternateLanguages = translation.article.translations.reduce<Record<string, string>>((acc, t) => {
      acc[t.lang] = t.slug;
      return acc;
    }, {});

    return buildArticleMetadata(translation.slug, translation, translation.article.imageUrl || undefined, alternateLanguages);
  } catch {
    return {title: 'Article Not Found'};
  }
}

export async function generateStaticParams() {
  // Generate params for each translation's unique slug
  const translations = await prisma.translation.findMany({
    where: {article: {published: true}},
    select: {lang: true, slug: true},
  });

  return translations.map((trans) => ({
    lang: trans.lang as string,
    slug: trans.slug,
  }));
}

export default async function ArticlePage({
  params,
}: {
  params: {lang: string; slug: string};
}) {
  const {lang, slug} = params;

  // First try to find by Translation.slug (new SEO-friendly way)
  let translationWithArticle = await prisma.translation.findFirst({
    where: {lang: lang as any, slug},
    include: {article: {include: {translations: true}}},
  });

  // Fallback: try Article.slug for backward compatibility
  if (!translationWithArticle) {
    const legacyArticle = await prisma.article.findUnique({
      where: {slug},
      include: {translations: true},
    });
    if (legacyArticle) {
      const foundTranslation = legacyArticle.translations.find((t) => t.lang === lang);
      if (foundTranslation) {
        // Re-fetch to get consistent type with article included
        translationWithArticle = await prisma.translation.findUnique({
          where: {id: foundTranslation.id},
          include: {article: {include: {translations: true}}},
        });
      }
    }
  }

  if (!translationWithArticle?.article || !translationWithArticle.article.published) {
    notFound();
  }

  const article = translationWithArticle.article;
  const translation = translationWithArticle;

  // Fetch related articles (same category)
  const related = await prisma.article.findMany({
    where: {
      published: true,
      category: article.category,
      slug: {not: slug},
    },
    include: {
      translations: {
        where: {lang: lang as any},
      },
    },
    take: 3,
  });

  const readingTime = calculateReadingTime(translation.body);
  const formattedDate = new Date(article.publishedAt || new Date()).toLocaleDateString(
    lang === 'tr' ? 'tr-TR' : lang === 'nl' ? 'nl-NL' : 'en-US',
    {year: 'numeric', month: 'long', day: 'numeric'}
  );

  const langLabels = {
    tr: {
      home: 'Anasayfa',
      share: 'Paylaş',
      readingTime: 'dakika okuma',
      relatedPosts: 'İlgili Yazılar',
      author: 'Yazar',
      published: 'Yayınlanma',
    },
    en: {
      home: 'Home',
      share: 'Share',
      readingTime: 'min read',
      relatedPosts: 'Related Articles',
      author: 'Author',
      published: 'Published',
    },
    nl: {
      home: 'Startpagina',
      share: 'Delen',
      readingTime: 'min lezen',
      relatedPosts: 'Gerelateerde Artikelen',
      author: 'Auteur',
      published: 'Gepubliceerd',
    },
  };

  const labels = langLabels[lang as keyof typeof langLabels] || langLabels.en;

  // SEO: Generate JSON-LD schemas
  const categoryName = getCategoryName(article.category, lang);
  const newsSchema = generateNewsArticleSchema(translation.slug, translation, article.category, article.imageUrl || undefined);
  const breadcrumbSchema = generateBreadcrumbSchema(lang, [
    {label: labels.home, url: `/${lang}`},
    {label: categoryName, url: `/${lang}/category/${article.category.toLowerCase()}`},
    {label: translation.title, url: `/${lang}/post/${translation.slug}`},
  ]);

  // Get alternate language URLs using each translation's slug
  const alternateUrls = article.translations.reduce(
    (acc, t) => ({...acc, [t.lang]: `/${t.lang}/post/${t.slug}`}),
    {} as Record<string, string>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Alternate URLs for language switcher */}
      <script
        id="alternate-urls"
        type="application/json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(alternateUrls)}}
      />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(newsSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />

      {/* Hero Image */}
      {article.imageUrl && (
        <div className="relative w-full h-96 bg-slate-200 dark:bg-slate-800">
          <Image
            src={article.imageUrl}
            alt={translation.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        </div>
      )}

      {/* Article Content */}
      <article className="w-full bg-white dark:bg-slate-900 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center gap-2 flex-wrap">
              <li>
                <Link href={`/${lang}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {labels.home}
                </Link>
              </li>
              <li className="text-slate-400">/</li>
              <li>
                <Link
                  href={`/${lang}/category/${article.category.toLowerCase()}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {categoryName}
                </Link>
              </li>
              <li className="text-slate-400">/</li>
              <li className="text-slate-600 dark:text-slate-400">{translation.title}</li>
            </ol>
          </nav>

          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full uppercase">
              {categoryName}
            </span>
          </div>

          {/* Title (H1) */}
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            {translation.title}
          </h1>

          {/* Summary/Description */}
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {translation.summary}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 py-6 border-y border-slate-200 dark:border-slate-800 mb-8">
            {/* Author */}
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                <strong>{labels.author}:</strong> {translation.author}
              </span>
            </div>

            {/* Published Date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <time dateTime={article.publishedAt?.toISOString()} className="text-sm text-slate-600 dark:text-slate-400">
                {formattedDate}
              </time>
            </div>

            {/* Reading Time */}
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {readingTime} {labels.readingTime}
              </span>
            </div>

            {/* Share Button */}
            <ShareButton
              title={translation.title}
              text={translation.summary}
              url={`${SITE_URL}/${lang}/post/${slug}`}
              label={labels.share}
            />
          </div>

          {/* Article Body */}
          <div className="prose prose-invert dark:prose-invert max-w-none mb-12">
            {/* SEO Rule: H1 rendered once as title, H2/H3 for content hierarchy */}
            <div
              className="text-slate-800 dark:text-slate-200 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{
                __html: translation.body
                  .replace(/<h1/g, '<h2 class="text-3xl font-bold mt-8 mb-4"')
                  .replace(/<h2/g, '<h2 class="text-2xl font-bold mt-8 mb-4"')
                  .replace(/<h3/g, '<h3 class="text-xl font-semibold mt-6 mb-3"')
                  .replace(/<p/g, '<p class="text-base leading-relaxed"')
                  .replace(/<a/g, '<a class="text-blue-600 dark:text-blue-400 hover:underline"')
                  .replace(/<img/g, '<img class="rounded-lg my-6 max-w-full h-auto"'),
              }}
            />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-8 py-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/${lang}/search?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Language Alternates */}
          {article.translations.length > 1 && (
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-3">Available in other languages:</p>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_LANGS.map((altLang) => {
                  const altTranslation = article.translations.find((t) => t.lang === altLang);
                  return altTranslation ? (
                    <Link
                      key={altLang}
                      href={`/${altLang}/post/${slug}`}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        altLang === lang
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {altLang.toUpperCase()}
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Related Articles Section */}
      {related.length > 0 && (
        <section className="w-full bg-slate-50 dark:bg-slate-950 py-12 sm:py-16 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{labels.relatedPosts}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((relatedArticle) => {
                const relatedTranslation = relatedArticle.translations[0];
                if (!relatedTranslation) return null;
                return (
                  <PostCard
                    key={relatedArticle.id}
                    id={relatedArticle.id}
                    slug={relatedTranslation.slug}
                    title={relatedTranslation.title}
                    summary={relatedTranslation.summary}
                    imageUrl={relatedArticle.imageUrl || undefined}
                    author={relatedTranslation.author}
                    publishedAt={relatedArticle.publishedAt || new Date()}
                    category={relatedArticle.category}
                    lang={lang}
                    content={relatedTranslation.body}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Comments Placeholder */}
      <section className="w-full bg-white dark:bg-slate-900 py-12 sm:py-16 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Comments</h2>
          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400">
              Comments coming soon. We&apos;re working on integrating a comment system.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
