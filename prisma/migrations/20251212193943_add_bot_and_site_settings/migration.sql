/*
  Warnings:

  - A unique constraint covering the columns `[lang,slug]` on the table `Translation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Translation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SettingGroup" AS ENUM ('general', 'seo', 'appearance', 'advanced', 'social');

-- CreateEnum
CREATE TYPE "AdProvider" AS ENUM ('custom', 'google_adsense', 'google_admanager');

-- CreateEnum
CREATE TYPE "AdPlacement" AS ENUM ('header', 'sidebar_top', 'sidebar_bottom', 'footer', 'in_article', 'between_posts', 'popup', 'sticky_bottom');

-- CreateEnum
CREATE TYPE "FeedPriority" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "FeedStatus" AS ENUM ('active', 'paused', 'error');

-- AlterTable
ALTER TABLE "Translation" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryTranslation" (
    "id" TEXT NOT NULL,
    "lang" "Language" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "group" "SettingGroup" NOT NULL DEFAULT 'general',
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmtpSetting" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 587,
    "secure" BOOLEAN NOT NULL DEFAULT false,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmtpSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdSlot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "placement" "AdPlacement" NOT NULL,
    "description" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "provider" "AdProvider" NOT NULL DEFAULT 'custom',
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "altText" TEXT,
    "adCode" TEXT,
    "adUnitId" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "targetLangs" TEXT[],
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RssFeed" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "FeedPriority" NOT NULL DEFAULT 'medium',
    "status" "FeedStatus" NOT NULL DEFAULT 'active',
    "lastFetchedAt" TIMESTAMP(3),
    "lastItemGuid" TEXT,
    "lastItemDate" TIMESTAMP(3),
    "totalFetched" INTEGER NOT NULL DEFAULT 0,
    "totalPublished" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "maxItemsPerFetch" INTEGER NOT NULL DEFAULT 10,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RssFeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FetchedItem" (
    "id" TEXT NOT NULL,
    "feedId" TEXT NOT NULL,
    "guid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "pubDate" TIMESTAMP(3),
    "contentHash" TEXT NOT NULL,
    "simHash" TEXT NOT NULL,
    "body" TEXT,
    "summary" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "articleId" TEXT,
    "skippedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FetchedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotSettings" (
    "id" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "highPriorityInterval" INTEGER NOT NULL DEFAULT 5,
    "mediumPriorityInterval" INTEGER NOT NULL DEFAULT 15,
    "lowPriorityInterval" INTEGER NOT NULL DEFAULT 30,
    "dailyArticleTarget" INTEGER NOT NULL DEFAULT 50,
    "maxArticlesPerHour" INTEGER NOT NULL DEFAULT 10,
    "minQaScore" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "autoPublish" BOOLEAN NOT NULL DEFAULT true,
    "simHashThreshold" INTEGER NOT NULL DEFAULT 3,
    "crossSourceDedup" BOOLEAN NOT NULL DEFAULT true,
    "enablePaywallFilter" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotRunLog" (
    "id" TEXT NOT NULL,
    "priority" "FeedPriority" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "feedsChecked" INTEGER NOT NULL DEFAULT 0,
    "itemsFetched" INTEGER NOT NULL DEFAULT 0,
    "itemsProcessed" INTEGER NOT NULL DEFAULT 0,
    "itemsPublished" INTEGER NOT NULL DEFAULT 0,
    "itemsSkipped" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "BotRunLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTranslation_categoryId_lang_key" ON "CategoryTranslation"("categoryId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- CreateIndex
CREATE INDEX "SiteSetting_group_idx" ON "SiteSetting"("group");

-- CreateIndex
CREATE UNIQUE INDEX "AdSlot_placement_key" ON "AdSlot"("placement");

-- CreateIndex
CREATE INDEX "Advertisement_slotId_isActive_idx" ON "Advertisement"("slotId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RssFeed_url_key" ON "RssFeed"("url");

-- CreateIndex
CREATE INDEX "RssFeed_status_priority_idx" ON "RssFeed"("status", "priority");

-- CreateIndex
CREATE INDEX "FetchedItem_contentHash_idx" ON "FetchedItem"("contentHash");

-- CreateIndex
CREATE INDEX "FetchedItem_simHash_idx" ON "FetchedItem"("simHash");

-- CreateIndex
CREATE INDEX "FetchedItem_processed_createdAt_idx" ON "FetchedItem"("processed", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FetchedItem_feedId_guid_key" ON "FetchedItem"("feedId", "guid");

-- CreateIndex
CREATE INDEX "BotRunLog_startedAt_idx" ON "BotRunLog"("startedAt");

-- CreateIndex
CREATE INDEX "Article_category_idx" ON "Article"("category");

-- CreateIndex
CREATE INDEX "Article_published_publishedAt_idx" ON "Article"("published", "publishedAt");

-- CreateIndex
CREATE INDEX "Translation_slug_idx" ON "Translation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_lang_slug_key" ON "Translation"("lang", "slug");

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AdSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FetchedItem" ADD CONSTRAINT "FetchedItem_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "RssFeed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
