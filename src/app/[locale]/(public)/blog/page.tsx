import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Breadcrumb from '@/components/Breadcrumb';
import { Calendar, Clock, Tag, Eye } from 'lucide-react';
import { prisma } from '@/lib/prisma';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const title = locale === 'tr' 
    ? 'Blog - Web Geliştirme ve Teknoloji Yazıları'
    : locale === 'nl'
    ? 'Blog - Webontwikkeling en Technologie Artikelen'
    : 'Blog - Web Development and Technology Articles';
    
  const description = locale === 'tr'
    ? 'Web geliştirme, tasarım ve teknoloji hakkında yazılar. Next.js, React, TypeScript ve modern web teknolojileri.'
    : locale === 'nl'
    ? 'Artikelen over webontwikkeling, ontwerp en technologie. Next.js, React, TypeScript en moderne webtechnologieën.'
    : 'Articles about web development, design and technology. Next.js, React, TypeScript and modern web technologies.';

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        tr: '/tr/blog',
        en: '/en/blog',
        nl: '/nl/blog',
      },
    },
  };
}

async function getPosts(category?: string, page = 1) {
  const perPage = 12;
  const skip = (page - 1) * perPage;

  const where: {
    published: boolean;
    category?: string;
  } = {
    published: true,
  };

  if (category) {
    where.category = category;
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: perPage,
      skip,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    posts,
    total,
    totalPages: Math.ceil(total / perPage),
    currentPage: page,
  };
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { category, page: pageParam } = await searchParams;
  
  setRequestLocale(locale);
  
  const page = pageParam ? parseInt(pageParam) : 1;
  const { posts, totalPages, currentPage } = await getPosts(category, page);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <Breadcrumb />
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {locale === 'tr' ? 'Blog' : 'Blog'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {locale === 'tr' 
              ? 'Web geliştirme, tasarım ve teknoloji hakkında yazılar' 
              : 'Articles about web development, design and technology'}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <Link
            href={`/${locale}/blog`}
            className={`px-4 py-2 rounded-full transition ${
              !category
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {locale === 'tr' ? 'Tümü' : 'All'}
          </Link>
          {['web-development', 'mobile-development', 'ui-ux-design', 'seo', 'tutorials'].map((cat) => (
            <Link
              key={cat}
              href={`/${locale}/blog?category=${cat}`}
              className={`px-4 py-2 rounded-full transition capitalize ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {cat.replace(/-/g, ' ')}
            </Link>
          ))}
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {locale === 'tr' ? 'Henüz blog yazısı yok.' : 'No blog posts yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post: {id: string; slug: string; title: string; excerpt: string; coverImage: string | null; featured: boolean; category: string; createdAt: Date; publishedAt: Date | null; readingTime: number; views: number}) => {
              const titleData = JSON.parse(post.title);
              const excerptData = JSON.parse(post.excerpt);
              const title = locale === 'tr' ? titleData.tr : titleData.en;
              const excerpt = locale === 'tr' ? excerptData.tr : excerptData.en;

              return (
                <Link
                  key={post.id}
                  href={`/${locale}/blog/${post.slug}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                >
                  {post.coverImage && (
                    <div className="relative h-48 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.coverImage}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {post.featured && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                          ⭐ {locale === 'tr' ? 'Öne Çıkan' : 'Featured'}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <Tag size={14} />
                      <span className="capitalize">{post.category.replace(/-/g, ' ')}</span>
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {title}
                    </h2>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString(locale)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {post.readingTime} {locale === 'tr' ? 'dk' : 'min'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {post.views}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/${locale}/blog?${category ? `category=${category}&` : ''}page=${pageNum}`}
                className={`px-4 py-2 rounded-lg transition ${
                  pageNum === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {pageNum}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
