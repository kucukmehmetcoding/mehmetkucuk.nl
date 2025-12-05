interface ProjectSchemaProps {
  name: string;
  description: string;
  image: string;
  url?: string;
  dateCreated: string;
  creator: string;
  technologies: string[];
}

export default function ProjectSchema({
  name,
  description,
  image,
  url,
  dateCreated,
  creator,
  technologies,
}: ProjectSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name,
    description,
    image,
    url: url || undefined,
    dateCreated,
    creator: {
      '@type': 'Person',
      name: creator,
    },
    keywords: technologies.join(', '),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
