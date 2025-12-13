import {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {prisma} from '@/lib/prisma';
import {isLocale} from '@/lib/i18n';
import PostCard from '@/components/PostCard';
import type {Language} from '@prisma/client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mehmetkucuk.nl';
const RESULTS_PER_PAGE = 12;

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export async function generateMetadata({params}: {params: {lang: string}}): Promise<Metadata> {
  if (!isLocale(params.lang)) {
    notFound();
  }

  const lang = params.lang as Language;
  const titles = {tr: 'Ara', en: 'Search', nl: 'Zoeken'};
  const descriptions = {
    tr: 'Teknoloji haberleri, makaleleri ve analizleri arayın.',
    en: 'Search technology news, articles and analysis.',
    nl: 'Zoek technologienieuws, artikelen en analyses.',
  };

  const locales = {tr: 'tr_TR', en: 'en_US', nl: 'nl_NL'};

  return {
    title: titles[lang],
    description: descriptions[lang],
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `${SITE_URL}/${lang}/search`,
      languages: {
        tr: `${SITE_URL}/tr/search`,
        en: `${SITE_URL}/en/search`,
        nl: `${SITE_URL}/nl/search`,
        'x-default': `${SITE_URL}/tr/search`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locales[lang],
      url: `${SITE_URL}/${lang}/search`,
      title: titles[lang],
      description: descriptions[lang],
      siteName: 'MK News Intelligence',
    },
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: {lang: string};
  searchParams: {q?: string; page?: string};
}) {
  if (!isLocale(params.lang)) {
    notFound();
  }

  const lang = params.lang as Language;
  const query = searchParams.q ? decodeURIComponent(searchParams.q).trim() : '';
  const page = parseInt(searchParams.page || '1', 10);

  const langLabels = {
    tr: {
      title: 'Ara',
      placeholder: 'Haberler, makaleler arayın...',
      search: 'Ara',
      noQuery: 'Arama yapabilmek için bir terim giriniz',
      noResults: 'Arama sonucu bulunamadı',
      results: 'sonuç',
      page: 'Sayfa',
      previous: 'Önceki',
      next: 'Sonraki',
      back: 'Tüm Haberlere Dön',
    },
    en: {
      title: 'Search',
      placeholder: 'Search news, articles...',
      search: 'Search',
      noQuery: 'Enter a search term to get started',
      noResults: 'No results found',
      results: 'results',
      page: 'Page',
      previous: 'Previous',
      next: 'Next',
      back: 'Back to All News',
    },
    nl: {
      title: 'Zoeken',
      placeholder: 'Zoeken in nieuws, artikelen...',
      search: 'Zoeken',
      noQuery: 'Voer een zoekterm in om te beginnen',
      noResults: 'Geen resultaten gevonden',
      results: 'resultaten',
      page: 'Pagina',
      previous: 'Vorige',
      next: 'Volgende',
      back: 'Terug naar Alle Nieuws',
    },
  };

  const labels = langLabels[lang] || langLabels.en;

  let articles = [];
  let totalResults = 0;
  let totalPages = 0;

  if (query.length > 0) {
    // Search in article translations
    const searchResults = await prisma.translation.findMany({
      where: {
        lang,
        article: {published: true},
        OR: [
          {title: {contains: query, mode: 'insensitive'}},
          {summary: {contains: query, mode: 'insensitive'}},
          {body: {contains: query, mode: 'insensitive'}},
        ],
      },
      include: {
        article: {
          select: {
            id: true,
            slug: true,
            imageUrl: true,
            category: true,
            publishedAt: true,
          },
        },
      },
    });

    // Filter for published articles only
    const validResults = searchResults.filter((tr) => tr.article);

    totalResults = validResults.length;
    totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

    if (page < 1 || page > Math.max(1, totalPages)) {
      notFound();
    }

    articles = validResults
      .slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE)
      .map((tr: any) => ({
        ...tr.article!,
        translations: [tr],
      })) as any;
  } else if (page > 1) {
    notFound();
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <section className="w-full bg-gradient-to-r from-green-600 to-green-800 dark:from-green-900 dark:to-green-950 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8">{labels.title}</h1>

          {/* Search Form */}
          <form method="GET" className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder={labels.placeholder}
              className="flex-1 px-4 py-3 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-green-200 dark:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 font-bold rounded-lg hover:bg-green-50 dark:hover:bg-slate-700 transition-colors"
            >
              {labels.search}
            </button>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="w-full bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {query.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-slate-600 dark:text-slate-400">{labels.noQuery}</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">{labels.noResults}</p>
              <Link
                href={`/${lang}/news`}
                className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {labels.back}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalResults} {labels.results} "{query}"
                </h2>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {articles.map((article: any) => {
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
                      href={`/${lang}/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      {labels.previous}
                    </Link>
                  )}

                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {labels.page} {page} / {totalPages}
                  </span>

                  {page < totalPages && (
                    <Link
                      href={`/${lang}/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      {labels.next}
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
