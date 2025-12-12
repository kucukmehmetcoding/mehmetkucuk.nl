'use client';

import {useState, useRef, useEffect} from 'react';
import Link from 'next/link';
import {ChevronDown} from 'lucide-react';
import {CATEGORIES} from '@/lib/categories';

interface CategoryDropdownProps {
  lang: string;
  label: string;
  isMobile?: boolean;
  onItemClick?: () => void;
}

// Category icons/emojis
const categoryIcons: Record<string, string> = {
  technology: '💻',
  ai: '🤖',
  crypto: '₿',
  programming: '👨‍💻',
  security: '🔒',
  science: '🔬',
  gaming: '🎮',
  gadgets: '📱',
  business: '💼',
  web: '🌐',
  mobile: '📲',
  devops: '⚙️',
  database: '🗄️',
  cloud: '☁️',
  startup: '🚀',
  other: '📰',
};

export default function CategoryDropdown({lang, label, isMobile = false, onItemClick}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const categories = Object.entries(CATEGORIES).map(([id, translations]) => ({
    id,
    name: translations[lang] || translations['en'],
    icon: categoryIcons[id] || '📰',
  }));

  // Main categories (most popular)
  const mainCategories = categories.filter(c => 
    ['technology', 'ai', 'crypto', 'programming', 'security', 'gaming', 'business'].includes(c.id)
  );

  // Other categories
  const otherCategories = categories.filter(c => 
    !['technology', 'ai', 'crypto', 'programming', 'security', 'gaming', 'business'].includes(c.id)
  );

  if (isMobile) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span>{label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
            {mainCategories.map((category) => (
              <Link
                key={category.id}
                href={`/${lang}/category/${category.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => {
                  setIsOpen(false);
                  onItemClick?.();
                }}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </Link>
            ))}
            {otherCategories.length > 0 && (
              <>
                <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                {otherCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/${lang}/category/${category.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                      onItemClick?.();
                    }}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </Link>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Main Categories */}
          <div className="p-2">
            <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'tr' ? 'Popüler' : lang === 'nl' ? 'Populair' : 'Popular'}
            </p>
            {mainCategories.map((category) => (
              <Link
                key={category.id}
                href={`/${lang}/category/${category.id}`}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200 dark:bg-slate-700" />

          {/* Other Categories */}
          <div className="p-2">
            <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'tr' ? 'Diğer' : lang === 'nl' ? 'Overig' : 'Other'}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {otherCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/${lang}/category/${category.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span>{category.icon}</span>
                  <span className="truncate">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* View All Link */}
          <div className="p-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
            <Link
              href={`/${lang}/news`}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {lang === 'tr' ? 'Tüm Haberler' : lang === 'nl' ? 'Alle Nieuws' : 'All News'} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
