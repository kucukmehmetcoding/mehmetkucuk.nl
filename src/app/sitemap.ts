import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mehmetkucuk.nl';
  const locales = ['tr', 'en', 'nl'];
  const paths = ['', '/services', '/about', '/contact'];

  const sitemap: MetadataRoute.Sitemap = [];

  paths.forEach((path) => {
    locales.forEach((locale) => {
      sitemap.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: path === '' ? 1 : 0.8,
      });
    });
  });

  return sitemap;
}
