"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations('Navigation');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/services', label: t('services') },
    { href: '/portfolio', label: t('portfolio') },
    { href: '/blog', label: t('blog') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900 hover:text-blue-600 transition-colors">
            mehmetkucuk.nl
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium uppercase">{locale}</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                <div className="py-1">
                  {['tr', 'en', 'nl'].map((l) => (
                    <button
                      key={l}
                      onClick={() => handleLanguageChange(l)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        locale === l ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {l === 'tr' ? 'Türkçe' : l === 'en' ? 'English' : 'Nederlands'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="block text-base font-medium text-gray-900 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">{t('languageSelector')}</p>
              <div className="flex space-x-4">
                {['tr', 'en', 'nl'].map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      handleLanguageChange(l);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-sm font-medium uppercase ${
                      locale === l ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}