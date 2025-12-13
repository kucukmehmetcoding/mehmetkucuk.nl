'use client';

import {ReactNode, useEffect, useState, useMemo} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {SUPPORTED_LANGS} from '@/lib/i18n';
import {Sun, Moon, Search, Menu, X} from 'lucide-react';
import CategoryDropdown from '@/components/CategoryDropdown';

const lang_labels = {
  tr: {home: 'Anasayfa', news: 'Haberler', search: 'Ara', categories: 'Kategoriler'},
  en: {home: 'Home', news: 'News', search: 'Search', categories: 'Categories'},
  nl: {home: 'Startpagina', news: 'Nieuws', search: 'Zoeken', categories: 'Categorieën'},
};

interface BrandingData {
  logo: string | null;
  siteName: string;
}

export default function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: {lang: string};
}) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [alternateUrls, setAlternateUrls] = useState<Record<string, string> | null>(null);
  const [branding, setBranding] = useState<BrandingData>({ logo: null, siteName: 'MK News' });

  // Fetch branding data (logo, site name)
  useEffect(() => {
    fetch('/api/branding', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBranding({ logo: data.logo, siteName: data.siteName || 'MK News' });
        }
      })
      .catch(() => {
        // Keep defaults on error
      });
  }, []);

  // Check for alternate URLs from post pages (for proper language switching)
  useEffect(() => {
    const checkAlternateUrls = () => {
      const script = document.getElementById('alternate-urls');
      if (script) {
        try {
          const urls = JSON.parse(script.textContent || '{}');
          setAlternateUrls(urls);
        } catch {
          setAlternateUrls(null);
        }
      } else {
        setAlternateUrls(null);
      }
    };
    
    // Check immediately and also after a short delay for hydration
    checkAlternateUrls();
    const timeout = setTimeout(checkAlternateUrls, 100);
    return () => clearTimeout(timeout);
  }, [pathname]);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  const labels = lang_labels[params.lang as keyof typeof lang_labels] || lang_labels.en;

  return (
    <div data-lang={params.lang} className={`min-h-screen flex flex-col ${isDark ? 'dark' : ''}`}>
      {/* Header with Navigation */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href={`/${params.lang}`}
              className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {branding.logo ? (
                <Image
                  src={branding.logo}
                  alt={branding.siteName}
                  width={120}
                  height={36}
                  className="h-9 w-auto object-contain"
                  priority
                />
              ) : (
                <>
                  <span className="text-2xl">📰</span>
                  <span className="hidden sm:inline">{branding.siteName}</span>
                </>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={`/${params.lang}`}
                className={`text-sm font-medium transition-colors ${
                  pathname === `/${params.lang}` 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {labels.home}
              </Link>
              <Link
                href={`/${params.lang}/news`}
                className={`text-sm font-medium transition-colors ${
                  pathname.includes('/news')
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {labels.news}
              </Link>
              <CategoryDropdown lang={params.lang} label={labels.categories} />
              <Link
                href={`/${params.lang}/search`}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {labels.search}
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Search Icon */}
              <Link
                href={`/${params.lang}/search`}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label={labels.search}
              >
                <Search className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {/* Language Switcher */}
              <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                {SUPPORTED_LANGS.map((locale) => {
                  // Use alternate URL if available (for post pages with different slugs per language)
                  const href = alternateUrls?.[locale] || `/${locale}${pathname.replace(`/${params.lang}`, '') || ''}`;
                  return (
                    <Link
                      key={locale}
                      href={href}
                      className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                        locale === params.lang
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      aria-current={locale === params.lang ? 'page' : undefined}
                    >
                      {locale.toUpperCase()}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col gap-1 pt-4">
                <Link
                  href={`/${params.lang}`}
                  className="px-4 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {labels.home}
                </Link>
                <Link
                  href={`/${params.lang}/news`}
                  className="px-4 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {labels.news}
                </Link>
                <CategoryDropdown 
                  lang={params.lang} 
                  label={labels.categories} 
                  isMobile={true}
                  onItemClick={() => setIsMobileMenuOpen(false)}
                />
                <Link
                  href={`/${params.lang}/search`}
                  className="px-4 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {labels.search}
                </Link>
                <div className="flex gap-2 px-4 py-2 border-t border-slate-200 dark:border-slate-800 mt-2 pt-2">
                  {SUPPORTED_LANGS.map((locale) => {
                    const href = alternateUrls?.[locale] || `/${locale}${pathname.replace(`/${params.lang}`, '') || ''}`;
                    return (
                      <Link
                        key={locale}
                        href={href}
                        className={`text-xs font-semibold px-2 py-1 rounded transition-colors flex-1 text-center ${
                          locale === params.lang
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {locale.toUpperCase()}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-950">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              {branding.logo ? (
                <Image
                  src={branding.logo}
                  alt={branding.siteName}
                  width={140}
                  height={42}
                  className="h-10 w-auto object-contain mb-2"
                />
              ) : (
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{branding.siteName}</h3>
              )}
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {params.lang === 'tr' 
                  ? 'Yapay zeka destekli çok dilli haber platformu' 
                  : params.lang === 'nl' 
                  ? 'AI-gedreven meertalig nieuwsplatform' 
                  : 'Multilingual tech news platform powered by AI'}
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">
                {params.lang === 'tr' ? 'Navigasyon' : params.lang === 'nl' ? 'Navigatie' : 'Navigation'}
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={`/${params.lang}`} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">{labels.home}</Link></li>
                <li><Link href={`/${params.lang}/news`} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">{labels.news}</Link></li>
                <li><Link href={`/${params.lang}/search`} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">{labels.search}</Link></li>
              </ul>
            </div>

            {/* Languages */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">
                {params.lang === 'tr' ? 'Diller' : params.lang === 'nl' ? 'Talen' : 'Languages'}
              </h4>
              <ul className="space-y-2 text-sm">
                {SUPPORTED_LANGS.map((locale) => (
                  <li key={locale}>
                    <Link
                      href={`/${locale}${pathname.replace(`/${params.lang}`, '') || ''}`}
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      {locale === 'tr' ? 'Türkçe' : locale === 'en' ? 'English' : 'Nederlands'}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Info */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">
                {params.lang === 'tr' ? 'Bilgi' : params.lang === 'nl' ? 'Informatie' : 'Information'}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href={`/${params.lang}/about`} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    {params.lang === 'tr' ? 'Hakkımızda' : params.lang === 'nl' ? 'Over ons' : 'About Us'}
                  </Link>
                </li>
                <li>
                  <Link href={`/${params.lang}/contact`} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    {params.lang === 'tr' ? 'İletişim' : params.lang === 'nl' ? 'Contact' : 'Contact'}
                  </Link>
                </li>
                <li>
                  <Link href={`/${params.lang}/privacy`} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    {params.lang === 'tr' ? 'Gizlilik Politikası' : params.lang === 'nl' ? 'Privacybeleid' : 'Privacy Policy'}
                  </Link>
                </li>
                <li>
                  <Link href={`/${params.lang}/terms`} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    {params.lang === 'tr' ? 'Kullanım Koşulları' : params.lang === 'nl' ? 'Gebruiksvoorwaarden' : 'Terms of Use'}
                  </Link>
                </li>
                <li>
                  <Link href={`/${params.lang}/cookies`} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    {params.lang === 'tr' ? 'Çerez Politikası' : params.lang === 'nl' ? 'Cookiebeleid' : 'Cookie Policy'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            <p>
              &copy; 2025 {branding.siteName}. {' '}
              {params.lang === 'tr' ? 'Tüm hakları saklıdır.' : params.lang === 'nl' ? 'Alle rechten voorbehouden.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
