"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Github, Linkedin, Twitter, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('Footer');
  const tNav = useTranslations('Navigation');

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-gray-900 mb-4 block">
              mehmetkucuk.nl
            </Link>
            <p className="text-gray-600 leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {tNav('home')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {tNav('services')}
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {tNav('portfolio')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {tNav('about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {tNav('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">{t('contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-3 text-blue-500" />
                <span>info@mehmetkucuk.nl</span>
              </li>
              <li className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                <span>Rotterdam, NL</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">{t('social')}</h3>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-700 hover:border-blue-200 transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-400 hover:border-blue-200 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} mehmetkucuk.nl. {t('rights')}</p>
        </div>
      </div>
    </footer>
  );
}
