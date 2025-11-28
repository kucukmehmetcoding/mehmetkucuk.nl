import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://mehmetkucuk.nl';
  const locales = ['tr', 'en'];
  const paths = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/services', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/portfolio', priority: 0.9, changeFrequency: 'weekly' as const },
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

  // TODO: Portfolio detay sayfaları için dinamik URL'ler eklenebilir
  // Bu kısım database'den projeler çekilerek genişletilebilir

  return sitemap;
}
