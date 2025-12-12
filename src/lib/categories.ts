// Category translations for multilingual support
export const CATEGORIES: Record<string, Record<string, string>> = {
  'technology': {
    'tr': 'Teknoloji',
    'en': 'Technology',
    'nl': 'Technologie',
  },
  'ai': {
    'tr': 'Yapay Zeka',
    'en': 'Artificial Intelligence',
    'nl': 'Kunstmatige Intelligentie',
  },
  'crypto': {
    'tr': 'Kripto Para',
    'en': 'Cryptocurrency',
    'nl': 'Cryptocurrency',
  },
  'programming': {
    'tr': 'Programlama',
    'en': 'Programming',
    'nl': 'Programmeren',
  },
  'security': {
    'tr': 'Siber Güvenlik',
    'en': 'Cybersecurity',
    'nl': 'Cyberbeveiliging',
  },
  'science': {
    'tr': 'Bilim',
    'en': 'Science',
    'nl': 'Wetenschap',
  },
  'gaming': {
    'tr': 'Oyun',
    'en': 'Gaming',
    'nl': 'Gaming',
  },
  'gadgets': {
    'tr': 'Cihazlar',
    'en': 'Gadgets',
    'nl': 'Gadgets',
  },
  'business': {
    'tr': 'İş Dünyası',
    'en': 'Business',
    'nl': 'Zakelijk',
  },
  'space': {
    'tr': 'Uzay',
    'en': 'Space',
    'nl': 'Ruimtevaart',
  },
  'software': {
    'tr': 'Yazılım',
    'en': 'Software',
    'nl': 'Software',
  },
  'web': {
    'tr': 'Web Geliştirme',
    'en': 'Web Development',
    'nl': 'Webontwikkeling',
  },
  'mobile': {
    'tr': 'Mobil',
    'en': 'Mobile',
    'nl': 'Mobiel',
  },
  'devops': {
    'tr': 'DevOps',
    'en': 'DevOps',
    'nl': 'DevOps',
  },
  'database': {
    'tr': 'Veritabanı',
    'en': 'Database',
    'nl': 'Database',
  },
  'cloud': {
    'tr': 'Bulut Bilişim',
    'en': 'Cloud Computing',
    'nl': 'Cloud Computing',
  },
  'startup': {
    'tr': 'Girişimcilik',
    'en': 'Startups',
    'nl': 'Startups',
  },
  'other': {
    'tr': 'Diğer',
    'en': 'Other',
    'nl': 'Overig',
  },
};

/**
 * Get translated category name
 * @param categoryId - The category ID (key in CATEGORIES)
 * @param lang - The language code (tr, en, nl)
 */
export function getCategoryName(categoryId: string, lang: string = 'tr'): string {
  return CATEGORIES[categoryId.toLowerCase()]?.[lang] || categoryId;
}

/**
 * Get all categories for a specific language
 * @param lang - The language code (tr, en, nl)
 */
export function getCategoriesForLanguage(lang: string = 'tr'): string[] {
  return Object.entries(CATEGORIES).map(([_, names]) => names[lang] || names['tr']);
}

/**
 * Get category ID from translated name
 * @param name - The translated category name
 */
export function getCategoryIdFromName(name: string): string {
  for (const [id, translations] of Object.entries(CATEGORIES)) {
    for (const translation of Object.values(translations)) {
      if (translation.toLowerCase() === name.toLowerCase()) {
        return id;
      }
    }
  }
  return name.toLowerCase();
}

/**
 * Get all category IDs
 */
export function getAllCategoryIds(): string[] {
  return Object.keys(CATEGORIES);
}

/**
 * Get all category translations as objects
 */
export function getAllCategoryTranslations(lang: string = 'tr'): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [id, translations] of Object.entries(CATEGORIES)) {
    result[id] = translations[lang] || translations['tr'];
  }
  return result;
}
