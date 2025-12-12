'use client';

import {useState} from 'react';
import type {Metadata} from 'next';

type Props = {
  params: {lang: string};
};

const translations = {
  tr: {
    title: 'İletişim',
    description: 'MK News Intelligence ile iletişime geçin. Sorularınız, önerileriniz ve geri bildirimleriniz için bize ulaşın.',
    subtitle: 'Bizimle iletişime geçin',
    intro: 'Sorularınız, önerileriniz veya geri bildirimleriniz için aşağıdaki formu kullanabilir veya doğrudan e-posta gönderebilirsiniz.',
    form: {
      name: 'Adınız',
      namePlaceholder: 'Adınızı girin',
      email: 'E-posta',
      emailPlaceholder: 'E-posta adresinizi girin',
      subject: 'Konu',
      subjectPlaceholder: 'Mesajınızın konusu',
      message: 'Mesajınız',
      messagePlaceholder: 'Mesajınızı buraya yazın...',
      submit: 'Gönder',
      sending: 'Gönderiliyor...',
      success: 'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.',
      error: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    },
    info: {
      title: 'İletişim Bilgileri',
      email: 'E-posta',
      location: 'Konum',
      locationValue: 'Hollanda',
      response: 'Yanıt Süresi',
      responseValue: '24-48 saat içinde',
    },
    topics: {
      title: 'İletişim Konuları',
      items: [
        {icon: '📰', title: 'Haber İçerikleri', desc: 'İçerik önerileri, düzeltmeler veya geri bildirimler'},
        {icon: '🤝', title: 'İş Birlikleri', desc: 'Reklam, sponsorluk ve ortaklık fırsatları'},
        {icon: '🔧', title: 'Teknik Destek', desc: 'Site kullanımı ile ilgili sorular'},
        {icon: '📝', title: 'Genel Sorular', desc: 'Diğer tüm konular için'},
      ],
    },
  },
  en: {
    title: 'Contact',
    description: 'Contact MK News Intelligence. Reach out for questions, suggestions, and feedback.',
    subtitle: 'Get in touch with us',
    intro: 'You can use the form below for questions, suggestions, or feedback, or send an email directly.',
    form: {
      name: 'Your Name',
      namePlaceholder: 'Enter your name',
      email: 'Email',
      emailPlaceholder: 'Enter your email address',
      subject: 'Subject',
      subjectPlaceholder: 'Subject of your message',
      message: 'Your Message',
      messagePlaceholder: 'Write your message here...',
      submit: 'Send',
      sending: 'Sending...',
      success: 'Your message has been sent successfully! We will get back to you as soon as possible.',
      error: 'An error occurred. Please try again.',
    },
    info: {
      title: 'Contact Information',
      email: 'Email',
      location: 'Location',
      locationValue: 'Netherlands',
      response: 'Response Time',
      responseValue: 'Within 24-48 hours',
    },
    topics: {
      title: 'Contact Topics',
      items: [
        {icon: '📰', title: 'News Content', desc: 'Content suggestions, corrections, or feedback'},
        {icon: '🤝', title: 'Partnerships', desc: 'Advertising, sponsorship, and partnership opportunities'},
        {icon: '🔧', title: 'Technical Support', desc: 'Questions about site usage'},
        {icon: '📝', title: 'General Questions', desc: 'For all other topics'},
      ],
    },
  },
  nl: {
    title: 'Contact',
    description: 'Neem contact op met MK News Intelligence. Neem contact op voor vragen, suggesties en feedback.',
    subtitle: 'Neem contact met ons op',
    intro: 'U kunt het onderstaande formulier gebruiken voor vragen, suggesties of feedback, of direct een e-mail sturen.',
    form: {
      name: 'Uw naam',
      namePlaceholder: 'Voer uw naam in',
      email: 'E-mail',
      emailPlaceholder: 'Voer uw e-mailadres in',
      subject: 'Onderwerp',
      subjectPlaceholder: 'Onderwerp van uw bericht',
      message: 'Uw bericht',
      messagePlaceholder: 'Schrijf uw bericht hier...',
      submit: 'Versturen',
      sending: 'Versturen...',
      success: 'Uw bericht is succesvol verzonden! We nemen zo snel mogelijk contact met u op.',
      error: 'Er is een fout opgetreden. Probeer het opnieuw.',
    },
    info: {
      title: 'Contactinformatie',
      email: 'E-mail',
      location: 'Locatie',
      locationValue: 'Nederland',
      response: 'Reactietijd',
      responseValue: 'Binnen 24-48 uur',
    },
    topics: {
      title: 'Contactonderwerpen',
      items: [
        {icon: '📰', title: 'Nieuwsinhoud', desc: 'Inhoudssuggesties, correcties of feedback'},
        {icon: '🤝', title: 'Partnerschappen', desc: 'Advertentie-, sponsoring- en partnerschapsmogelijkheden'},
        {icon: '🔧', title: 'Technische ondersteuning', desc: 'Vragen over het gebruik van de site'},
        {icon: '📝', title: 'Algemene vragen', desc: 'Voor alle andere onderwerpen'},
      ],
    },
  },
};

export default function ContactPage({params}: Props) {
  const lang = params.lang as keyof typeof translations;
  const t = translations[lang] || translations.en;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({name: '', email: '', subject: '', message: ''});
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">{t.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t.intro}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">{t.form.name}</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder={t.form.namePlaceholder}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.form.email}</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder={t.form.emailPlaceholder}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.form.subject}</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder={t.form.subjectPlaceholder}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.form.message}</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder={t.form.messagePlaceholder}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? t.form.sending : t.form.submit}
            </button>

            {status === 'success' && (
              <p className="text-green-600 dark:text-green-400 text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                ✅ {t.form.success}
              </p>
            )}

            {status === 'error' && (
              <p className="text-red-600 dark:text-red-400 text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                ❌ {t.form.error}
              </p>
            )}
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          {/* Contact Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold mb-6">{t.info.title}</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="font-medium">{t.info.email}</p>
                  <a href="mailto:info@mehmetkucuk.nl" className="text-blue-600 hover:underline">
                    info@mehmetkucuk.nl
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="font-medium">{t.info.location}</p>
                  <p className="text-gray-600 dark:text-gray-400">{t.info.locationValue}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="font-medium">{t.info.response}</p>
                  <p className="text-gray-600 dark:text-gray-400">{t.info.responseValue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Topics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold mb-6">{t.topics.title}</h2>

            <div className="space-y-4">
              {t.topics.items.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: t.title,
            description: t.description,
            url: `https://mehmetkucuk.nl/${params.lang}/contact`,
            inLanguage: params.lang,
            mainEntity: {
              '@type': 'Organization',
              name: 'MK News Intelligence',
              email: 'info@mehmetkucuk.nl',
              url: 'https://mehmetkucuk.nl',
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
