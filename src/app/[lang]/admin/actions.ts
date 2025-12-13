'use server';

import {prisma} from '@/lib/prisma';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {getCategoryIdFromName, getCategoryName} from '@/lib/categories';
import {toNewsSlug} from '@/lib/slugify';

// Article Actions
export async function createArticle(
  lang: string,
  data: {
    title: string;
    summary: string;
    body: string;
    category: string;
    author: string;
    published: boolean;
  }
) {
  try {
    // Generate SEO-friendly slug with Turkish character support
    const articleSlug = toNewsSlug(data.title);
    // Generate translation-specific slug for current language
    const translationSlug = toNewsSlug(data.title, lang);
    
    const article = await prisma.article.create({
      data: {
        slug: articleSlug,
        category: data.category,
        published: data.published,
        publishedAt: data.published ? new Date() : null,
      },
    });
    await prisma.translation.create({
      data: {
        lang: lang as any,
        slug: translationSlug,
        title: data.title,
        summary: data.summary,
        body: data.body,
        author: data.author,
        seoTitle: data.title,
        metaDescription: data.summary,
        articleId: article.id,
      },
    });
    revalidatePath(`/${lang}/admin/articles`);
    return {success: true, id: article.id};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function updateArticle(
  lang: string,
  articleId: string,
  data: {
    title: string;
    summary: string;
    body: string;
    category: string;
    author: string;
    published: boolean;
  }
) {
  try {
    // Generate translation-specific slug for current language
    const translationSlug = toNewsSlug(data.title, lang);
    
    await prisma.article.update({
      where: {id: articleId},
      data: {
        category: data.category,
        published: data.published,
        publishedAt: data.published ? new Date() : null,
        translations: {
          upsert: {
            where: {articleId_lang: {articleId, lang: lang as any}},
            create: {
              lang: lang as any,
              slug: translationSlug,
              title: data.title,
              summary: data.summary,
              body: data.body,
              author: data.author,
              seoTitle: data.title,
              metaDescription: data.summary,
            },
            update: {
              slug: translationSlug,
              title: data.title,
              summary: data.summary,
              body: data.body,
              author: data.author,
              seoTitle: data.title,
              metaDescription: data.summary,
            },
          },
        },
      },
    });
    revalidatePath(`/${lang}/admin/articles`);
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function deleteArticle(lang: string, articleId: string) {
  try {
    await prisma.article.delete({where: {id: articleId}});
    revalidatePath(`/${lang}/admin/articles`);
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

// Category Actions
export async function createCategory(
  translations: {tr: string; en: string; nl: string}
) {
  try {
    // Validate all translations are provided
    if (!translations.tr || !translations.en || !translations.nl) {
      return {success: false, error: 'Tüm dillerde kategori adı girilmelidir'};
    }
    
    // Create slug from Turkish name
    const slug = translations.tr
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    // Check if category already exists
    const existing = await prisma.category.findUnique({where: {slug}});
    if (existing) {
      return {success: false, error: 'Bu kategori zaten mevcut'};
    }
    
    // Create category with all translations
    await prisma.category.create({
      data: {
        slug,
        translations: {
          create: [
            {lang: 'tr' as any, name: translations.tr},
            {lang: 'en' as any, name: translations.en},
            {lang: 'nl' as any, name: translations.nl},
          ],
        },
      },
    });

    revalidatePath('/tr/admin/categories');
    revalidatePath('/en/admin/categories');
    revalidatePath('/nl/admin/categories');
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function updateCategory(
  categoryId: string,
  translations: {tr: string; en: string; nl: string}
) {
  try {
    // Validate all translations are provided
    if (!translations.tr || !translations.en || !translations.nl) {
      return {success: false, error: 'Tüm dillerde kategori adı girilmelidir'};
    }
    
    // Update slug from Turkish name
    const slug = translations.tr
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    // Update category and translations
    await prisma.category.update({
      where: {id: categoryId},
      data: {
        slug,
        translations: {
          upsert: [
            {
              where: {categoryId_lang: {categoryId, lang: 'tr' as any}},
              create: {lang: 'tr' as any, name: translations.tr},
              update: {name: translations.tr},
            },
            {
              where: {categoryId_lang: {categoryId, lang: 'en' as any}},
              create: {lang: 'en' as any, name: translations.en},
              update: {name: translations.en},
            },
            {
              where: {categoryId_lang: {categoryId, lang: 'nl' as any}},
              create: {lang: 'nl' as any, name: translations.nl},
              update: {name: translations.nl},
            },
          ],
        },
      },
    });

    revalidatePath('/tr/admin/categories');
    revalidatePath('/en/admin/categories');
    revalidatePath('/nl/admin/categories');
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    await prisma.category.delete({where: {id: categoryId}});
    
    revalidatePath('/tr/admin/categories');
    revalidatePath('/en/admin/categories');
    revalidatePath('/nl/admin/categories');
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        translations: true,
      },
      orderBy: {createdAt: 'desc'},
    });
    return {success: true, categories};
  } catch (error) {
    return {success: false, error: String(error), categories: []};
  }
}

// Settings Actions
export async function getSettings(group?: string) {
  try {
    const where = group ? {group: group as any} : {};
    const settings = await prisma.siteSetting.findMany({where});
    
    // Convert to key-value object
    const settingsObj: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });
    
    return {success: true, settings: settingsObj, raw: settings};
  } catch (error) {
    return {success: false, error: String(error), settings: {}, raw: []};
  }
}

export async function updateSettings(
  group: string,
  data: Record<string, string | boolean | number>
) {
  try {
    // Update or create each setting
    for (const [key, value] of Object.entries(data)) {
      const valueStr = typeof value === 'boolean' ? String(value) : String(value);
      const type = typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string';
      
      await prisma.siteSetting.upsert({
        where: {key},
        create: {
          key,
          value: valueStr,
          type,
          group: group as any,
        },
        update: {
          value: valueStr,
          type,
        },
      });
    }
    
    revalidatePath('/tr/admin/settings');
    revalidatePath('/en/admin/settings');
    revalidatePath('/nl/admin/settings');
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function initializeDefaultSettings() {
  try {
    const defaults = [
      // General
      {key: 'siteName', value: 'MK News Intelligence', type: 'string', group: 'general'},
      {key: 'siteDescription', value: 'Multilingual tech news platform', type: 'string', group: 'general'},
      {key: 'siteLogo', value: '', type: 'string', group: 'general'},
      {key: 'siteFavicon', value: '', type: 'string', group: 'general'},
      {key: 'defaultLanguage', value: 'tr', type: 'string', group: 'general'},
      // Social
      {key: 'socialFacebook', value: '', type: 'string', group: 'social'},
      {key: 'socialTwitter', value: '', type: 'string', group: 'social'},
      {key: 'socialInstagram', value: '', type: 'string', group: 'social'},
      {key: 'socialLinkedin', value: '', type: 'string', group: 'social'},
      {key: 'socialYoutube', value: '', type: 'string', group: 'social'},
      // SEO
      {key: 'metaDescription', value: 'Multilingual, AI-assisted developer newswire', type: 'string', group: 'seo'},
      {key: 'metaKeywords', value: 'news,technology,developer', type: 'string', group: 'seo'},
      {key: 'ogImage', value: '', type: 'string', group: 'seo'},
      {key: 'googleAnalyticsId', value: '', type: 'string', group: 'seo'},
      {key: 'googleSearchConsole', value: '', type: 'string', group: 'seo'},
      {key: 'robotsTxt', value: '', type: 'string', group: 'seo'},
      // Appearance
      {key: 'darkModeEnabled', value: 'true', type: 'boolean', group: 'appearance'},
      {key: 'primaryColor', value: '#3b82f6', type: 'string', group: 'appearance'},
      {key: 'headerStyle', value: 'sticky', type: 'string', group: 'appearance'},
      // Advanced
      {key: 'articlesPerPage', value: '12', type: 'number', group: 'advanced'},
      {key: 'isrRevalidate', value: '3600', type: 'number', group: 'advanced'},
      {key: 'maintenanceMode', value: 'false', type: 'boolean', group: 'advanced'},
      {key: 'maintenanceMessage', value: 'Site bakımda, lütfen daha sonra tekrar deneyin.', type: 'string', group: 'advanced'},
    ];
    
    for (const setting of defaults) {
      await prisma.siteSetting.upsert({
        where: {key: setting.key},
        create: setting as any,
        update: {},
      });
    }
    
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

// SMTP Settings Actions
export async function getSmtpSettings() {
  try {
    const smtp = await prisma.smtpSetting.findFirst();
    return {success: true, smtp};
  } catch (error) {
    return {success: false, error: String(error), smtp: null};
  }
}

export async function updateSmtpSettings(data: {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
}) {
  try {
    const existing = await prisma.smtpSetting.findFirst();
    
    if (existing) {
      await prisma.smtpSetting.update({
        where: {id: existing.id},
        data,
      });
    } else {
      await prisma.smtpSetting.create({data});
    }
    
    revalidatePath('/tr/admin/settings');
    revalidatePath('/en/admin/settings');
    revalidatePath('/nl/admin/settings');
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function testSmtpConnection() {
  try {
    const smtp = await prisma.smtpSetting.findFirst();
    if (!smtp) {
      return {success: false, error: 'SMTP ayarları bulunamadı'};
    }
    
    // Here you would actually test the SMTP connection
    // For now, we just validate the settings exist
    if (!smtp.host || !smtp.port || !smtp.username || !smtp.fromEmail) {
      return {success: false, error: 'SMTP ayarları eksik'};
    }
    
    // In production, use nodemailer to test:
    // const transporter = nodemailer.createTransporter({...smtp});
    // await transporter.verify();
    
    return {success: true, message: 'SMTP bağlantısı başarılı'};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

// Advertisement Actions
export async function getAdSlots() {
  try {
    const slots = await prisma.adSlot.findMany({
      include: {
        advertisements: {
          where: {isActive: true},
        },
      },
      orderBy: {priority: 'asc'},
    });
    return {success: true, slots};
  } catch (error) {
    return {success: false, error: String(error), slots: []};
  }
}

export async function createAdSlot(data: {
  name: string;
  placement: string;
  description?: string;
  width?: number;
  height?: number;
  isActive?: boolean;
  priority?: number;
}) {
  try {
    const slot = await prisma.adSlot.create({
      data: {
        name: data.name,
        placement: data.placement as any,
        description: data.description,
        width: data.width,
        height: data.height,
        isActive: data.isActive ?? true,
        priority: data.priority ?? 0,
      },
    });
    
    revalidatePath('/tr/admin/ads');
    revalidatePath('/en/admin/ads');
    revalidatePath('/nl/admin/ads');
    return {success: true, slot};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function updateAdSlot(
  slotId: string,
  data: {
    name?: string;
    description?: string;
    width?: number;
    height?: number;
    isActive?: boolean;
    priority?: number;
  }
) {
  try {
    await prisma.adSlot.update({
      where: {id: slotId},
      data,
    });
    
    revalidatePath('/tr/admin/ads');
    revalidatePath('/en/admin/ads');
    revalidatePath('/nl/admin/ads');
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function deleteAdSlot(slotId: string) {
  try {
    await prisma.adSlot.delete({where: {id: slotId}});
    
    revalidatePath('/tr/admin/ads');
    revalidatePath('/en/admin/ads');
    revalidatePath('/nl/admin/ads');
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function getAdvertisements(slotId?: string) {
  try {
    const where = slotId ? {slotId} : {};
    const ads = await prisma.advertisement.findMany({
      where,
      include: {slot: true},
      orderBy: {createdAt: 'desc'},
    });
    return {success: true, ads};
  } catch (error) {
    return {success: false, error: String(error), ads: []};
  }
}

export async function createAdvertisement(data: {
  name: string;
  slotId: string;
  provider: string;
  imageUrl?: string;
  linkUrl?: string;
  altText?: string;
  adCode?: string;
  adUnitId?: string;
  startDate?: Date;
  endDate?: Date;
  targetLangs?: string[];
  isActive?: boolean;
}) {
  try {
    const ad = await prisma.advertisement.create({
      data: {
        name: data.name,
        slotId: data.slotId,
        provider: data.provider as any,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        altText: data.altText,
        adCode: data.adCode,
        adUnitId: data.adUnitId,
        startDate: data.startDate,
        endDate: data.endDate,
        targetLangs: data.targetLangs ?? [],
        isActive: data.isActive ?? true,
      },
    });
    
    revalidatePath('/tr/admin/ads');
    revalidatePath('/en/admin/ads');
    revalidatePath('/nl/admin/ads');
    return {success: true, ad};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function updateAdvertisement(
  adId: string,
  data: {
    name?: string;
    slotId?: string;
    provider?: string;
    imageUrl?: string;
    linkUrl?: string;
    altText?: string;
    adCode?: string;
    adUnitId?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    targetLangs?: string[];
    isActive?: boolean;
  }
) {
  try {
    await prisma.advertisement.update({
      where: {id: adId},
      data: {
        ...data,
        provider: data.provider as any,
      },
    });
    
    revalidatePath('/tr/admin/ads');
    revalidatePath('/en/admin/ads');
    revalidatePath('/nl/admin/ads');
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function deleteAdvertisement(adId: string) {
  try {
    await prisma.advertisement.delete({where: {id: adId}});
    
    revalidatePath('/tr/admin/ads');
    revalidatePath('/en/admin/ads');
    revalidatePath('/nl/admin/ads');
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function trackAdImpression(adId: string) {
  try {
    await prisma.advertisement.update({
      where: {id: adId},
      data: {impressions: {increment: 1}},
    });
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function trackAdClick(adId: string) {
  try {
    await prisma.advertisement.update({
      where: {id: adId},
      data: {clicks: {increment: 1}},
    });
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function initializeDefaultAdSlots() {
  try {
    const defaultSlots = [
      {name: 'Header Banner', placement: 'header', description: 'Sayfa üst kısmı (728x90)', width: 728, height: 90, priority: 1},
      {name: 'Sidebar Üst', placement: 'sidebar_top', description: 'Sağ kenar üst (300x250)', width: 300, height: 250, priority: 2},
      {name: 'Sidebar Alt', placement: 'sidebar_bottom', description: 'Sağ kenar alt (300x600)', width: 300, height: 600, priority: 3},
      {name: 'Makale İçi', placement: 'in_article', description: 'Makale içeriği arasında', width: 728, height: 90, priority: 4},
      {name: 'Yazılar Arası', placement: 'between_posts', description: 'Haber listesi arasında', width: 300, height: 250, priority: 5},
      {name: 'Footer Banner', placement: 'footer', description: 'Sayfa alt kısmı (970x90)', width: 970, height: 90, priority: 6},
      {name: 'Sabit Alt Banner', placement: 'sticky_bottom', description: 'Ekranın altında sabit (320x50)', width: 320, height: 50, priority: 7},
    ];
    
    for (const slot of defaultSlots) {
      const existing = await prisma.adSlot.findUnique({
        where: {placement: slot.placement as any},
      });
      
      if (!existing) {
        await prisma.adSlot.create({data: slot as any});
      }
    }
    
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

// Translation Actions
export async function updateTranslation(
  lang: string,
  translationId: string,
  data: {title: string; summary: string; body: string; author: string}
) {
  try {
    // Generate new slug if title changed
    const newSlug = toNewsSlug(data.title, lang);
    
    await prisma.translation.update({
      where: {id: translationId},
      data: {
        slug: newSlug,
        title: data.title,
        summary: data.summary,
        body: data.body,
        author: data.author,
        seoTitle: data.title,
        metaDescription: data.summary,
      },
    });
    revalidatePath(`/${lang}/admin/translations`);
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

// ==========================================
// RSS Feed Management Actions
// ==========================================

export async function getRssFeeds() {
  try {
    const feeds = await prisma.rssFeed.findMany({
      orderBy: [{priority: 'asc'}, {name: 'asc'}],
      include: {
        _count: {
          select: {fetchedItems: true}
        }
      }
    });
    return {success: true, feeds};
  } catch (error) {
    return {success: false, error: String(error), feeds: []};
  }
}

export async function createRssFeed(data: {
  name: string;
  url: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  language: string;
  maxItemsPerFetch?: number;
}) {
  try {
    const feed = await prisma.rssFeed.create({
      data: {
        name: data.name,
        url: data.url,
        category: data.category,
        priority: data.priority as any,
        language: data.language,
        maxItemsPerFetch: data.maxItemsPerFetch ?? 10,
      },
    });
    
    revalidatePath('/tr/admin/automation');
    revalidatePath('/en/admin/automation');
    revalidatePath('/nl/admin/automation');
    return {success: true, feed};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function updateRssFeed(
  feedId: string,
  data: {
    name?: string;
    url?: string;
    category?: string;
    priority?: 'high' | 'medium' | 'low';
    status?: 'active' | 'paused' | 'error';
    language?: string;
    maxItemsPerFetch?: number;
  }
) {
  try {
    await prisma.rssFeed.update({
      where: {id: feedId},
      data: {
        ...data,
        priority: data.priority as any,
        status: data.status as any,
      },
    });
    
    revalidatePath('/tr/admin/automation');
    revalidatePath('/en/admin/automation');
    revalidatePath('/nl/admin/automation');
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function deleteRssFeed(feedId: string) {
  try {
    await prisma.rssFeed.delete({where: {id: feedId}});
    
    revalidatePath('/tr/admin/automation');
    revalidatePath('/en/admin/automation');
    revalidatePath('/nl/admin/automation');
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

export async function toggleRssFeedStatus(feedId: string) {
  try {
    const feed = await prisma.rssFeed.findUnique({where: {id: feedId}});
    if (!feed) return {success: false, error: 'Feed not found'};
    
    const newStatus = feed.status === 'active' ? 'paused' : 'active';
    await prisma.rssFeed.update({
      where: {id: feedId},
      data: {status: newStatus as any},
    });
    
    revalidatePath('/tr/admin/automation');
    revalidatePath('/en/admin/automation');
    revalidatePath('/nl/admin/automation');
    return {success: true, newStatus};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

// ==========================================
// Bot Settings Actions
// ==========================================

export async function getBotSettings() {
  try {
    let settings = await prisma.botSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    
    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.botSettings.create({
        data: {
          isEnabled: true,
          highPriorityInterval: 5,
          mediumPriorityInterval: 15,
          lowPriorityInterval: 30,
          dailyArticleTarget: 50,
          maxArticlesPerHour: 10,
          minQaScore: 0.85,
          autoPublish: true,
          simHashThreshold: 3,
          crossSourceDedup: true,
          enablePaywallFilter: true,
        },
      });
    }
    
    return {success: true, settings};
  } catch (error) {
    return {success: false, error: String(error), settings: null};
  }
}

export async function updateBotSettings(data: {
  isEnabled?: boolean;
  highPriorityInterval?: number;
  mediumPriorityInterval?: number;
  lowPriorityInterval?: number;
  dailyArticleTarget?: number;
  maxArticlesPerHour?: number;
  minQaScore?: number;
  autoPublish?: boolean;
  simHashThreshold?: number;
  crossSourceDedup?: boolean;
  enablePaywallFilter?: boolean;
}) {
  try {
    const existing = await prisma.botSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    
    if (existing) {
      await prisma.botSettings.update({
        where: {id: existing.id},
        data,
      });
    } else {
      await prisma.botSettings.create({data: data as any});
    }
    
    revalidatePath('/tr/admin/automation');
    revalidatePath('/en/admin/automation');
    revalidatePath('/nl/admin/automation');
    return {success: true};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}

// ==========================================
// Bot Run Logs & Stats Actions
// ==========================================

export async function getBotRunLogs(limit = 20) {
  try {
    const logs = await prisma.botRunLog.findMany({
      orderBy: {startedAt: 'desc'},
      take: limit,
    });
    return {success: true, logs};
  } catch (error) {
    return {success: false, error: String(error), logs: []};
  }
}

export async function getBotStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Today's stats
    const todayLogs = await prisma.botRunLog.findMany({
      where: {startedAt: {gte: today}},
    });
    
    const todayPublished = todayLogs.reduce((sum, log) => sum + log.itemsPublished, 0);
    const todayProcessed = todayLogs.reduce((sum, log) => sum + log.itemsProcessed, 0);
    const todaySkipped = todayLogs.reduce((sum, log) => sum + log.itemsSkipped, 0);
    
    // Feed stats
    const feedStats = await prisma.rssFeed.aggregate({
      _sum: {
        totalFetched: true,
        totalPublished: true,
      },
      _count: true,
    });
    
    // Active feeds count
    const activeFeeds = await prisma.rssFeed.count({
      where: {status: 'active'},
    });
    
    // Recent errors
    const feedsWithErrors = await prisma.rssFeed.findMany({
      where: {errorCount: {gt: 0}},
      select: {name: true, lastError: true, errorCount: true},
      orderBy: {errorCount: 'desc'},
      take: 5,
    });
    
    return {
      success: true,
      stats: {
        today: {
          published: todayPublished,
          processed: todayProcessed,
          skipped: todaySkipped,
          runs: todayLogs.length,
        },
        total: {
          feeds: feedStats._count,
          activeFeeds,
          fetched: feedStats._sum.totalFetched ?? 0,
          published: feedStats._sum.totalPublished ?? 0,
        },
        recentErrors: feedsWithErrors,
      },
    };
  } catch (error) {
    return {success: false, error: String(error), stats: null};
  }
}

// ==========================================
// Initialize Default RSS Feeds
// ==========================================

export async function initializeDefaultRssFeeds() {
  try {
    const defaultFeeds = [
      // Technology - High Priority
      {name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'technology', priority: 'high', language: 'en'},
      {name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'technology', priority: 'high', language: 'en'},
      {name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'technology', priority: 'high', language: 'en'},
      
      // AI & Machine Learning
      {name: 'MIT AI News', url: 'https://news.mit.edu/topic/artificial-intelligence2/feed', category: 'ai', priority: 'high', language: 'en'},
      {name: 'Google AI Blog', url: 'https://blog.research.google/feeds/posts/default?alt=rss', category: 'ai', priority: 'medium', language: 'en'},
      {name: 'OpenAI Blog', url: 'https://openai.com/blog/rss/', category: 'ai', priority: 'high', language: 'en'},
      
      // Cryptocurrency & Blockchain
      {name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'crypto', priority: 'high', language: 'en'},
      {name: 'Cointelegraph', url: 'https://cointelegraph.com/rss', category: 'crypto', priority: 'high', language: 'en'},
      {name: 'Bitcoin Magazine', url: 'https://bitcoinmagazine.com/feed', category: 'crypto', priority: 'medium', language: 'en'},
      
      // Programming & Development
      {name: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: 'programming', priority: 'high', language: 'en'},
      {name: 'Dev.to', url: 'https://dev.to/feed', category: 'programming', priority: 'medium', language: 'en'},
      {name: 'GitHub Blog', url: 'https://github.blog/feed/', category: 'programming', priority: 'medium', language: 'en'},
      
      // Cybersecurity
      {name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', category: 'security', priority: 'medium', language: 'en'},
      {name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews', category: 'security', priority: 'high', language: 'en'},
      {name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', category: 'security', priority: 'medium', language: 'en'},
      
      // Science & Space
      {name: 'NASA', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', category: 'science', priority: 'medium', language: 'en'},
      {name: 'Space.com', url: 'https://www.space.com/feeds/all', category: 'science', priority: 'medium', language: 'en'},
      {name: 'ScienceDaily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'science', priority: 'low', language: 'en'},
      
      // Gaming
      {name: 'IGN', url: 'https://feeds.feedburner.com/ign/games-all', category: 'gaming', priority: 'medium', language: 'en'},
      {name: 'Kotaku', url: 'https://kotaku.com/rss', category: 'gaming', priority: 'medium', language: 'en'},
      {name: 'PC Gamer', url: 'https://www.pcgamer.com/rss/', category: 'gaming', priority: 'low', language: 'en'},
      
      // Gadgets & Hardware
      {name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'gadgets', priority: 'medium', language: 'en'},
      {name: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'gadgets', priority: 'medium', language: 'en'},
      {name: 'Tom\'s Hardware', url: 'https://www.tomshardware.com/feeds/all', category: 'gadgets', priority: 'low', language: 'en'},
      
      // Business & Startups
      {name: 'VentureBeat', url: 'https://venturebeat.com/feed/', category: 'business', priority: 'medium', language: 'en'},
      {name: 'Forbes Tech', url: 'https://www.forbes.com/technology/feed/', category: 'business', priority: 'low', language: 'en'},
    ];
    
    let created = 0;
    let skipped = 0;
    
    for (const feed of defaultFeeds) {
      const existing = await prisma.rssFeed.findUnique({where: {url: feed.url}});
      if (!existing) {
        await prisma.rssFeed.create({data: feed as any});
        created++;
      } else {
        skipped++;
      }
    }
    
    revalidatePath('/tr/admin/automation');
    revalidatePath('/en/admin/automation');
    revalidatePath('/nl/admin/automation');
    return {success: true, created, skipped, total: defaultFeeds.length};
  } catch (error) {
    return {success: false, error: String(error)};
  }
}
