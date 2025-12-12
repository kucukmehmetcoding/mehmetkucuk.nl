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
  const url = `${siteUrl}/${translation.lang}/news/${article.slug}`;
  const alternateRefs = SUPPORTED_LANGS.map((lang) => ({
    hrefLang: lang,
    href: `${siteUrl}/${lang}/news/${article.slug}`
  }));

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
                url: article.imageUrl,
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
