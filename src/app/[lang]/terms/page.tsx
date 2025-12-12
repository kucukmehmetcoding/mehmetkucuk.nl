import type {Metadata} from 'next';

type Props = {
  params: {lang: string};
};

const translations = {
  tr: {
    title: 'Kullanım Koşulları',
    description: 'MK News Intelligence web sitesi kullanım koşulları ve şartları.',
    lastUpdated: 'Son güncelleme: Ocak 2025',
    sections: [
      {
        title: '1. Kabul ve Onay',
        content: `MK News Intelligence web sitesini ("Site") kullanarak, bu Kullanım Koşullarını kabul etmiş sayılırsınız. Bu koşulları kabul etmiyorsanız, lütfen sitemizi kullanmayınız.`,
      },
      {
        title: '2. Hizmet Tanımı',
        content: `MK News Intelligence, yapay zeka destekli bir haber toplama ve yayınlama platformudur. Sitemiz:
• Çeşitli kaynaklardan haber içerikleri toplar ve işler
• Yapay zeka ile içerik analizi ve özeti yapar
• Çoklu dil desteği (Türkçe, İngilizce, Hollandaca) sunar
• Teknoloji, bilim, sağlık ve diğer konularda haberler yayınlar`,
      },
      {
        title: '3. Fikri Mülkiyet',
        content: `Site üzerindeki tüm içerikler (yazılar, görseller, tasarım, logo, yazılım) MK News Intelligence'a aittir veya lisanslıdır. Bu içerikler telif hakkı yasaları ile korunmaktadır.

İzin verilenler:
• Kişisel kullanım için içerik okuma
• Sosyal medyada paylaşma (kaynak belirtilerek)
• Alıntı yapma (kaynak ve link belirtilerek)

İzin verilmeyenler:
• İçeriklerin izinsiz kopyalanması veya çoğaltılması
• Ticari amaçla kullanım
• İçeriklerin değiştirilerek yayınlanması`,
      },
      {
        title: '4. Kullanıcı Yükümlülükleri',
        content: `Sitemizi kullanırken aşağıdaki kurallara uymanız gerekmektedir:
• Yasa dışı faaliyetlerde bulunmamak
• Site güvenliğini tehlikeye atmamak
• Diğer kullanıcıların haklarına saygı göstermek
• Spam veya kötü amaçlı içerik paylaşmamak
• Site altyapısına zarar vermemek
• Bot veya otomatik sistemlerle siteyi kötüye kullanmamak`,
      },
      {
        title: '5. İçerik Sorumluluğu',
        content: `• Haber içerikleri çeşitli kaynaklardan derlenmekte ve AI ile işlenmektedir
• İçeriklerin doğruluğu için azami özen gösterilmekte olup, yanlışlıklar için sorumluluk kabul edilmemektedir
• Haberler bilgilendirme amaçlıdır ve profesyonel tavsiye yerine geçmez
• Finansal, tıbbi veya hukuki kararlar için uzman görüşü alınmalıdır`,
      },
      {
        title: '6. Üçüncü Taraf Bağlantıları',
        content: `Sitemiz üçüncü taraf web sitelerine bağlantılar içerebilir. Bu bağlantılar:
• Sadece bilgi amaçlıdır
• Bu sitelerin içerik veya uygulamalarından sorumlu değiliz
• Üçüncü taraf sitelerin kendi kullanım koşulları geçerlidir`,
      },
      {
        title: '7. Reklamlar',
        content: `Sitemizde Google AdSense ve diğer reklam ağları aracılığıyla reklamlar gösterilmektedir:
• Reklamlar üçüncü taraflar tarafından sağlanmaktadır
• Reklam içeriklerinden reklam veren sorumludur
• Kişiselleştirilmiş reklamlar için çerez kullanılmaktadır
• Reklam tercihlerinizi tarayıcı ayarlarından değiştirebilirsiniz`,
      },
      {
        title: '8. Hizmet Değişiklikleri',
        content: `MK News Intelligence, herhangi bir zamanda ve önceden bildirimde bulunmaksızın:
• Site içeriğini değiştirme
• Hizmetleri askıya alma veya sonlandırma
• Kullanım koşullarını güncelleme
hakkını saklı tutar.`,
      },
      {
        title: '9. Sorumluluk Sınırlaması',
        content: `MK News Intelligence:
• Site kullanımından kaynaklanan doğrudan veya dolaylı zararlardan sorumlu değildir
• Hizmetin kesintisiz veya hatasız olacağını garanti etmez
• Üçüncü taraf içeriklerinden sorumlu değildir
• Teknik sorunlar nedeniyle oluşabilecek veri kayıplarından sorumlu değildir`,
      },
      {
        title: '10. Uygulanacak Hukuk',
        content: `Bu Kullanım Koşulları, Hollanda yasalarına tabidir. Herhangi bir uyuşmazlık durumunda Hollanda mahkemeleri yetkilidir.`,
      },
      {
        title: '11. İletişim',
        content: `Kullanım koşulları hakkında sorularınız için:

E-posta: info@mehmetkucuk.nl
Web: https://mehmetkucuk.nl/contact`,
      },
    ],
  },
  en: {
    title: 'Terms of Use',
    description: 'MK News Intelligence website terms and conditions of use.',
    lastUpdated: 'Last updated: January 2025',
    sections: [
      {
        title: '1. Acceptance and Agreement',
        content: `By using the MK News Intelligence website ("Site"), you agree to these Terms of Use. If you do not accept these terms, please do not use our site.`,
      },
      {
        title: '2. Service Description',
        content: `MK News Intelligence is an AI-powered news aggregation and publishing platform. Our site:
• Collects and processes news content from various sources
• Performs content analysis and summarization with AI
• Offers multi-language support (Turkish, English, Dutch)
• Publishes news on technology, science, health, and other topics`,
      },
      {
        title: '3. Intellectual Property',
        content: `All content on the Site (articles, images, design, logo, software) belongs to or is licensed to MK News Intelligence. This content is protected by copyright laws.

Permitted:
• Reading content for personal use
• Sharing on social media (with attribution)
• Quoting (with source and link)

Not permitted:
• Unauthorized copying or reproduction of content
• Commercial use
• Modifying and republishing content`,
      },
      {
        title: '4. User Obligations',
        content: `When using our site, you must follow these rules:
• Do not engage in illegal activities
• Do not compromise site security
• Respect other users' rights
• Do not share spam or malicious content
• Do not damage site infrastructure
• Do not abuse the site with bots or automated systems`,
      },
      {
        title: '5. Content Responsibility',
        content: `• News content is compiled from various sources and processed by AI
• Every effort is made to ensure accuracy, but no responsibility is accepted for errors
• News is for informational purposes and does not replace professional advice
• Expert advice should be sought for financial, medical, or legal decisions`,
      },
      {
        title: '6. Third-Party Links',
        content: `Our site may contain links to third-party websites. These links:
• Are for informational purposes only
• We are not responsible for the content or practices of these sites
• Third-party sites have their own terms of use`,
      },
      {
        title: '7. Advertisements',
        content: `Advertisements are displayed on our site through Google AdSense and other ad networks:
• Ads are provided by third parties
• Advertisers are responsible for ad content
• Cookies are used for personalized advertising
• You can change your ad preferences in browser settings`,
      },
      {
        title: '8. Service Changes',
        content: `MK News Intelligence reserves the right to, at any time and without prior notice:
• Modify site content
• Suspend or terminate services
• Update terms of use`,
      },
      {
        title: '9. Limitation of Liability',
        content: `MK News Intelligence:
• Is not responsible for direct or indirect damages arising from site use
• Does not guarantee uninterrupted or error-free service
• Is not responsible for third-party content
• Is not responsible for data loss due to technical issues`,
      },
      {
        title: '10. Governing Law',
        content: `These Terms of Use are governed by the laws of the Netherlands. In case of any dispute, Dutch courts have jurisdiction.`,
      },
      {
        title: '11. Contact',
        content: `For questions about the terms of use:

Email: info@mehmetkucuk.nl
Web: https://mehmetkucuk.nl/contact`,
      },
    ],
  },
  nl: {
    title: 'Gebruiksvoorwaarden',
    description: 'MK News Intelligence website gebruiksvoorwaarden en -bepalingen.',
    lastUpdated: 'Laatst bijgewerkt: januari 2025',
    sections: [
      {
        title: '1. Acceptatie en Overeenkomst',
        content: `Door de MK News Intelligence website ("Site") te gebruiken, gaat u akkoord met deze Gebruiksvoorwaarden. Als u deze voorwaarden niet accepteert, gebruik dan onze site niet.`,
      },
      {
        title: '2. Dienstomschrijving',
        content: `MK News Intelligence is een AI-gedreven nieuwsaggregatie- en publicatieplatform. Onze site:
• Verzamelt en verwerkt nieuwsinhoud uit verschillende bronnen
• Voert inhoudsanalyse en samenvatting uit met AI
• Biedt meertalige ondersteuning (Turks, Engels, Nederlands)
• Publiceert nieuws over technologie, wetenschap, gezondheid en andere onderwerpen`,
      },
      {
        title: '3. Intellectueel Eigendom',
        content: `Alle inhoud op de Site (artikelen, afbeeldingen, ontwerp, logo, software) behoort toe aan of is gelicentieerd aan MK News Intelligence. Deze inhoud wordt beschermd door auteursrechtwetten.

Toegestaan:
• Inhoud lezen voor persoonlijk gebruik
• Delen op sociale media (met bronvermelding)
• Citeren (met bron en link)

Niet toegestaan:
• Ongeoorloofde kopieën of reproductie van inhoud
• Commercieel gebruik
• Wijzigen en opnieuw publiceren van inhoud`,
      },
      {
        title: '4. Gebruikersverplichtingen',
        content: `Bij het gebruik van onze site moet u deze regels volgen:
• Geen illegale activiteiten ondernemen
• De sitebeveiliging niet in gevaar brengen
• De rechten van andere gebruikers respecteren
• Geen spam of kwaadaardige inhoud delen
• De site-infrastructuur niet beschadigen
• De site niet misbruiken met bots of geautomatiseerde systemen`,
      },
      {
        title: '5. Inhoudsverantwoordelijkheid',
        content: `• Nieuwsinhoud wordt verzameld uit verschillende bronnen en verwerkt door AI
• Er wordt alles aan gedaan om de nauwkeurigheid te waarborgen, maar er wordt geen verantwoordelijkheid aanvaard voor fouten
• Nieuws is voor informatieve doeleinden en vervangt geen professioneel advies
• Deskundig advies moet worden ingewonnen voor financiële, medische of juridische beslissingen`,
      },
      {
        title: '6. Links naar Derden',
        content: `Onze site kan links naar websites van derden bevatten. Deze links:
• Zijn alleen voor informatieve doeleinden
• Wij zijn niet verantwoordelijk voor de inhoud of praktijken van deze sites
• Sites van derden hebben hun eigen gebruiksvoorwaarden`,
      },
      {
        title: '7. Advertenties',
        content: `Advertenties worden op onze site weergegeven via Google AdSense en andere advertentienetwerken:
• Advertenties worden geleverd door derden
• Adverteerders zijn verantwoordelijk voor advertentie-inhoud
• Cookies worden gebruikt voor gepersonaliseerde advertenties
• U kunt uw advertentievoorkeuren wijzigen in browserinstellingen`,
      },
      {
        title: '8. Dienstwijzigingen',
        content: `MK News Intelligence behoudt zich het recht voor om op elk moment en zonder voorafgaande kennisgeving:
• Site-inhoud te wijzigen
• Diensten op te schorten of te beëindigen
• Gebruiksvoorwaarden bij te werken`,
      },
      {
        title: '9. Beperking van Aansprakelijkheid',
        content: `MK News Intelligence:
• Is niet verantwoordelijk voor directe of indirecte schade voortvloeiend uit sitegebruik
• Garandeert geen ononderbroken of foutloze dienst
• Is niet verantwoordelijk voor inhoud van derden
• Is niet verantwoordelijk voor gegevensverlies door technische problemen`,
      },
      {
        title: '10. Toepasselijk Recht',
        content: `Deze Gebruiksvoorwaarden zijn onderworpen aan de wetten van Nederland. In geval van geschillen zijn de Nederlandse rechtbanken bevoegd.`,
      },
      {
        title: '11. Contact',
        content: `Voor vragen over de gebruiksvoorwaarden:

E-mail: info@mehmetkucuk.nl
Web: https://mehmetkucuk.nl/contact`,
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
      canonical: `https://mehmetkucuk.nl/${params.lang}/terms`,
      languages: {
        tr: 'https://mehmetkucuk.nl/tr/terms',
        en: 'https://mehmetkucuk.nl/en/terms',
        nl: 'https://mehmetkucuk.nl/nl/terms',
      },
    },
  };
}

export default function TermsPage({params}: Props) {
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
            url: `https://mehmetkucuk.nl/${params.lang}/terms`,
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
