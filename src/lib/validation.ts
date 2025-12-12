import {z} from 'zod';

/**
 * Shared validation schemas using Zod
 */

export const PostSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalı').max(200),
  slug: z.string().min(3).max(200),
  summary: z.string().min(10).max(500),
  body: z.string().min(20),
  category: z.string().min(1, 'Kategori seçin'),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  imageUrl: z.string().url().optional(),
  lang: z.enum(['tr', 'en', 'nl']),
  status: z.enum(['draft', 'pending', 'published']).default('draft'),
  publishedAt: z.date().optional(),
});

export type Post = z.infer<typeof PostSchema>;

export const CategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export type Category = z.infer<typeof CategorySchema>;

export const AdSlotSchema = z.object({
  name: z.string().min(2).max(100),
  placement: z.enum(['header', 'sidebar', 'in-article', 'footer']),
  width: z.number().positive(),
  height: z.number().positive(),
  priority: z.number().int().min(1).max(10),
});

export type AdSlot = z.infer<typeof AdSlotSchema>;

export const AutomationSourceSchema = z.object({
  name: z.string().min(2).max(100),
  sourceUrl: z.string().url(),
  enabled: z.boolean(),
  priority: z.number().int().min(1).max(10),
  interval: z.string().default('0 */6 * * *'), // Cron format
});

export type AutomationSource = z.infer<typeof AutomationSourceSchema>;

export const SettingsSchema = z.object({
  siteTitle: z.string().min(1).max(100),
  siteDescription: z.string().max(200),
  defaultLanguage: z.enum(['tr', 'en', 'nl']),
  supportedLanguages: z.array(z.enum(['tr', 'en', 'nl'])),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
});

export type Settings = z.infer<typeof SettingsSchema>;
