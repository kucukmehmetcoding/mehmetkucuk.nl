import {NextSeo} from 'next-seo';
import type {Article} from '@prisma/client';
import type {Translation} from '@prisma/client';
import {SUPPORTED_LANGS} from '@/lib/i18n';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mehmetkucuk.nl';

type Props = {
  article: Article;
  translation: Translation;
};

export function NextSeoWrapper({article, translation}: Props) {
  // Use canonical `/post/:slug` (per-language) instead of legacy `/news`
  const url = `${siteUrl}/${translation.lang}/post/${translation.slug}`;
  const alternateRefs = SUPPORTED_LANGS.map((lang) => ({
    hrefLang: lang,
    href: `${siteUrl}/${lang}/post/${translation.slug}`
  }));

  const imageUrl = article.imageUrl
    ? article.imageUrl.startsWith('http')
      ? article.imageUrl
      : `${siteUrl}${article.imageUrl.startsWith('/') ? '' : '/'}${article.imageUrl}`
    : undefined;
  return (
    <NextSeo
      title={translation.seoTitle}
      description={translation.metaDescription}
      canonical={url}
      openGraph={{
        type: 'article',
        url,
        article: {
          publishedTime: article.publishedAt?.toISOString(),
          authors: [translation.author],
          tags: article.tags
        },
        images: article.imageUrl
          ? [
              {
                url: imageUrl as string,
                alt: translation.title
              }
            ]
          : undefined
      }}
      languageAlternates={alternateRefs}
      twitter={{cardType: 'summary_large_image'}}
    />
  );
}
