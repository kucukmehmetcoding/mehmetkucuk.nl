import { getTranslations } from 'next-intl/server';
import { Monitor, Code, Bot, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import ServiceSchema from '@/components/ServiceSchema';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'SEO'});

  return {
    title: t('servicesTitle'),
    description: t('servicesDescription'),
    alternates: {
      canonical: `/${locale}/services`,
    }
  };
}

export default async function ServicesPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'ServicesPage'});
  const tNav = await getTranslations({locale, namespace: 'Navigation'});

  const services = [
    {
      id: 'webDesign',
      icon: <Monitor className="w-12 h-12 text-blue-500" />,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-100'
    },
    {
      id: 'software',
      icon: <Code className="w-12 h-12 text-green-500" />,
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-100'
    },
    {
      id: 'aiBots',
      icon: <Bot className="w-12 h-12 text-purple-500" />,
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-100'
    }
  ];

  return (
    <>
      {/* Schema Markup for Services */}
      <ServiceSchema
        name={locale === 'tr' ? 'Web ve Yazılım Geliştirme Hizmetleri' : locale === 'nl' ? 'Web- en softwareontwikkelingsdiensten' : 'Web and Software Development Services'}
        description={locale === 'tr' ? 'Profesyonel web tasarım, özel yazılım geliştirme ve AI chatbot çözümleri. Rotterdam, Hollanda merkezli freelance hizmetler.' : locale === 'nl' ? 'Professionele webdesign, aangepaste softwareontwikkeling en AI-chatbotoplossingen. Freelance diensten gevestigd in Rotterdam, Nederland.' : 'Professional web design, custom software development, and AI chatbot solutions. Freelance services based in Rotterdam, Netherlands.'}
        provider="Mehmet Küçük"
        areaServed="Netherlands, Europe"
        serviceType="Web Development, Software Engineering, AI Solutions"
        url={`https://mehmetkucuk.nl/${locale}/services`}
      />
      
      <div className="min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            const features = t(`items.${service.id}.features`).split(',');
            
            return (
              <div 
                key={service.id}
                className={`relative group bg-white rounded-2xl p-8 border ${service.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t(`items.${service.id}.title`)}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {t(`items.${service.id}.description`)}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link 
                  href="/contact" 
                  className="inline-flex items-center font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {tNav('contact')}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>

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
    </>
  );
}
