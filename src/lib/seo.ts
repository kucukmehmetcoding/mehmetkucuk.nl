import type {Metadata} from 'next';
import type {Translation} from '@prisma/client';
import {SUPPORTED_LANGS} from './i18n';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mehmetkucuk.nl';
const SITE_NAME = 'MK News Intelligence';

function toAbsoluteUrl(url: string): string {
  const v = (url || '').trim();
  if (!v) return '';
  if (v.startsWith('http://') || v.startsWith('https://')) return v;
  return `${siteUrl}${v.startsWith('/') ? v : `/${v}`}`;
}

export interface ArticleMetadata {
  slug: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  category: string;
  tags: string[];
  lang: 'tr' | 'en' | 'nl';
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  isPublished: boolean;
}

/**
 * SEO Rule: Meta title ≤ 70 chars, description ≤ 160 chars
 * @param slug - The translation-specific slug for the current language
 * @param translation - The translation record
 * @param imageUrl - Optional image URL
 * @param alternateLanguages - Optional map of language to slug for hreflang tags
 */
export function buildArticleMetadata(
  slug: string, 
  translation: Translation, 
  imageUrl?: string,
  alternateLanguages?: Record<string, string>
): Metadata {
  const url = `${siteUrl}/${translation.lang}/post/${slug}`;
  const fallbackImage = `${siteUrl}/api/og-image`;
  const resolvedImage = imageUrl ? toAbsoluteUrl(imageUrl) : '';
  
  // Build alternates - if we have per-language slugs, use them; otherwise fall back to same slug
  const alternates = SUPPORTED_LANGS.reduce<Record<string, string>>((acc, lang) => {
    const langSlug = alternateLanguages?.[lang] ?? slug;
    acc[lang] = `${siteUrl}/${lang}/post/${langSlug}`;
    return acc;
  }, {});

  // Enforce character limits
  const seoTitle = translation.seoTitle ? translation.seoTitle.substring(0, 70) : translation.title.substring(0, 70);
  const metaDescription = translation.metaDescription ? translation.metaDescription.substring(0, 160) : translation.summary.substring(0, 160);

  return {
    title: seoTitle,
    description: metaDescription,
    keywords: [],
    authors: [{ name: translation.author }],
    creator: translation.author,
    publisher: SITE_NAME,
    // Prefer article-level published flag when available; fall back to translation.publishedAt
    robots: (translation as any)?.article?.published || translation.publishedAt ? 'index, follow' : 'noindex, nofollow',
    alternates: {
      canonical: translation.canonicalUrl || url,
      languages: {
        ...alternates,
        'x-default': alternates['tr'] || `${siteUrl}/tr/post/${slug}`
      }
    },
    openGraph: {
      type: 'article',
      url: translation.canonicalUrl || url,
      title: seoTitle,
      description: metaDescription,
      locale: translation.lang,
      siteName: SITE_NAME,
      images: [
        {
          url: resolvedImage || fallbackImage,
          width: 1200,
          height: 630,
          alt: seoTitle,
        },
      ],
      publishedTime: translation.publishedAt?.toISOString(),
      modifiedTime: translation.updatedAt?.toISOString(),
      authors: [translation.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: metaDescription,
      images: [resolvedImage || fallbackImage],
      creator: '@mehmetkucuk',
    }
  };
}

/**
 * Generate JSON-LD NewsArticle structured data
 * SEO Rule: Include headline, image, datePublished, dateModified, author, publisher
 */
export function generateNewsArticleSchema(slug: string, translation: Translation, category?: string, imageUrl?: string) {
  const url = translation.canonicalUrl || `${siteUrl}/${translation.lang}/post/${slug}`;

  const resolvedImage = imageUrl ? toAbsoluteUrl(imageUrl) : `${siteUrl}/api/og-image`;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    inLanguage: translation.lang,
    headline: translation.seoTitle || translation.title,
    description: translation.metaDescription || translation.summary,
    image: resolvedImage ? [resolvedImage] : [],
    datePublished: translation.publishedAt?.toISOString(),
    dateModified: translation.updatedAt?.toISOString(),
    author: {
      '@type': 'Person',
      name: translation.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon`,
        width: 250,
        height: 250,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: category,
  };
}

/**
 * Generate BreadcrumbList schema
 * SEO Rule: Breadcrumbs improve crawlability and UX
 */
export function generateBreadcrumbSchema(
  lang: string,
  items: Array<{ label: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${siteUrl}${item.url}`,
    })),
  };
}

/**
 * Calculate reading time
 * UX: Display reading time on articles
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Validate SEO metadata
 * SEO Rule: Enforce title ≤ 70 chars, description ≤ 160 chars
 */
export function validateSEOMetadata(article: ArticleMetadata) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!article.title) {
    errors.push('Title is required');
  }
  if (article.seoTitle && article.seoTitle.length > 70) {
    errors.push(`SEO title is ${article.seoTitle.length} chars (max 70)`);
  }
  if (article.metaDescription && article.metaDescription.length > 160) {
    errors.push(`Meta description is ${article.metaDescription.length} chars (max 160)`);
  }
  if (!article.imageUrl) {
    warnings.push('Featured image recommended');
  }
  if (!article.tags || article.tags.length === 0) {
    warnings.push('No tags provided');
  }

  return { isValid: errors.length === 0, errors, warnings };
}
