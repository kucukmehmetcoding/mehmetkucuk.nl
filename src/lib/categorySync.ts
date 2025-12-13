import type {Language, PrismaClient} from '@prisma/client';

import {prisma} from '@/lib/prisma';
import {CATEGORIES, getCategoryIdFromName} from '@/lib/categories';
import {toNewsSlug} from '@/lib/slugify';

const LANGS: Language[] = ['tr', 'en', 'nl'];

function slugifyCategory(input: string): string {
  const slug = toNewsSlug(input, 'tr', 80);
  return slug.trim() || 'other';
}

function humanizeSlug(slug: string): string {
  if (!slug) return 'Other';
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function normalizeCategorySlug(rawCategory: string | null | undefined): string {
  const trimmed = (rawCategory ?? '').trim();
  if (!trimmed) return 'other';

  const canonicalOrRaw = getCategoryIdFromName(trimmed);
  const slug = slugifyCategory(canonicalOrRaw);

  return slug || 'other';
}

export async function ensureCategoryExists(
  rawCategory: string | null | undefined,
  client: PrismaClient = prisma
): Promise<string> {
  const slug = normalizeCategorySlug(rawCategory);

  const category = await client.category.upsert({
    where: {slug},
    create: {slug},
    update: {},
  });

  const translated = CATEGORIES[slug];
  const fallbackName = humanizeSlug(slug);

  for (const lang of LANGS) {
    const name = translated?.[lang] ?? fallbackName;
    await client.categoryTranslation.upsert({
      where: {categoryId_lang: {categoryId: category.id, lang}},
      create: {categoryId: category.id, lang, name},
      update: {name},
    });
  }

  return slug;
}

export async function syncCategoriesFromContent(client: PrismaClient = prisma): Promise<{
  ensured: number;
  updatedArticles: number;
  updatedFeeds: number;
}> {
  const [articleCategories, feedCategories] = await Promise.all([
    client.article.findMany({
      where: {published: true},
      distinct: ['category'],
      select: {category: true},
    }),
    client.rssFeed.findMany({
      distinct: ['category'],
      select: {category: true},
    }),
  ]);

  const rawCategories = new Set<string>();
  for (const row of articleCategories) rawCategories.add(row.category);
  for (const row of feedCategories) rawCategories.add(row.category);

  let ensured = 0;
  let updatedArticles = 0;
  let updatedFeeds = 0;

  for (const raw of rawCategories) {
    const normalized = normalizeCategorySlug(raw);
    if (!normalized) continue;

    await ensureCategoryExists(normalized, client);
    ensured++;

    if (raw !== normalized) {
      const [articlesRes, feedsRes] = await Promise.all([
        client.article.updateMany({
          where: {category: raw},
          data: {category: normalized},
        }),
        client.rssFeed.updateMany({
          where: {category: raw},
          data: {category: normalized},
        }),
      ]);

      updatedArticles += articlesRes.count;
      updatedFeeds += feedsRes.count;
    }
  }

  return {ensured, updatedArticles, updatedFeeds};
}
