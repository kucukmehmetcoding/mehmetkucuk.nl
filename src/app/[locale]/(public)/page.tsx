import {getTranslations} from 'next-intl/server';
import HomeClient from './HomeClient';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'SEO'});

  return {
    title: t('homeTitle'),
    description: t('homeDescription'),
    alternates: {
      canonical: `/${locale}`,
    }
  };
}

export default function HomePage() {
  return <HomeClient />;
}
