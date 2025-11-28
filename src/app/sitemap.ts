import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://mehmetkucuk.nl';
  const locales = ['tr', 'en'];
  const paths = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/services', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/portfolio', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  // Ana sayfalar için her dilde URL oluştur
  paths.forEach(({ path, priority, changeFrequency }) => {
    locales.forEach((locale) => {
      sitemap.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: {
          languages: {
            tr: `${baseUrl}/tr${path}`,
            en: `${baseUrl}/en${path}`,
          },
        },
      });
    });
  });

  // Blog yazıları için dinamik URL'ler
  try {
    const blogPosts = await prisma.blogPost.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
    });

    blogPosts.forEach((post) => {
      locales.forEach((locale) => {
        sitemap.push({
          url: `${baseUrl}/${locale}/blog/${post.slug}`,
          lastModified: post.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: {
              tr: `${baseUrl}/tr/blog/${post.slug}`,
              en: `${baseUrl}/en/blog/${post.slug}`,
            },
          },
        });
      });
    });
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  return sitemap;
}
