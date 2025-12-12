import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default categories with translations
const defaultCategories = [
  {
    slug: 'technology',
    translations: {
      tr: 'Teknoloji',
      en: 'Technology',
      nl: 'Technologie',
    },
  },
  {
    slug: 'ai',
    translations: {
      tr: 'Yapay Zeka',
      en: 'Artificial Intelligence',
      nl: 'Kunstmatige Intelligentie',
    },
  },
  {
    slug: 'crypto',
    translations: {
      tr: 'Kripto Para',
      en: 'Cryptocurrency',
      nl: 'Cryptocurrency',
    },
  },
  {
    slug: 'programming',
    translations: {
      tr: 'Programlama',
      en: 'Programming',
      nl: 'Programmeren',
    },
  },
  {
    slug: 'security',
    translations: {
      tr: 'Siber Güvenlik',
      en: 'Cybersecurity',
      nl: 'Cyberbeveiliging',
    },
  },
  {
    slug: 'science',
    translations: {
      tr: 'Bilim',
      en: 'Science',
      nl: 'Wetenschap',
    },
  },
  {
    slug: 'gaming',
    translations: {
      tr: 'Oyun',
      en: 'Gaming',
      nl: 'Gaming',
    },
  },
  {
    slug: 'gadgets',
    translations: {
      tr: 'Cihazlar',
      en: 'Gadgets',
      nl: 'Gadgets',
    },
  },
  {
    slug: 'business',
    translations: {
      tr: 'İş Dünyası',
      en: 'Business',
      nl: 'Zakelijk',
    },
  },
  {
    slug: 'space',
    translations: {
      tr: 'Uzay',
      en: 'Space',
      nl: 'Ruimtevaart',
    },
  },
  {
    slug: 'mobile',
    translations: {
      tr: 'Mobil',
      en: 'Mobile',
      nl: 'Mobiel',
    },
  },
  {
    slug: 'software',
    translations: {
      tr: 'Yazılım',
      en: 'Software',
      nl: 'Software',
    },
  },
];

async function main() {
  console.log('🏷️ Seeding categories...');
  
  let created = 0;
  let skipped = 0;
  
  for (const cat of defaultCategories) {
    try {
      // Check if category exists
      const existing = await prisma.category.findUnique({
        where: { slug: cat.slug },
      });
      
      if (existing) {
        console.log(`⏭️ Skipped: ${cat.slug} (already exists)`);
        skipped++;
        continue;
      }
      
      // Create category with translations
      await prisma.category.create({
        data: {
          slug: cat.slug,
          translations: {
            create: [
              { lang: 'tr', name: cat.translations.tr },
              { lang: 'en', name: cat.translations.en },
              { lang: 'nl', name: cat.translations.nl },
            ],
          },
        },
      });
      
      console.log(`✅ Created: ${cat.slug}`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating ${cat.slug}:`, error);
    }
  }
  
  console.log(`\n📊 Summary: ${created} created, ${skipped} skipped`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
