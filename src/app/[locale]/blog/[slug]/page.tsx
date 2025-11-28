import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import Breadcrumb from '@/components/Breadcrumb';
import TableOfContents from '@/components/blog/TableOfContents';
import BlogSchema from '@/components/blog/BlogSchema';
import { Calendar, Clock, Eye, User } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const titleData = JSON.parse(post.title);
  const excerptData = JSON.parse(post.excerpt);
  const metaTitleData = post.metaTitle ? JSON.parse(post.metaTitle) : titleData;
  const metaDescData = post.metaDesc ? JSON.parse(post.metaDesc) : excerptData;

  const title = locale === 'tr' ? metaTitleData.tr : metaTitleData.en;
  const description = locale === 'tr' ? metaDescData.tr : metaDescData.en;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author],
      images: post.coverImage ? [post.coverImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
    },
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: {
        tr: `/tr/blog/${slug}`,
        en: `/en/blog/${slug}`,
      },
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  
  setRequestLocale(locale);

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post || !post.published) {
    notFound();
  }

  const titleData = JSON.parse(post.title);
  const excerptData = JSON.parse(post.excerpt);
  const contentData = JSON.parse(post.content);

  const title = locale === 'tr' ? titleData.tr : titleData.en;
  const excerpt = locale === 'tr' ? excerptData.tr : excerptData.en;
  const content = locale === 'tr' ? contentData.tr : contentData.en;

  return (
    <>
      <BlogSchema
        title={title}
        description={excerpt}
        publishedAt={post.publishedAt?.toISOString() || post.createdAt.toISOString()}
        updatedAt={post.updatedAt.toISOString()}
        author={post.author}
        image={post.coverImage || ''}
        url={`https://mehmetkucuk.nl/${locale}/blog/${slug}`}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <Breadcrumb />

          <article className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              {post.featured && (
                <div className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  ⭐ {locale === 'tr' ? 'Öne Çıkan Yazı' : 'Featured Post'}
                </div>
              )}

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {title}
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                {excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 mb-6">
                <span className="flex items-center gap-2">
                  <User size={18} />
                  {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={18} />
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={18} />
                  {post.readingTime} {locale === 'tr' ? 'dakika' : 'minutes'}
                </span>
                <span className="flex items-center gap-2">
                  <Eye size={18} />
                  {post.views} {locale === 'tr' ? 'görüntülenme' : 'views'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {post.tags.split(',').map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </header>

            {/* Cover Image */}
            {post.coverImage && (
              <div className="mb-8 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage}
                  alt={title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Content with TOC */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSlug]}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Table of Contents */}
              <div className="lg:col-span-1">
                <TableOfContents content={content} />
              </div>
            </div>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {locale === 'tr' ? 'Bu yazıyı paylaş:' : 'Share this post:'}
              </p>
              <div className="flex gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(`https://mehmetkucuk.nl/${locale}/blog/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://mehmetkucuk.nl/${locale}/blog/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition"
                >
                  LinkedIn
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://mehmetkucuk.nl/${locale}/blog/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Facebook
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
