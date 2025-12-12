/**
 * Migration Script: Regenerate ALL Translation slugs
 * 
 * Problem: All translations currently have the same Turkish slug.
 * This script regenerates unique per-language slugs from each translation's title.
 * 
 * Run with: npx tsx scripts/regenerate-all-translation-slugs.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Character replacements for different languages
const charMaps: Record<string, Record<string, string>> = {
  tr: {
    ı: 'i', ğ: 'g', ü: 'u', ş: 's', ö: 'o', ç: 'c',
    İ: 'i', Ğ: 'g', Ü: 'u', Ş: 's', Ö: 'o', Ç: 'c',
  },
  nl: {
    ë: 'e', ï: 'i', ö: 'o', ü: 'u', é: 'e', è: 'e', ê: 'e',
  },
  en: {
    // English typically doesn't have special chars to replace
  },
};

/**
 * Generate SEO-friendly slug from title
 * Matches the logic in src/lib/slugify.ts
 */
function generateSlug(input: string, lang: string, maxLength: number = 60): string {
  if (!input) return '';
  
  let slug = input.toLowerCase().trim();
  
  // Apply language-specific character replacements
  const charMap = { ...charMaps.tr, ...charMaps.nl, ...(charMaps[lang] || {}) };
  for (const [char, replacement] of Object.entries(charMap)) {
    slug = slug.replace(new RegExp(char, 'g'), replacement);
  }
  
  // Remove accents and diacritics
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Replace spaces and underscores with dashes, remove non-alphanumeric
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Truncate at word boundary if too long
  if (slug.length > maxLength) {
    const cut = slug.lastIndexOf('-', maxLength);
    slug = cut > 20 ? slug.substring(0, cut) : slug.substring(0, maxLength);
  }
  
  return slug;
}

interface TranslationRecord {
  id: string;
  lang: string;
  title: string;
  slug: string | null;
  articleId: string;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Starting Translation Slug Regeneration');
  console.log('='.repeat(60));
  console.log('');

  // Get all translations grouped by article
  const translations = await prisma.translation.findMany({
    select: {
      id: true,
      lang: true,
      title: true,
      slug: true,
      articleId: true,
    },
    orderBy: [
      { articleId: 'asc' },
      { lang: 'asc' },
    ],
  });

  console.log(`Found ${translations.length} translations total`);

  // Track used slugs per language to ensure uniqueness
  const usedSlugs: Record<string, Set<string>> = {
    tr: new Set(),
    en: new Set(),
    nl: new Set(),
  };

  // Group translations by articleId to process together
  const byArticle = new Map<string, TranslationRecord[]>();
  for (const t of translations) {
    const list = byArticle.get(t.articleId) || [];
    list.push(t);
    byArticle.set(t.articleId, list);
  }

  console.log(`Processing ${byArticle.size} articles...`);
  console.log('');

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const [articleId, articleTranslations] of byArticle) {
    // Check if all translations have the same slug (the bug we're fixing)
    const slugs = articleTranslations.map(t => t.slug).filter(Boolean);
    const uniqueSlugs = new Set(slugs);
    
    // If all translations have different slugs, skip (already fixed)
    if (uniqueSlugs.size === articleTranslations.length && articleTranslations.length > 1) {
      skipped += articleTranslations.length;
      continue;
    }

    console.log(`\n[Article ${articleId}] Processing ${articleTranslations.length} translations...`);

    for (const translation of articleTranslations) {
      // Generate new slug from title
      let baseSlug = generateSlug(translation.title, translation.lang);
      
      if (!baseSlug) {
        console.log(`  ⚠ [${translation.lang}] Empty slug from title, skipping`);
        errors++;
        continue;
      }

      let finalSlug = baseSlug;
      let counter = 1;

      // Ensure uniqueness within the language
      const langSlugs = usedSlugs[translation.lang] || new Set();
      while (langSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Skip if slug hasn't changed
      if (translation.slug === finalSlug) {
        langSlugs.add(finalSlug);
        console.log(`  ✓ [${translation.lang}] Already correct: ${finalSlug}`);
        skipped++;
        continue;
      }

      try {
        await prisma.translation.update({
          where: { id: translation.id },
          data: { slug: finalSlug },
        });

        langSlugs.add(finalSlug);
        updated++;

        const oldSlug = translation.slug || '(empty)';
        console.log(`  ✓ [${translation.lang}] ${oldSlug} → ${finalSlug}`);
      } catch (error) {
        errors++;
        console.error(`  ✗ [${translation.lang}] Error updating:`, error);
      }
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Migration Complete');
  console.log('='.repeat(60));
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors:  ${errors}`);
  console.log('');

  // Verify results
  console.log('Verification - Sample slugs per language:');
  const sample = await prisma.translation.findMany({
    select: {
      lang: true,
      slug: true,
      title: true,
    },
    take: 9,
    orderBy: { createdAt: 'desc' },
  });

  for (const t of sample) {
    console.log(`  [${t.lang}] ${t.slug} ← "${t.title.substring(0, 40)}..."`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
