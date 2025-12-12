'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  lang: string;
  siteUrl?: string;
}

const homeLabels = {
  tr: 'Anasayfa',
  en: 'Home',
  nl: 'Startpagina',
};

export default function Breadcrumb({items, lang, siteUrl = 'https://mehmetkucuk.nl'}: BreadcrumbProps) {
  const homeLabel = homeLabels[lang as keyof typeof homeLabels] || homeLabels.en;

  // Build JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: homeLabel,
        item: `${siteUrl}/${lang}`,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        ...(item.href && {
          item: `${siteUrl}${item.href}`,
        }),
      })),
    ],
  };

  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />

      {/* Visual Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 overflow-x-auto py-2"
      >
        <Link
          href={`/${lang}`}
          className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
        >
          <span>🏠</span>
          <span className="hidden sm:inline">{homeLabel}</span>
        </Link>

        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400">›</span>
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-slate-900 dark:hover:text-white transition-colors truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
