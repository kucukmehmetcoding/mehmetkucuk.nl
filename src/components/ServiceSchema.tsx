interface ServiceSchemaProps {
  name: string;
  description: string;
  provider: string;
  areaServed: string;
  serviceType: string;
  url: string;
}

export default function ServiceSchema({
  name,
  description,
  provider,
  areaServed,
  serviceType,
  url,
}: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Person',
      name: provider,
    },
    areaServed: {
      '@type': 'Place',
      name: areaServed,
    },
    serviceType,
    url,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'EUR',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
