export default function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Mehmet Kucuk",
    "image": "https://mehmetkucuk.nl/logo.png",
    "url": "https://mehmetkucuk.nl",
    "telephone": "",
    "email": "info@mehmetkucuk.nl",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Rotterdam",
      "addressCountry": "NL"
    },
    "priceRange": "$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "sameAs": [
      "https://github.com/mehmetkucuk",
      "https://linkedin.com/in/mehmetkucuk",
      "https://twitter.com/mehmetkucuk"
    ]
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": "https://mehmetkucuk.nl"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Hizmetler",
        "item": "https://mehmetkucuk.nl/services"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "İletişim",
        "item": "https://mehmetkucuk.nl/contact"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </>
  );
}
