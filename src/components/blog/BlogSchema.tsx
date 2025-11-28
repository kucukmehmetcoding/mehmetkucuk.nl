import React from 'react';

interface BlogSchemaProps {
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  image?: string;
  url: string;
}

export default function BlogSchema({
  title,
  description,
  author,
  publishedAt,
  updatedAt,
  image,
  url,
}: BlogSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    author: {
      '@type': 'Person',
      name: author,
    },
    datePublished: publishedAt,
    dateModified: updatedAt,
    image: image,
    url: url,
    publisher: {
      '@type': 'Organization',
      name: 'Mehmet Küçük',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mehmetkucuk.nl/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
