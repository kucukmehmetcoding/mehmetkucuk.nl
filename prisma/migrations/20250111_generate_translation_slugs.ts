import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

// Locale map for proper slug generation
const localeMap: Record<string, string> = {
  tr: 'tr',
  en: 'en',
  nl: 'nl',
};

// Simple slug generator (matching src/lib/slugify.ts logic)
function generateSlug(input: string, lang: string, maxLength: number = 60): string {
  // Character replacements for Turkish
  const charMap: Record<string, string> = {
    ı: 'i',
    ğ: 'g',
    ü: 'u',
    ş: 's',
    ö: 'o',
    ç: 'c',
    İ: 'i',
    Ğ: 'g',
    Ü: 'u',
    Ş: 's',
    Ö: 'o',
    Ç: 'c',
  };

  let slug = input.toLowerCase();
  
  // Replace Turkish characters
  for (const [char, replacement] of Object.entries(charMap)) {
    slug = slug.replace(new RegExp(char, 'g'), replacement);
  }
  
  // Replace spaces with dashes, remove non-alphanumeric
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Truncate at word boundary
  if (slug.length > maxLength) {
    const cut = slug.lastIndexOf('-', maxLength);
    slug = cut > 0 ? slug.substring(0, cut) : slug.substring(0, maxLength);
  }
  
  return slug;
}

async function main() {
  console.log('Starting translation slug migration...');

  // Get all translations - we'll update ones with empty or null-ish slugs
  const translations = await prisma.translation.findMany({
    select: {
      id: true,
      lang: true,
      title: true,
      slug: true,
    }
  });

  // Filter to only those needing update (empty slugs)
  const needsUpdate = translations.filter(t => !t.slug || t.slug === '');
  
  console.log(`Found ${needsUpdate.length} translations to update (of ${translations.length} total)`);

  if (needsUpdate.length === 0) {
    console.log('All translations already have slugs. Nothing to do.');
    return;
  }

  // Track used slugs per language to avoid duplicates
  const usedSlugs: Record<string, Set<string>> = {
    tr: new Set(),
    en: new Set(),
    nl: new Set(),
  };

  // Pre-load existing slugs
  translations.forEach((t) => {
    if (t.slug && usedSlugs[t.lang]) {
      usedSlugs[t.lang].add(t.slug);
    }
  });

  let updated = 0;
  let errors = 0;

  for (const translation of needsUpdate) {
    let baseSlug = generateSlug(translation.title, translation.lang);
    let finalSlug = baseSlug;
    let counter = 1;

    // Ensure uniqueness
    while (usedSlugs[translation.lang]?.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    try {
      await prisma.translation.update({
        where: {id: translation.id},
        data: {slug: finalSlug},
      });

      usedSlugs[translation.lang]?.add(finalSlug);
      updated++;
      console.log(`✓ Updated [${translation.lang}]: "${translation.title.slice(0, 40)}..." → ${finalSlug}`);
    } catch (error) {
      errors++;
      console.error(`✗ Error updating [${translation.lang}]: "${translation.title.slice(0, 40)}..."`, error);
    }
  }

  console.log(`\nMigration complete: ${updated} updated, ${errors} errors`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
