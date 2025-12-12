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

export async function generateMetadata({
  params,
}: {
  params: {lang: string; slug: string};
}): Promise<Metadata> {
  if (!isLocale(params.lang)) {
    notFound();
  }

  const lang = params.lang as Language;
  const category = decodeURIComponent(params.slug);

  const locales = {tr: 'tr_TR', en: 'en_US', nl: 'nl_NL'};

  const titles = {
    tr: `${category} Haberleri`,
    en: `${category} News`,
    nl: `${category} Nieuws`,
  };

  const descriptions = {
    tr: `${category} kategorisindeki tüm haberler, makaleler ve analizler.`,
    en: `All news, articles and analysis in the ${category} category.`,
    nl: `Al het nieuws, artikelen en analyses in de categorie ${category}.`,
  };

  return {
    title: titles[lang],
    description: descriptions[lang],
    keywords: [category.toLowerCase(), 'news', 'articles', 'technology'],
    alternates: {
      canonical: `${SITE_URL}/${lang}/category/${params.slug}`,
      languages: {
        tr: `${SITE_URL}/tr/category/${params.slug}`,
        en: `${SITE_URL}/en/category/${params.slug}`,
        nl: `${SITE_URL}/nl/category/${params.slug}`,
        'x-default': `${SITE_URL}/tr/category/${params.slug}`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locales[lang],
      url: `${SITE_URL}/${lang}/category/${params.slug}`,
      title: titles[lang],
      description: descriptions[lang],
      siteName: 'MK News Intelligence',
    },
  };
}

export async function generateStaticParams(): Promise<{lang: string; slug: string}[]> {
  const categories = await prisma.article.findMany({
    where: {published: true},
    distinct: ['category'],
    select: {category: true},
  });

  const params: {lang: string; slug: string}[] = [];
  for (const {category} of categories) {
    for (const lang of SUPPORTED_LANGS) {
      params.push({
        lang,
        slug: encodeURIComponent(category),
      });
    }
  }

  return params;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: {lang: string; slug: string};
  searchParams: {page?: string};
}) {
  if (!isLocale(params.lang)) {
    notFound();
  }

  const lang = params.lang as Language;
  const category = decodeURIComponent(params.slug);
  const page = parseInt(searchParams.page || '1', 10);

  const langLabels = {
    tr: {
      articles: 'makale',
      allNews: 'Tüm Haberler',
      page: 'Sayfa',
      noArticles: 'Bu kategoride makale bulunamadı',
      previous: 'Önceki',
      next: 'Sonraki',
    },
    en: {
      articles: 'articles',
      allNews: 'All News',
      page: 'Page',
      noArticles: 'No articles found in this category',
      previous: 'Previous',
      next: 'Next',
    },
    nl: {
      articles: 'artikelen',
      allNews: 'Alle Nieuws',
      page: 'Pagina',
      noArticles: 'Geen artikelen gevonden in deze categorie',
      previous: 'Vorige',
      next: 'Volgende',
    },
  };

  const labels = langLabels[lang] || langLabels.en;

  // Verify category exists
  const categoryExists = await prisma.article.findFirst({
    where: {
      published: true,
      category,
    },
  });

  if (!categoryExists) {
    notFound();
  }

  // Fetch articles for this category
  const totalArticles = await prisma.article.count({
    where: {
      published: true,
      category,
    },
  });

  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);

  if (page < 1 || page > Math.max(1, totalPages)) {
    notFound();
  }

  const articles = await prisma.article.findMany({
    where: {
      published: true,
      category,
    },
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
      <section className="w-full bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-900 dark:to-purple-950 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/${lang}/news`}
            className="text-purple-200 hover:text-white mb-4 inline-block transition-colors"
          >
            ← {labels.allNews}
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{category}</h1>
          <p className="text-lg text-purple-100">
            {totalArticles} {labels.articles}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
                      href={`/${lang}/category/${params.slug}?page=${page - 1}`}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      {labels.previous}
                    </Link>
                  )}

                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {labels.page} {page} / {totalPages}
                  </span>

                  {page < totalPages && (
                    <Link
                      href={`/${lang}/category/${params.slug}?page=${page + 1}`}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
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
                className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {labels.allNews}
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
