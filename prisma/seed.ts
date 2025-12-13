import {PrismaClient, Language} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES: Record<string, {tr: string; en: string; nl: string}> = {
  technology: {tr: 'Teknoloji', en: 'Technology', nl: 'Technologie'},
  ai: {tr: 'Yapay Zeka', en: 'Artificial Intelligence', nl: 'Kunstmatige Intelligentie'},
  crypto: {tr: 'Kripto Para', en: 'Cryptocurrency', nl: 'Cryptocurrency'},
  programming: {tr: 'Programlama', en: 'Programming', nl: 'Programmeren'},
  security: {tr: 'Siber Güvenlik', en: 'Cybersecurity', nl: 'Cyberbeveiliging'},
  science: {tr: 'Bilim', en: 'Science', nl: 'Wetenschap'},
  gaming: {tr: 'Oyun', en: 'Gaming', nl: 'Gaming'},
  gadgets: {tr: 'Cihazlar', en: 'Gadgets', nl: 'Gadgets'},
  business: {tr: 'İş Dünyası', en: 'Business', nl: 'Zakelijk'},
  space: {tr: 'Uzay', en: 'Space', nl: 'Ruimtevaart'},
  software: {tr: 'Yazılım', en: 'Software', nl: 'Software'},
  web: {tr: 'Web Geliştirme', en: 'Web Development', nl: 'Webontwikkeling'},
  mobile: {tr: 'Mobil', en: 'Mobile', nl: 'Mobiel'},
  devops: {tr: 'DevOps', en: 'DevOps', nl: 'DevOps'},
  database: {tr: 'Veritabanı', en: 'Database', nl: 'Database'},
  cloud: {tr: 'Bulut Bilişim', en: 'Cloud Computing', nl: 'Cloud Computing'},
  startup: {tr: 'Girişimcilik', en: 'Startups', nl: 'Startups'},
  other: {tr: 'Diğer', en: 'Other', nl: 'Overig'},
};

async function seedCategories() {
  const entries = Object.entries(DEFAULT_CATEGORIES);

  for (const [slug, names] of entries) {
    const category = await prisma.category.upsert({
      where: {slug},
      create: {slug},
      update: {},
    });

    await prisma.categoryTranslation.upsert({
      where: {categoryId_lang: {categoryId: category.id, lang: Language.tr}},
      create: {categoryId: category.id, lang: Language.tr, name: names.tr},
      update: {name: names.tr},
    });
    await prisma.categoryTranslation.upsert({
      where: {categoryId_lang: {categoryId: category.id, lang: Language.en}},
      create: {categoryId: category.id, lang: Language.en, name: names.en},
      update: {name: names.en},
    });
    await prisma.categoryTranslation.upsert({
      where: {categoryId_lang: {categoryId: category.id, lang: Language.nl}},
      create: {categoryId: category.id, lang: Language.nl, name: names.nl},
      update: {name: names.nl},
    });
  }

  console.log('🏷️ Categories seeded:', entries.length);
}

async function ensureAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mehmetkucuk.nl';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: {email: adminEmail},
    update: {password: hashedPassword},
    create: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
      role: 'admin'
    }
  });

  console.log('✅ Admin user ensured:', admin.email);
  return {adminEmail, adminPassword};
}

async function seedArticle() {
  const now = new Date();

  const article = await prisma.article.upsert({
    where: {slug: 'sample-ai-briefing'},
    update: {},
    create: {
      slug: 'sample-ai-briefing',
      category: 'ai',
      tags: ['ai', 'research'],
      imageUrl: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d',
      published: true,
      publishedAt: now,
      translations: {
        create: [
          {
            lang: Language.tr,
            slug: 'yapay-zekada-haftanin-ozeti',
            title: 'Yapay zekada haftanın özeti',
            summary: 'Yeni çip tasarımları eğitim maliyetini yarıya indiriyor, regülasyon cephesinde ise Avrupa yeni kurallar yayımladı.',
            body: '<p>Yeni nesil hızlandırıcılar inferans başına enerji tüketimini %30 azaltıyor.</p><p>Aynı zamanda, Avrupa Komisyonu üretken yapay zekâ için şeffaflık yükümlülükleri getirdi.</p>',
            author: 'MK News Bot',
            seoTitle: 'Yapay zekâ gündeminde öne çıkanlar',
            metaDescription: 'Haftanın yapay zekâ haberleri: çip verimliliği ve regülasyon güncellemeleri.'
          },
          {
            lang: Language.en,
            slug: 'weekly-ai-briefing',
            title: 'Weekly AI briefing',
            summary: 'Hardware teams halve training costs while regulators push for higher transparency.',
            body: '<p>Vendors introduced accelerators that trim inference latency without sacrificing accuracy.</p><p>The EU also outlined new disclosure rules for generative systems.</p>',
            author: 'MK News Bot',
            seoTitle: 'AI briefing of the week',
            metaDescription: 'Key AI developments across hardware, regulation, and enterprise adoption.'
          }
        ]
      },
      source: {
        create: {
          originalSource: 'MK News Desk',
          sourceUrl: 'https://mehmetkucuk.nl/tr/news/sample-ai-briefing',
          sourceFingerprint: 'seed-sample-source',
          language: 'tr',
          wordCount: 420
        }
      }
    }
  });

  console.log('📰 Seeded sample article:', article.slug);
}

async function seedBotSettings() {
  // Check if settings already exist
  const existing = await prisma.botSettings.findFirst();
  
  if (existing) {
    console.log('🤖 Bot settings already exist, skipping...');
    return existing;
  }

  const settings = await prisma.botSettings.create({
    data: {
      isEnabled: true,
      highPriorityInterval: 5,
      mediumPriorityInterval: 15,
      lowPriorityInterval: 30,
      dailyArticleTarget: 50,
      maxArticlesPerHour: 10,
      minQaScore: 0.85,
      autoPublish: false,
      simHashThreshold: 3,
      crossSourceDedup: true,
      enablePaywallFilter: true,
    }
  });

  console.log('🤖 Bot settings created, enabled:', settings.isEnabled);
  return settings;
}

async function seedSiteSettings() {
  // Seed key-value site settings
  const defaultSettings = [
    { key: 'site_name', value: 'MK News', group: 'general' as const, label: 'Site Name' },
    { key: 'site_description', value: 'AI-powered news platform', group: 'general' as const, label: 'Site Description' },
    { key: 'site_url', value: 'https://mehmetkucuk.nl', group: 'general' as const, label: 'Site URL' },
    { key: 'contact_email', value: 'info@mehmetkucuk.nl', group: 'general' as const, label: 'Contact Email' },
    { key: 'enable_comments', value: 'false', type: 'boolean', group: 'general' as const, label: 'Enable Comments' },
    { key: 'enable_newsletter', value: 'false', type: 'boolean', group: 'general' as const, label: 'Enable Newsletter' },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('⚙️ Site settings seeded:', defaultSettings.length, 'settings');
}

async function main() {
  console.log('🌱 Starting database seed...');
  const creds = await ensureAdmin();
  await seedBotSettings();
  await seedSiteSettings();
  await seedCategories();
  await seedArticle();
  console.log('📧 Default admin email:', creds.adminEmail);
  console.log('🔑 Default admin password:', creds.adminPassword);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
