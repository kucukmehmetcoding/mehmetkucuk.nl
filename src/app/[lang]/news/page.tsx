import {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {prisma} from '@/lib/prisma';
import {isLocale, SUPPORTED_LANGS} from '@/lib/i18n';
import PostCard from '@/components/PostCard';
import type {Language} from '@prisma/client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mehmetkucuk.nl';
const ARTICLES_PER_PAGE = 12;

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export async function generateMetadata({params}: {params: {lang: string}}): Promise<Metadata> {
  if (!isLocale(params.lang)) {
    notFound();
  }

  const lang = params.lang as Language;
  const titles = {tr: 'Tüm Haberler', en: 'All News', nl: 'Alle Nieuws'};
  const descriptions = {
    tr: 'Tüm teknoloji haberleri, makaleleri ve analizleri bir sayfada bulun.',
    en: 'Find all technology news, articles and analysis on one page.',
    nl: 'Vind al het technologienieuws, artikelen en analyses op één pagina.',
  };

  const locales = {tr: 'tr_TR', en: 'en_US', nl: 'nl_NL'};

  return {
    title: titles[lang],
    description: descriptions[lang],
    keywords: ['news', 'technology', 'articles', 'blog', 'latest'],
    alternates: {
      canonical: `${SITE_URL}/${lang}/news`,
      languages: {
        tr: `${SITE_URL}/tr/news`,
        en: `${SITE_URL}/en/news`,
        nl: `${SITE_URL}/nl/news`,
        'x-default': `${SITE_URL}/tr/news`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locales[lang],
      url: `${SITE_URL}/${lang}/news`,
      title: titles[lang],
      description: descriptions[lang],
      siteName: 'MK News Intelligence',
    },
  };
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: {lang: string};
  searchParams: {page?: string; category?: string};
}) {
  if (!isLocale(params.lang)) {
    notFound();
  }

  const lang = params.lang as Language;
  const page = parseInt(searchParams.page || '1', 10);
  const category = searchParams.category;

  const langLabels = {
    tr: {
      title: 'Tüm Haberler',
      allCategories: 'Tüm Kategoriler',
      page: 'Sayfa',
      noArticles: 'Makale bulunamadı',
      previous: 'Önceki',
      next: 'Sonraki',
    },
    en: {
      title: 'All News',
      allCategories: 'All Categories',
      page: 'Page',
      noArticles: 'No articles found',
      previous: 'Previous',
      next: 'Next',
    },
    nl: {
      title: 'Alle Nieuws',
      allCategories: 'Alle categorieën',
      page: 'Pagina',
      noArticles: 'Geen artikelen gevonden',
      previous: 'Vorige',
      next: 'Volgende',
    },
  };

  const labels = langLabels[lang] || langLabels.en;

  // Fetch all categories
  const allCategories = await prisma.article.findMany({
    where: {published: true},
    distinct: ['category'],
    select: {category: true},
  });

  // Fetch articles with filters
  const where = {
    published: true,
    ...(category && {category}),
  };

  const totalArticles = await prisma.article.count({where});
  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);

  if (page < 1 || page > Math.max(1, totalPages)) {
    notFound();
  }

  const articles = await prisma.article.findMany({
    where,
    include: {
      translations: {
        where: {lang},
        take: 1,
      },
    },
    orderBy: {publishedAt: 'desc'},
    skip: (page - 1) * ARTICLES_PER_PAGE,
    take: ARTICLES_PER_PAGE,
  });

  return (
    <div className="w-full">
      {/* Header Section */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{labels.title}</h1>
          <p className="text-lg text-blue-100">
            {totalArticles} {lang === 'tr' ? 'makale' : lang === 'nl' ? 'artikelen' : 'articles'}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Category Filter */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{labels.allCategories}</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${lang}/news`}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {labels.allCategories}
              </Link>
              {allCategories.map((cat) => (
                <Link
                  key={cat.category}
                  href={`/${lang}/news?category=${encodeURIComponent(cat.category)}`}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    category === cat.category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.category}
                </Link>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {articles.map((article) => {
                  const translation = article.translations[0];
                  if (!translation) return null;
                  return (
                    <PostCard
                      key={article.id}
                      id={article.id}
                      slug={translation.slug}
                      title={translation.title}
                      summary={translation.summary}
                      imageUrl={article.imageUrl || undefined}
                      author={translation.author}
                      publishedAt={article.publishedAt || new Date()}
                      category={article.category}
                      lang={lang}
                      content={translation.body}
                    />
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {page > 1 && (
                    <Link
                      href={`/${lang}/news?page=${page - 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {labels.previous}
                    </Link>
                  )}

                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {labels.page} {page} / {totalPages}
                  </span>

                  {page < totalPages && (
                    <Link
                      href={`/${lang}/news?page=${page + 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {labels.next}
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">{labels.noArticles}</p>
              <Link
                href={`/${lang}/news`}
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {labels.allCategories}
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
