-- First add slug column as nullable
ALTER TABLE "Translation" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Update existing translations with slug from Article
UPDATE "Translation" t
SET slug = a.slug
FROM "Article" a
WHERE t."articleId" = a.id AND t.slug IS NULL;

-- Now make slug required
ALTER TABLE "Translation" ALTER COLUMN "slug" SET NOT NULL;

-- Add unique constraint for lang + slug combination
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_lang_slug_key" UNIQUE ("lang", "slug");

-- Add index for fast slug lookup
CREATE INDEX IF NOT EXISTS "Translation_slug_idx" ON "Translation"("slug");
