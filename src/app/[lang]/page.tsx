import {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {prisma} from '@/lib/prisma';
import {isLocale, SUPPORTED_LANGS} from '@/lib/i18n';
import PostCard from '@/components/PostCard';
import HeroSlider from '@/components/HeroSlider';
import type {Language} from '@prisma/client';
import {getCategoryName} from '@/lib/categories';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mehmetkucuk.nl';

// Force dynamic rendering - database required at runtime
export const dynamic = 'force-dynamic';

// ISR: Revalidate every 60 seconds for published articles
export const revalidate = 60;

// Generate static paths for all supported languages
export async function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({
    lang,
  }));
}

export async function generateMetadata({params}: {params: {lang: string}}): Promise<Metadata> {
  if (!isLocale(params.lang)) {
    notFound();
  }

  const lang = params.lang as Language;
  const titles = {tr: 'Anasayfa', en: 'Home', nl: 'Startpagina'};
  const descriptions = {
    tr: 'Son teknoloji haberleri, açıklamalar ve analizler. Türkçe, İngilizce ve Hollandaca.',
    en: 'Latest technology news, insights and analysis. In Turkish, English and Dutch.',
    nl: 'Laatste technologienieuws, inzichten en analyses. In Turks, Engels en Nederlands.',
  };

  const locales = {tr: 'tr_TR', en: 'en_US', nl: 'nl_NL'};
  const alternates = SUPPORTED_LANGS.reduce((acc, l) => ({
    ...acc,
    [l]: `${SITE_URL}/${l}`,
  }), {});

  return {
    title: titles[lang],
    description: descriptions[lang],
    keywords: ['news', 'technology', 'articles', 'blog'],
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: {...alternates, 'x-default': `${SITE_URL}/tr`},
    },
    openGraph: {
      type: 'website',
      locale: locales[lang],
      url: `${SITE_URL}/${lang}`,
      title: titles[lang],
      description: descriptions[lang],
      siteName: 'MK News Intelligence',
      images: [{
        url: `${SITE_URL}/api/og-image`,
        width: 1200,
        height: 630,
        alt: 'MK News Intelligence',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[lang],
      description: descriptions[lang],
    },
  };
}

export default async function LocaleHome({params}: {params: {lang: string}}) {
  if (!isLocale(params.lang)) {
    notFound();
  }

  const lang = params.lang as Language;

  // Fetch slider articles (latest 12 for hero slider)
  const sliderArticles = await prisma.article.findMany({
    where: {published: true},
    include: {
      translations: {
        where: {lang},
        take: 1,
      },
    },
    orderBy: {publishedAt: 'desc'},
    take: 12,
  });

  // Fetch recent articles (next 6 after slider)
  const recent = await prisma.article.findMany({
    where: {published: true},
    include: {
      translations: {
        where: {lang},
        take: 1,
      },
    },
    orderBy: {publishedAt: 'desc'},
    skip: 12,
    take: 6,
  });

  // Fetch articles by category
  const categoryIds = ['technology', 'ai', 'crypto', 'programming', 'security', 'business'];
  const categorizedArticles = await Promise.all(
    categoryIds.map(async (categoryId) => ({
      categoryId,
      categoryName: getCategoryName(categoryId, lang),
      articles: await prisma.article.findMany({
        where: {
          published: true,
          category: categoryId,
        },
        include: {
          translations: {
            where: {lang},
            take: 1,
          },
        },
        orderBy: {publishedAt: 'desc'},
        take: 3,
      }),
    }))
  );

  const heroLabels = {
    tr: {
      title: 'En Son Teknoloji Haberleri',
      subtitle: 'AI destekli, çoklu dilde haber platformu',
      explore: 'Tümünü Gözat',
      readMore: 'Devamını Oku',
      by: 'Yazar:',
    },
    en: {
      title: 'Latest Technology News',
      subtitle: 'AI-powered, multilingual news platform',
      explore: 'Explore All',
      readMore: 'Read More',
      by: 'By',
    },
    nl: {
      title: 'Laatste Technologienieuws',
      subtitle: 'AI-aangedreven multilingual nieuwsplatform',
      explore: 'Alles Verkennen',
      readMore: 'Lees Meer',
      by: 'Door',
    },
  };

  const labels = heroLabels[lang];

  // Prepare slider data
  const sliderData = sliderArticles
    .filter((article) => article.translations[0])
    .map((article) => {
      const translation = article.translations[0];
      return {
        id: article.id,
        slug: translation.slug, // Use translation slug for SEO
        title: translation.title,
        summary: translation.summary,
        imageUrl: article.imageUrl || undefined,
        category: getCategoryName(article.category, lang),
        publishedAt: (article.publishedAt || new Date()).toISOString(),
        author: translation.author,
      };
    });

  return (
    <div>
      {/* Hero Slider Section */}
      {sliderData.length > 0 ? (
        <HeroSlider
          articles={sliderData}
          lang={lang}
          labels={{readMore: labels.readMore, by: labels.by}}
        />
      ) : (
        /* Fallback Hero Section when no articles */
        <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
                {labels.title}
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                {labels.subtitle}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href={`/${lang}/news`}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {labels.explore}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Articles */}
      {recent.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
            {lang === 'tr' ? 'Son Haberler' : lang === 'nl' ? 'Recent Nieuws' : 'Recent News'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((article) => {
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
        </section>
      )}

      {/* Category Sections */}
      {categorizedArticles.map(({categoryId, categoryName, articles}) => (
        articles.length > 0 && (
          <section key={categoryId} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{categoryName}</h2>
              <Link
                href={`/${lang}/category/${categoryId}`}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {lang === 'tr' ? 'Tümünü Gör →' : lang === 'nl' ? 'Bekijk Alles →' : 'View All →'}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(0, 3).map((article) => {
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
          </section>
        )
      ))}

      {/* Newsletter CTA */}
      <section className="bg-blue-600 dark:bg-blue-900 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Get the latest tech news delivered to your inbox
          </p>
          <form className="flex gap-2 max-w-md mx-auto justify-center flex-wrap">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-lg text-slate-900 placeholder-slate-500 flex-1 min-w-[250px]"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
