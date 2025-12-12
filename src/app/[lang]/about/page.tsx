import type {Metadata} from 'next';
import Image from 'next/image';

type Props = {
  params: {lang: string};
};

const translations = {
  tr: {
    title: 'Hakkımızda',
    description: 'MK News Intelligence hakkında bilgi. Yapay zeka destekli haber platformumuzun misyonu, vizyonu ve ekibi.',
    hero: {
      title: 'MK News Intelligence',
      subtitle: 'Yapay Zeka Destekli Haber Platformu',
      description: 'Teknoloji, bilim, sağlık ve dünya haberlerini yapay zeka ile analiz ederek, size en doğru ve güncel bilgileri sunuyoruz.',
    },
    mission: {
      title: 'Misyonumuz',
      content: 'Karmaşık dünya haberlerini yapay zeka teknolojisi ile analiz ederek, okuyucularımıza doğru, tarafsız ve kolay anlaşılır içerikler sunmak. Bilgiye erişimi demokratikleştirmek ve herkesin dünya olaylarını takip edebilmesini sağlamak.',
    },
    vision: {
      title: 'Vizyonumuz',
      content: 'Yapay zeka destekli gazetecilik alanında öncü bir platform olmak ve okuyucularımıza dünyanın en güvenilir haber deneyimini sunmak. Teknoloji ve gazeteciği bir araya getirerek, haberciliğin geleceğini şekillendirmek.',
    },
    values: {
      title: 'Değerlerimiz',
      items: [
        {icon: '🎯', title: 'Doğruluk', desc: 'Her haberi doğruluk ve güvenilirlik ilkesiyle sunuyoruz.'},
        {icon: '⚖️', title: 'Tarafsızlık', desc: 'Haberleri herhangi bir siyasi veya ideolojik bakış açısından bağımsız sunuyoruz.'},
        {icon: '🚀', title: 'İnovasyon', desc: 'En son teknolojileri kullanarak habercilik deneyimini sürekli geliştiriyoruz.'},
        {icon: '🌍', title: 'Çeşitlilik', desc: 'Farklı bakış açılarını ve kültürleri kucaklayan içerikler sunuyoruz.'},
        {icon: '🔒', title: 'Şeffaflık', desc: 'Kaynaklarımızı ve yöntemlerimizi açıkça paylaşıyoruz.'},
        {icon: '♿', title: 'Erişilebilirlik', desc: 'Herkesin bilgiye kolayca ulaşabilmesini sağlıyoruz.'},
      ],
    },
    technology: {
      title: 'Teknolojimiz',
      content: 'MK News Intelligence, en gelişmiş yapay zeka modellerini kullanarak haber içeriklerini işler:',
      features: [
        {icon: '🤖', title: 'AI İçerik Analizi', desc: 'Haberleri otomatik olarak kategorize eder ve özetler'},
        {icon: '🌐', title: 'Çoklu Dil Desteği', desc: 'Türkçe, İngilizce ve Hollandaca içerik sunumu'},
        {icon: '📊', title: 'Gerçek Zamanlı İşleme', desc: 'Haberleri anında analiz eder ve yayınlar'},
        {icon: '🔍', title: 'Kaynak Doğrulama', desc: 'Güvenilir kaynaklardan haber toplama'},
      ],
    },
    editorial: {
      title: 'Editoryal Politikamız',
      content: `MK News Intelligence olarak, yüksek editoryal standartlara bağlıyız:

• Tüm haberler güvenilir kaynaklardan derlenmektedir
• Yapay zeka ile oluşturulan içerikler insan editörler tarafından denetlenmektedir
• Hatalı içerikler tespit edildiğinde hızla düzeltilmektedir
• Okuyucu geri bildirimleri değerlendirilmekte ve içerik kalitesi sürekli iyileştirilmektedir
• Reklam içerikleri, haber içeriklerinden açıkça ayrılmaktadır`,
    },
    contact: {
      title: 'Bize Ulaşın',
      content: 'Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçebilirsiniz.',
      button: 'İletişim Sayfası',
    },
  },
  en: {
    title: 'About Us',
    description: 'About MK News Intelligence. The mission, vision, and team of our AI-powered news platform.',
    hero: {
      title: 'MK News Intelligence',
      subtitle: 'AI-Powered News Platform',
      description: 'We analyze technology, science, health, and world news with artificial intelligence to provide you with the most accurate and up-to-date information.',
    },
    mission: {
      title: 'Our Mission',
      content: 'To analyze complex world news with AI technology and provide our readers with accurate, unbiased, and easy-to-understand content. To democratize access to information and enable everyone to follow world events.',
    },
    vision: {
      title: 'Our Vision',
      content: 'To be a pioneering platform in AI-powered journalism and provide our readers with the most reliable news experience in the world. To shape the future of journalism by bringing technology and journalism together.',
    },
    values: {
      title: 'Our Values',
      items: [
        {icon: '🎯', title: 'Accuracy', desc: 'We present every news story with accuracy and reliability.'},
        {icon: '⚖️', title: 'Impartiality', desc: 'We present news independent of any political or ideological perspective.'},
        {icon: '🚀', title: 'Innovation', desc: 'We continuously improve the news experience using the latest technologies.'},
        {icon: '🌍', title: 'Diversity', desc: 'We provide content that embraces different perspectives and cultures.'},
        {icon: '🔒', title: 'Transparency', desc: 'We openly share our sources and methods.'},
        {icon: '♿', title: 'Accessibility', desc: 'We ensure everyone can easily access information.'},
      ],
    },
    technology: {
      title: 'Our Technology',
      content: 'MK News Intelligence processes news content using the most advanced AI models:',
      features: [
        {icon: '🤖', title: 'AI Content Analysis', desc: 'Automatically categorizes and summarizes news'},
        {icon: '🌐', title: 'Multi-language Support', desc: 'Content in Turkish, English, and Dutch'},
        {icon: '📊', title: 'Real-time Processing', desc: 'Instantly analyzes and publishes news'},
        {icon: '🔍', title: 'Source Verification', desc: 'Collecting news from reliable sources'},
      ],
    },
    editorial: {
      title: 'Our Editorial Policy',
      content: `At MK News Intelligence, we are committed to high editorial standards:

• All news is compiled from reliable sources
• AI-generated content is supervised by human editors
• Incorrect content is quickly corrected when identified
• Reader feedback is evaluated and content quality is continuously improved
• Advertising content is clearly separated from news content`,
    },
    contact: {
      title: 'Contact Us',
      content: 'You can contact us for questions, suggestions, or feedback.',
      button: 'Contact Page',
    },
  },
  nl: {
    title: 'Over ons',
    description: 'Over MK News Intelligence. De missie, visie en het team van ons AI-gedreven nieuwsplatform.',
    hero: {
      title: 'MK News Intelligence',
      subtitle: 'AI-gedreven nieuwsplatform',
      description: 'Wij analyseren technologie-, wetenschaps-, gezondheids- en wereldnieuws met kunstmatige intelligentie om u de meest nauwkeurige en actuele informatie te bieden.',
    },
    mission: {
      title: 'Onze missie',
      content: 'Complex wereldnieuws analyseren met AI-technologie en onze lezers nauwkeurige, onbevooroordeelde en gemakkelijk te begrijpen inhoud bieden. Toegang tot informatie democratiseren en iedereen in staat stellen wereldgebeurtenissen te volgen.',
    },
    vision: {
      title: 'Onze visie',
      content: 'Een baanbrekend platform zijn in AI-gedreven journalistiek en onze lezers de meest betrouwbare nieuwservaring ter wereld bieden. De toekomst van journalistiek vormgeven door technologie en journalistiek samen te brengen.',
    },
    values: {
      title: 'Onze waarden',
      items: [
        {icon: '🎯', title: 'Nauwkeurigheid', desc: 'We presenteren elk nieuwsbericht met nauwkeurigheid en betrouwbaarheid.'},
        {icon: '⚖️', title: 'Onpartijdigheid', desc: 'We presenteren nieuws onafhankelijk van enig politiek of ideologisch perspectief.'},
        {icon: '🚀', title: 'Innovatie', desc: 'We verbeteren continu de nieuwservaring met de nieuwste technologieën.'},
        {icon: '🌍', title: 'Diversiteit', desc: 'We bieden inhoud die verschillende perspectieven en culturen omarmt.'},
        {icon: '🔒', title: 'Transparantie', desc: 'We delen openlijk onze bronnen en methoden.'},
        {icon: '♿', title: 'Toegankelijkheid', desc: 'We zorgen ervoor dat iedereen gemakkelijk toegang heeft tot informatie.'},
      ],
    },
    technology: {
      title: 'Onze technologie',
      content: 'MK News Intelligence verwerkt nieuwsinhoud met de meest geavanceerde AI-modellen:',
      features: [
        {icon: '🤖', title: 'AI-inhoudsanalyse', desc: 'Categoriseert en vat nieuws automatisch samen'},
        {icon: '🌐', title: 'Meertalige ondersteuning', desc: 'Inhoud in Turks, Engels en Nederlands'},
        {icon: '📊', title: 'Realtime verwerking', desc: 'Analyseert en publiceert nieuws direct'},
        {icon: '🔍', title: 'Bronverificatie', desc: 'Nieuws verzamelen uit betrouwbare bronnen'},
      ],
    },
    editorial: {
      title: 'Ons redactioneel beleid',
      content: `Bij MK News Intelligence zijn we toegewijd aan hoge redactionele normen:

• Al het nieuws wordt verzameld uit betrouwbare bronnen
• Door AI gegenereerde inhoud wordt gecontroleerd door menselijke redacteuren
• Onjuiste inhoud wordt snel gecorrigeerd wanneer geïdentificeerd
• Lezersfeedback wordt geëvalueerd en de inhoudskwaliteit wordt continu verbeterd
• Advertentie-inhoud is duidelijk gescheiden van nieuwsinhoud`,
    },
    contact: {
      title: 'Neem contact op',
      content: 'U kunt contact met ons opnemen voor vragen, suggesties of feedback.',
      button: 'Contactpagina',
    },
  },
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const lang = params.lang as keyof typeof translations;
  const t = translations[lang] || translations.en;

  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `https://mehmetkucuk.nl/${params.lang}/about`,
      languages: {
        tr: 'https://mehmetkucuk.nl/tr/about',
        en: 'https://mehmetkucuk.nl/en/about',
        nl: 'https://mehmetkucuk.nl/nl/about',
      },
    },
  };
}

export default function AboutPage({params}: Props) {
  const lang = params.lang as keyof typeof translations;
  const t = translations[lang] || translations.en;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.hero.title}</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-6">{t.hero.subtitle}</p>
          <p className="text-lg text-blue-50 max-w-2xl mx-auto">{t.hero.description}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span>🎯</span> {t.mission.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t.mission.content}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span>🔭</span> {t.vision.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t.vision.content}</p>
          </div>
        </div>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10">{t.values.title}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {t.values.items.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-6">{t.technology.title}</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">{t.technology.content}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {t.technology.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
                <span className="text-3xl">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Editorial Policy */}
        <section className="mb-16">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span>📋</span> {t.editorial.title}
            </h2>
            <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">{t.editorial.content}</div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t.contact.title}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t.contact.content}</p>
          <a
            href={`/${params.lang}/contact`}
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            {t.contact.button}
          </a>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: t.title,
            description: t.description,
            url: `https://mehmetkucuk.nl/${params.lang}/about`,
            inLanguage: params.lang,
            mainEntity: {
              '@type': 'Organization',
              name: 'MK News Intelligence',
              description: t.hero.description,
              url: 'https://mehmetkucuk.nl',
              logo: 'https://mehmetkucuk.nl/logo.png',
              foundingDate: '2024',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'NL',
              },
            },
          }),
        }}
      />
    </main>
  );
}
