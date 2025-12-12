import type {Metadata} from 'next';

type Props = {
  params: {lang: string};
};

const translations = {
  tr: {
    title: 'Çerez Politikası',
    description: 'MK News Intelligence çerez (cookie) politikası. Web sitemizde kullanılan çerezler hakkında bilgi.',
    lastUpdated: 'Son güncelleme: Ocak 2025',
    sections: [
      {
        title: '1. Çerez Nedir?',
        content: `Çerezler (cookies), web sitelerinin tarayıcınıza yerleştirdiği küçük metin dosyalarıdır. Bu dosyalar, web sitesinin düzgün çalışmasını sağlamak, site kullanımını analiz etmek ve kişiselleştirilmiş deneyimler sunmak için kullanılır.

Çerezler genellikle aşağıdaki bilgileri içerir:
• Çerezin adı ve değeri
• Çerezin ait olduğu alan adı
• Çerezin geçerlilik süresi
• Güvenlik ayarları`,
      },
      {
        title: '2. Kullandığımız Çerez Türleri',
        content: `MK News Intelligence web sitesinde aşağıdaki çerez türlerini kullanmaktayız:

🔹 Zorunlu Çerezler
Site işlevselliği için kesinlikle gerekli olan çerezlerdir. Bu çerezler olmadan site düzgün çalışamaz.
• Oturum çerezleri
• Güvenlik çerezleri
• Dil tercihi çerezleri

🔹 Performans Çerezleri
Site performansını ve kullanıcı davranışlarını analiz etmek için kullanılır.
• Google Analytics çerezleri
• Sayfa görüntüleme istatistikleri
• Hata izleme çerezleri

🔹 İşlevsellik Çerezleri
Kullanıcı tercihlerini hatırlamak için kullanılır.
• Tema tercihi (açık/koyu mod)
• Yazı tipi boyutu
• Son görüntülenen haberler

🔹 Reklam Çerezleri
Kişiselleştirilmiş reklamlar sunmak için kullanılır.
• Google AdSense çerezleri
• Facebook Pixel çerezleri
• Reklam performans çerezleri`,
      },
      {
        title: '3. Üçüncü Taraf Çerezleri',
        content: `Web sitemiz aşağıdaki üçüncü taraf hizmetlerinin çerezlerini kullanmaktadır:

📊 Google Analytics
Amaç: Site trafiğini ve kullanıcı davranışlarını analiz etmek
Çerezler: _ga, _gid, _gat
Süre: 2 yıla kadar
Gizlilik: https://policies.google.com/privacy

💰 Google AdSense
Amaç: Kişiselleştirilmiş reklamlar sunmak
Çerezler: IDE, DSID, __gads
Süre: 13 aya kadar
Gizlilik: https://policies.google.com/technologies/ads

📱 Facebook Pixel
Amaç: Reklam performansını ölçmek
Çerezler: _fbp, fr
Süre: 3 aya kadar
Gizlilik: https://www.facebook.com/privacy/explanation

📈 Google Tag Manager
Amaç: Çeşitli etiketleri ve izleyicileri yönetmek
Gizlilik: https://policies.google.com/privacy`,
      },
      {
        title: '4. Çerez Yönetimi',
        content: `Çerezleri aşağıdaki yöntemlerle kontrol edebilirsiniz:

🔧 Tarayıcı Ayarları
Çoğu tarayıcı, çerezleri yönetmenize olanak tanır:
• Chrome: Ayarlar > Gizlilik ve güvenlik > Çerezler
• Firefox: Seçenekler > Gizlilik ve Güvenlik
• Safari: Tercihler > Gizlilik
• Edge: Ayarlar > Gizlilik, arama ve hizmetler

⚙️ Çerez Tercihleri
Sitemizin çerez bildirimi üzerinden tercihlerinizi güncelleyebilirsiniz.

🚫 Çerezleri Devre Dışı Bırakma
Çerezleri tamamen devre dışı bırakabilirsiniz, ancak bu durumda sitenin bazı özellikleri düzgün çalışmayabilir.`,
      },
      {
        title: '5. Çerez Süresi',
        content: `Çerezler farklı sürelerde saklanabilir:

• Oturum Çerezleri: Tarayıcınızı kapattığınızda silinir
• Kalıcı Çerezler: Belirlenen süre dolana kadar saklanır (1 gün - 2 yıl arası)

Her çerezin ne kadar süre saklandığı, çerezin amacına ve türüne bağlıdır.`,
      },
      {
        title: '6. Çerez Onayı',
        content: `Web sitemizi ilk ziyaretinizde, çerez kullanımı hakkında bilgilendirilirsiniz. Zorunlu olmayan çerezler için onayınızı isteriz.

Onay tercihiniz bir çerez olarak saklanır ve gelecekteki ziyaretlerinizde hatırlanır. Tercihlerinizi istediğiniz zaman değiştirebilirsiniz.`,
      },
      {
        title: '7. Yasal Dayanak',
        content: `Çerez kullanımımız aşağıdaki yasal düzenlemelere uygundur:

🇪🇺 GDPR (Avrupa Genel Veri Koruma Yönetmeliği)
• Açık onay gerekliliği
• Çerezleri reddetme hakkı
• Veri taşınabilirliği hakkı

🇹🇷 KVKK (Kişisel Verilerin Korunması Kanunu)
• Aydınlatma yükümlülüğü
• Açık rıza gerekliliği

🇳🇱 Hollanda Telekomünikasyon Yasası
• Çerez bildirimi zorunluluğu
• Kullanıcı onayı gerekliliği`,
      },
      {
        title: '8. Politika Güncellemeleri',
        content: `Bu çerez politikası zaman zaman güncellenebilir. Önemli değişiklikler olması durumunda:
• Web sitesinde duyuru yapılır
• Yeni onay istenebilir
• Son güncelleme tarihi güncellenir

Politikamızı düzenli olarak kontrol etmenizi öneririz.`,
      },
      {
        title: '9. İletişim',
        content: `Çerez politikamız hakkında sorularınız için:

📧 E-posta: privacy@mehmetkucuk.nl
🌐 Web: https://mehmetkucuk.nl/contact
📍 Konum: Hollanda`,
      },
    ],
  },
  en: {
    title: 'Cookie Policy',
    description: 'MK News Intelligence cookie policy. Information about cookies used on our website.',
    lastUpdated: 'Last updated: January 2025',
    sections: [
      {
        title: '1. What Are Cookies?',
        content: `Cookies are small text files that websites place on your browser. These files are used to ensure the website works properly, analyze site usage, and provide personalized experiences.

Cookies typically contain the following information:
• Cookie name and value
• Domain the cookie belongs to
• Cookie expiration period
• Security settings`,
      },
      {
        title: '2. Types of Cookies We Use',
        content: `We use the following types of cookies on the MK News Intelligence website:

🔹 Essential Cookies
Cookies that are absolutely necessary for site functionality. The site cannot function properly without these cookies.
• Session cookies
• Security cookies
• Language preference cookies

🔹 Performance Cookies
Used to analyze site performance and user behavior.
• Google Analytics cookies
• Page view statistics
• Error tracking cookies

🔹 Functionality Cookies
Used to remember user preferences.
• Theme preference (light/dark mode)
• Font size
• Recently viewed news

🔹 Advertising Cookies
Used to serve personalized advertisements.
• Google AdSense cookies
• Facebook Pixel cookies
• Ad performance cookies`,
      },
      {
        title: '3. Third-Party Cookies',
        content: `Our website uses cookies from the following third-party services:

📊 Google Analytics
Purpose: To analyze site traffic and user behavior
Cookies: _ga, _gid, _gat
Duration: Up to 2 years
Privacy: https://policies.google.com/privacy

💰 Google AdSense
Purpose: To serve personalized ads
Cookies: IDE, DSID, __gads
Duration: Up to 13 months
Privacy: https://policies.google.com/technologies/ads

📱 Facebook Pixel
Purpose: To measure ad performance
Cookies: _fbp, fr
Duration: Up to 3 months
Privacy: https://www.facebook.com/privacy/explanation

📈 Google Tag Manager
Purpose: To manage various tags and trackers
Privacy: https://policies.google.com/privacy`,
      },
      {
        title: '4. Managing Cookies',
        content: `You can control cookies in the following ways:

🔧 Browser Settings
Most browsers allow you to manage cookies:
• Chrome: Settings > Privacy and security > Cookies
• Firefox: Options > Privacy & Security
• Safari: Preferences > Privacy
• Edge: Settings > Privacy, search, and services

⚙️ Cookie Preferences
You can update your preferences through our site's cookie notice.

🚫 Disabling Cookies
You can completely disable cookies, but some features of the site may not work properly.`,
      },
      {
        title: '5. Cookie Duration',
        content: `Cookies can be stored for different periods:

• Session Cookies: Deleted when you close your browser
• Persistent Cookies: Stored until the specified period expires (between 1 day - 2 years)

How long each cookie is stored depends on the purpose and type of the cookie.`,
      },
      {
        title: '6. Cookie Consent',
        content: `On your first visit to our website, you will be informed about cookie usage. We ask for your consent for non-essential cookies.

Your consent preference is stored as a cookie and remembered on future visits. You can change your preferences at any time.`,
      },
      {
        title: '7. Legal Basis',
        content: `Our cookie usage complies with the following regulations:

🇪🇺 GDPR (General Data Protection Regulation)
• Explicit consent requirement
• Right to refuse cookies
• Data portability right

🇹🇷 KVKK (Turkish Personal Data Protection Law)
• Disclosure obligation
• Explicit consent requirement

🇳🇱 Dutch Telecommunications Act
• Cookie notification obligation
• User consent requirement`,
      },
      {
        title: '8. Policy Updates',
        content: `This cookie policy may be updated from time to time. In case of significant changes:
• An announcement will be made on the website
• New consent may be requested
• The last update date will be updated

We recommend checking our policy regularly.`,
      },
      {
        title: '9. Contact',
        content: `For questions about our cookie policy:

📧 Email: privacy@mehmetkucuk.nl
🌐 Web: https://mehmetkucuk.nl/contact
📍 Location: Netherlands`,
      },
    ],
  },
  nl: {
    title: 'Cookiebeleid',
    description: 'MK News Intelligence cookiebeleid. Informatie over cookies die op onze website worden gebruikt.',
    lastUpdated: 'Laatst bijgewerkt: januari 2025',
    sections: [
      {
        title: '1. Wat zijn cookies?',
        content: `Cookies zijn kleine tekstbestanden die websites op uw browser plaatsen. Deze bestanden worden gebruikt om ervoor te zorgen dat de website goed werkt, het sitegebruik te analyseren en gepersonaliseerde ervaringen te bieden.

Cookies bevatten doorgaans de volgende informatie:
• Cookienaam en waarde
• Domein waartoe de cookie behoort
• Vervaltijd van de cookie
• Beveiligingsinstellingen`,
      },
      {
        title: '2. Soorten cookies die we gebruiken',
        content: `We gebruiken de volgende soorten cookies op de MK News Intelligence website:

🔹 Essentiële cookies
Cookies die absoluut noodzakelijk zijn voor de functionaliteit van de site. De site kan niet goed functioneren zonder deze cookies.
• Sessiecookies
• Beveiligingscookies
• Taalvoorkeurcookies

🔹 Prestatiecookies
Gebruikt om siteprestaties en gebruikersgedrag te analyseren.
• Google Analytics cookies
• Paginaweergavestatistieken
• Foutopsporingscookies

🔹 Functionaliteitscookies
Gebruikt om gebruikersvoorkeuren te onthouden.
• Themavoorkeur (lichte/donkere modus)
• Lettergrootte
• Recent bekeken nieuws

🔹 Advertentiecookies
Gebruikt om gepersonaliseerde advertenties te tonen.
• Google AdSense cookies
• Facebook Pixel cookies
• Advertentieprestatiecookies`,
      },
      {
        title: '3. Cookies van derden',
        content: `Onze website gebruikt cookies van de volgende diensten van derden:

📊 Google Analytics
Doel: Om siteverkeer en gebruikersgedrag te analyseren
Cookies: _ga, _gid, _gat
Duur: Tot 2 jaar
Privacy: https://policies.google.com/privacy

💰 Google AdSense
Doel: Om gepersonaliseerde advertenties te tonen
Cookies: IDE, DSID, __gads
Duur: Tot 13 maanden
Privacy: https://policies.google.com/technologies/ads

📱 Facebook Pixel
Doel: Om advertentieprestaties te meten
Cookies: _fbp, fr
Duur: Tot 3 maanden
Privacy: https://www.facebook.com/privacy/explanation

📈 Google Tag Manager
Doel: Om verschillende tags en trackers te beheren
Privacy: https://policies.google.com/privacy`,
      },
      {
        title: '4. Cookies beheren',
        content: `U kunt cookies op de volgende manieren beheren:

🔧 Browserinstellingen
De meeste browsers stellen u in staat cookies te beheren:
• Chrome: Instellingen > Privacy en beveiliging > Cookies
• Firefox: Opties > Privacy & Beveiliging
• Safari: Voorkeuren > Privacy
• Edge: Instellingen > Privacy, zoeken en services

⚙️ Cookievoorkeuren
U kunt uw voorkeuren bijwerken via de cookiemelding van onze site.

🚫 Cookies uitschakelen
U kunt cookies volledig uitschakelen, maar sommige functies van de site werken dan mogelijk niet goed.`,
      },
      {
        title: '5. Cookieduur',
        content: `Cookies kunnen voor verschillende perioden worden opgeslagen:

• Sessiecookies: Verwijderd wanneer u uw browser sluit
• Permanente cookies: Opgeslagen tot de opgegeven periode verstrijkt (tussen 1 dag - 2 jaar)

Hoe lang elke cookie wordt opgeslagen, hangt af van het doel en het type cookie.`,
      },
      {
        title: '6. Cookietoestemming',
        content: `Bij uw eerste bezoek aan onze website wordt u geïnformeerd over het gebruik van cookies. We vragen uw toestemming voor niet-essentiële cookies.

Uw toestemmingsvoorkeur wordt opgeslagen als een cookie en onthouden bij toekomstige bezoeken. U kunt uw voorkeuren op elk moment wijzigen.`,
      },
      {
        title: '7. Wettelijke basis',
        content: `Ons cookiegebruik voldoet aan de volgende regelgeving:

🇪🇺 AVG (Algemene Verordening Gegevensbescherming)
• Vereiste van expliciete toestemming
• Recht om cookies te weigeren
• Recht op gegevensoverdraagbaarheid

🇹🇷 KVKK (Turkse wet bescherming persoonsgegevens)
• Informatieplicht
• Vereiste van expliciete toestemming

🇳🇱 Nederlandse Telecommunicatiewet
• Cookiemeldingsplicht
• Vereiste van gebruikerstoestemming`,
      },
      {
        title: '8. Beleidsupdates',
        content: `Dit cookiebeleid kan van tijd tot tijd worden bijgewerkt. Bij belangrijke wijzigingen:
• Wordt een aankondiging gedaan op de website
• Kan nieuwe toestemming worden gevraagd
• Wordt de laatste bijwerkingsdatum bijgewerkt

We raden aan om ons beleid regelmatig te controleren.`,
      },
      {
        title: '9. Contact',
        content: `Voor vragen over ons cookiebeleid:

📧 E-mail: privacy@mehmetkucuk.nl
🌐 Web: https://mehmetkucuk.nl/contact
📍 Locatie: Nederland`,
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
      canonical: `https://mehmetkucuk.nl/${params.lang}/cookies`,
      languages: {
        tr: 'https://mehmetkucuk.nl/tr/cookies',
        en: 'https://mehmetkucuk.nl/en/cookies',
        nl: 'https://mehmetkucuk.nl/nl/cookies',
      },
    },
  };
}

export default function CookiesPage({params}: Props) {
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
            url: `https://mehmetkucuk.nl/${params.lang}/cookies`,
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
