'use client';

import dynamic from 'next/dynamic';

// Lazy load social share buttons to avoid hydration issues
const SocialShareButtons = dynamic(
  () => import('@/components/SocialShareButtons'),
  {ssr: false}
);

interface ArticleShareProps {
  url: string;
  title: string;
  summary: string;
  lang: string;
  variant: 'horizontal' | 'vertical' | 'floating';
}

export default function ArticleShare({url, title, summary, lang, variant}: ArticleShareProps) {
  return (
    <SocialShareButtons
      url={url}
      title={title}
      summary={summary}
      lang={lang}
      variant={variant}
    />
  );
}
