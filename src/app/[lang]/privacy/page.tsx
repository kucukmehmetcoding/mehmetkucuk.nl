import type {Metadata} from 'next';

type Props = {
  params: {lang: string};
};

const translations = {
  tr: {
    title: 'Gizlilik Politikası',
    description: 'MK News Intelligence gizlilik politikası ve kişisel verilerin korunması hakkında bilgi.',
    lastUpdated: 'Son güncelleme: Ocak 2025',
    sections: [
      {
        title: '1. Giriş',
        content: `MK News Intelligence olarak, gizliliğinize önem veriyoruz. Bu gizlilik politikası, web sitemizi kullanırken kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.`,
      },
      {
        title: '2. Toplanan Veriler',
        content: `Sitemizi ziyaret ettiğinizde aşağıdaki bilgiler otomatik olarak toplanabilir:
• IP adresi ve tarayıcı bilgileri
• Ziyaret edilen sayfalar ve kalış süresi
• Referans kaynağı (hangi siteden geldiniz)
• Cihaz türü ve işletim sistemi

Ayrıca, iletişim formlarını kullandığınızda sağladığınız bilgiler (ad, e-posta, mesaj içeriği) toplanmaktadır.`,
      },
      {
        title: '3. Verilerin Kullanım Amaçları',
        content: `Toplanan veriler aşağıdaki amaçlarla kullanılmaktadır:
• Web sitesinin işlevselliğini ve performansını iyileştirmek
• İçerik ve reklamları kişiselleştirmek
• Site trafiğini analiz etmek
• İletişim taleplerine yanıt vermek
• Yasal yükümlülükleri yerine getirmek`,
      },
      {
        title: '4. Çerezler (Cookies)',
        content: `Web sitemiz, deneyiminizi iyileştirmek için çerezler kullanmaktadır. Çerezler hakkında detaylı bilgi için Çerez Politikamızı inceleyebilirsiniz.

Kullandığımız çerez türleri:
• Zorunlu çerezler: Sitenin çalışması için gerekli
• Analitik çerezler: Ziyaretçi davranışlarını anlamamıza yardımcı olur
• Reklam çerezleri: Kişiselleştirilmiş reklamlar sunmak için kullanılır`,
      },
      {
        title: '5. Üçüncü Taraf Hizmetleri',
        content: `Web sitemiz aşağıdaki üçüncü taraf hizmetlerini kullanmaktadır:

• Google Analytics: Ziyaretçi istatistikleri için
• Google AdSense: Reklam gösterimi için
• Google Tag Manager: Etiket yönetimi için
• Facebook Pixel: Reklam performansı için

Bu hizmetlerin kendi gizlilik politikaları bulunmaktadır ve verilerinizi kendi amaçları doğrultusunda kullanabilirler.`,
      },
      {
        title: '6. Veri Güvenliği',
        content: `Kişisel verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri uygulamaktayız:
• SSL şifrelemesi
• Güvenlik duvarları
• Düzenli güvenlik denetimleri
• Erişim kontrolleri`,
      },
      {
        title: '7. Haklarınız',
        content: `KVKK (Kişisel Verilerin Korunması Kanunu) ve GDPR kapsamında aşağıdaki haklara sahipsiniz:
• Kişisel verilerinize erişim hakkı
• Verilerin düzeltilmesini talep etme hakkı
• Verilerin silinmesini talep etme hakkı
• Veri işlemeye itiraz etme hakkı
• Veri taşınabilirliği hakkı`,
      },
      {
        title: '8. İletişim',
        content: `Gizlilik politikamız hakkında sorularınız veya veri talepleriniz için bizimle iletişime geçebilirsiniz:

E-posta: privacy@mehmetkucuk.nl
Adres: Hollanda`,
      },
      {
        title: '9. Politika Değişiklikleri',
        content: `Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler olması durumunda web sitemizde duyuru yapılacaktır. En son güncelleme tarihi sayfanın başında belirtilmektedir.`,
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    description: 'MK News Intelligence privacy policy and information about personal data protection.',
    lastUpdated: 'Last updated: January 2025',
    sections: [
      {
        title: '1. Introduction',
        content: `At MK News Intelligence, we value your privacy. This privacy policy explains how your personal data is collected, used, and protected when you use our website.`,
      },
      {
        title: '2. Data We Collect',
        content: `When you visit our site, the following information may be automatically collected:
• IP address and browser information
• Pages visited and time spent
• Referral source (which site you came from)
• Device type and operating system

Additionally, information you provide when using contact forms (name, email, message content) is collected.`,
      },
      {
        title: '3. Purpose of Data Use',
        content: `Collected data is used for the following purposes:
• To improve website functionality and performance
• To personalize content and advertisements
• To analyze site traffic
• To respond to communication requests
• To fulfill legal obligations`,
      },
      {
        title: '4. Cookies',
        content: `Our website uses cookies to improve your experience. For detailed information about cookies, please review our Cookie Policy.

Types of cookies we use:
• Essential cookies: Required for site operation
• Analytics cookies: Help us understand visitor behavior
• Advertising cookies: Used to serve personalized ads`,
      },
      {
        title: '5. Third-Party Services',
        content: `Our website uses the following third-party services:

• Google Analytics: For visitor statistics
• Google AdSense: For ad display
• Google Tag Manager: For tag management
• Facebook Pixel: For ad performance

These services have their own privacy policies and may use your data for their own purposes.`,
      },
      {
        title: '6. Data Security',
        content: `We implement industry-standard security measures to protect your personal data:
• SSL encryption
• Firewalls
• Regular security audits
• Access controls`,
      },
      {
        title: '7. Your Rights',
        content: `Under GDPR and other data protection regulations, you have the following rights:
• Right to access your personal data
• Right to request data correction
• Right to request data deletion
• Right to object to data processing
• Right to data portability`,
      },
      {
        title: '8. Contact',
        content: `For questions about our privacy policy or data requests, please contact us:

Email: privacy@mehmetkucuk.nl
Address: Netherlands`,
      },
      {
        title: '9. Policy Changes',
        content: `This privacy policy may be updated from time to time. In case of significant changes, an announcement will be made on our website. The last update date is indicated at the top of the page.`,
      },
    ],
  },
  nl: {
    title: 'Privacybeleid',
    description: 'MK News Intelligence privacybeleid en informatie over de bescherming van persoonsgegevens.',
    lastUpdated: 'Laatst bijgewerkt: januari 2025',
    sections: [
      {
        title: '1. Inleiding',
        content: `Bij MK News Intelligence hechten wij waarde aan uw privacy. Dit privacybeleid legt uit hoe uw persoonsgegevens worden verzameld, gebruikt en beschermd wanneer u onze website gebruikt.`,
      },
      {
        title: '2. Gegevens die we verzamelen',
        content: `Wanneer u onze site bezoekt, kunnen de volgende gegevens automatisch worden verzameld:
• IP-adres en browserinformatie
• Bezochte pagina's en verblijfsduur
• Verwijzingsbron (van welke site u kwam)
• Apparaattype en besturingssysteem

Daarnaast worden gegevens verzameld die u verstrekt via contactformulieren (naam, e-mail, berichtinhoud).`,
      },
      {
        title: '3. Doel van gegevensgebruik',
        content: `Verzamelde gegevens worden gebruikt voor de volgende doeleinden:
• Om de functionaliteit en prestaties van de website te verbeteren
• Om inhoud en advertenties te personaliseren
• Om siteverkeer te analyseren
• Om te reageren op communicatieverzoeken
• Om aan wettelijke verplichtingen te voldoen`,
      },
      {
        title: '4. Cookies',
        content: `Onze website gebruikt cookies om uw ervaring te verbeteren. Voor gedetailleerde informatie over cookies, raadpleeg ons Cookiebeleid.

Soorten cookies die we gebruiken:
• Essentiële cookies: Vereist voor de werking van de site
• Analytische cookies: Helpen ons bezoekersgedrag te begrijpen
• Advertentiecookies: Gebruikt voor gepersonaliseerde advertenties`,
      },
      {
        title: '5. Diensten van derden',
        content: `Onze website maakt gebruik van de volgende diensten van derden:

• Google Analytics: Voor bezoekersstatistieken
• Google AdSense: Voor advertentieweergave
• Google Tag Manager: Voor tagbeheer
• Facebook Pixel: Voor advertentieprestaties

Deze diensten hebben hun eigen privacybeleid en kunnen uw gegevens voor hun eigen doeleinden gebruiken.`,
      },
      {
        title: '6. Gegevensbeveiliging',
        content: `We implementeren industriestandaard beveiligingsmaatregelen om uw persoonsgegevens te beschermen:
• SSL-encryptie
• Firewalls
• Regelmatige beveiligingsaudits
• Toegangscontroles`,
      },
      {
        title: '7. Uw rechten',
        content: `Onder de AVG en andere gegevensbeschermingsregelgeving heeft u de volgende rechten:
• Recht op toegang tot uw persoonsgegevens
• Recht op rectificatie van gegevens
• Recht op verwijdering van gegevens
• Recht om bezwaar te maken tegen gegevensverwerking
• Recht op gegevensoverdraagbaarheid`,
      },
      {
        title: '8. Contact',
        content: `Voor vragen over ons privacybeleid of gegevensverzoeken, neem contact met ons op:

E-mail: privacy@mehmetkucuk.nl
Adres: Nederland`,
      },
      {
        title: '9. Beleidswijzigingen',
        content: `Dit privacybeleid kan van tijd tot tijd worden bijgewerkt. Bij belangrijke wijzigingen zal een aankondiging worden gedaan op onze website. De laatste bijwerkingsdatum staat bovenaan de pagina vermeld.`,
      },
    ],
  },
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const lang = params.lang as keyof typeof translations;
  const t = translations[lang] || translations.en;

  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `https://mehmetkucuk.nl/${params.lang}/privacy`,
      languages: {
        tr: 'https://mehmetkucuk.nl/tr/privacy',
        en: 'https://mehmetkucuk.nl/en/privacy',
        nl: 'https://mehmetkucuk.nl/nl/privacy',
      },
    },
  };
}

export default function PrivacyPage({params}: Props) {
  const lang = params.lang as keyof typeof translations;
  const t = translations[lang] || translations.en;

  return (
    <main className="min-h-screen py-12 px-4 max-w-4xl mx-auto">
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{t.lastUpdated}</p>

        {t.sections.map((section, index) => (
          <section key={index} className="mb-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">{section.title}</h2>
            <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">{section.content}</div>
          </section>
        ))}
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: t.title,
            description: t.description,
            url: `https://mehmetkucuk.nl/${params.lang}/privacy`,
            inLanguage: params.lang,
            isPartOf: {
              '@type': 'WebSite',
              name: 'MK News Intelligence',
              url: 'https://mehmetkucuk.nl',
            },
          }),
        }}
      />
    </main>
  );
}
