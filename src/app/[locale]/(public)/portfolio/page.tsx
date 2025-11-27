import { getTranslations } from 'next-intl/server';
import {Link} from '@/i18n/routing';
import PortfolioClient from '@/components/PortfolioClient';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'SEO'});

  return {
    title: t('portfolioTitle'),
    description: t('portfolioDescription'),
    alternates: {
      canonical: `/${locale}/portfolio`,
    }
  };
}

// Sample project data - in production this could come from a CMS or database
const projects: Array<{
  id: string;
  title: { tr: string; en: string; nl: string };
  description: { tr: string; en: string; nl: string };
  category: 'web' | 'software' | 'ai';
  image: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  completionDate: string;
  client: { tr: string; en: string; nl: string };
}> = [
  {
    id: 'e-commerce-platform',
    title: {
      tr: 'E-Ticaret Platformu',
      en: 'E-Commerce Platform',
      nl: 'E-Commerce Platform'
    },
    description: {
      tr: 'Modern ve kullanıcı dostu e-ticaret sitesi. Ürün yönetimi, sepet sistemi ve ödeme entegrasyonu.',
      en: 'Modern and user-friendly e-commerce website. Product management, cart system and payment integration.',
      nl: 'Moderne en gebruiksvriendelijke e-commerce website. Productbeheer, winkelwagensysteem en betaalintegratie.'
    },
    image: '/images/portfolio/ecommerce.jpg',
    category: 'web',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Stripe'],
    liveUrl: 'https://demo-ecommerce.mehmetkucuk.nl',
    githubUrl: undefined,
    completionDate: '2024-03',
    client: {
      tr: 'Gizli',
      en: 'Confidential',
      nl: 'Vertrouwelijk'
    }
  },
  {
    id: 'crm-system',
    title: {
      tr: 'CRM Yönetim Sistemi',
      en: 'CRM Management System',
      nl: 'CRM Beheersysteem'
    },
    description: {
      tr: 'İşletmeler için müşteri ilişkileri yönetim sistemi. Müşteri takibi, satış süreçleri ve raporlama.',
      en: 'Customer relationship management system for businesses. Customer tracking, sales processes and reporting.',
      nl: 'Klantrelatiebeheersysteem voor bedrijven. Klanttracking, verkoopprocessen en rapportage.'
    },
    image: '/images/portfolio/crm.jpg',
    category: 'software',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Express'],
    liveUrl: 'https://demo-crm.mehmetkucuk.nl',
    githubUrl: undefined,
    completionDate: '2024-01',
    client: {
      tr: 'TechCorp Ltd.',
      en: 'TechCorp Ltd.',
      nl: 'TechCorp Ltd.'
    }
  },
  {
    id: 'ai-chatbot',
    title: {
      tr: 'AI Müşteri Hizmetleri Botu',
      en: 'AI Customer Service Bot',
      nl: 'AI Klantenservice Bot'
    },
    description: {
      tr: '7/24 müşteri destek botu. Doğal dil işleme ve otomatik yanıt sistemi.',
      en: '24/7 customer support bot. Natural language processing and automatic response system.',
      nl: '24/7 klantenondersteuningsbot. Natuurlijke taalverwerking en automatisch antwoordsysteem.'
    },
    image: '/images/portfolio/chatbot.jpg',
    category: 'ai',
    technologies: ['Python', 'OpenAI API', 'FastAPI', 'React'],
    liveUrl: 'https://demo-bot.mehmetkucuk.nl',
    githubUrl: 'https://github.com/mehmetkucuk/ai-chatbot',
    completionDate: '2024-06',
    client: {
      tr: 'RetailPlus',
      en: 'RetailPlus',
      nl: 'RetailPlus'
    }
  },
  {
    id: 'portfolio-website',
    title: {
      tr: 'Kurumsal Web Sitesi',
      en: 'Corporate Website',
      nl: 'Bedrijfswebsite'
    },
    description: {
      tr: 'Çok dilli, SEO uyumlu ve responsive kurumsal web sitesi.',
      en: 'Multilingual, SEO-friendly and responsive corporate website.',
      nl: 'Meertalige, SEO-vriendelijke en responsieve bedrijfswebsite.'
    },
    image: '/images/portfolio/corporate.jpg',
    category: 'web',
    technologies: ['Next.js', 'next-intl', 'Tailwind CSS', 'Vercel'],
    liveUrl: 'https://mehmetkucuk.nl',
    githubUrl: undefined,
    completionDate: '2024-11',
    client: {
      tr: 'Kişisel Proje',
      en: 'Personal Project',
      nl: 'Persoonlijk Project'
    }
  }
];

export default async function PortfolioPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'PortfolioPage'});

  return (
    <div className="min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Interactive Portfolio with Filtering */}
        <PortfolioClient projects={projects} locale={locale} />

        {/* Bottom CTA */}
        <div className="mt-20 text-center bg-gray-50 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {t('ctaTitle')}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('ctaSubtitle')}
          </p>
          <Link
            href="/contact"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            {t('ctaButton')}
          </Link>
        </div>
      </div>
    </div>
  );
}