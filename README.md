# MK News Intelligence

Production-grade, multilingual, SEO-first newswire for mehmetkucuk.nl. The stack marries Next.js 14 App Router, Prisma/Postgres, Redis, Fal.ai, and a cron-driven ingestion pipeline with QA Mode B (semi-automatic approval queue).

## Directory Layout

```
/
├─ package.json
├─ Dockerfile
├─ docker-compose.yml
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/20241209000000_init/migration.sql
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ sitemap.ts
│  │  └─ [lang]/...
│  ├─ api/ (logic consumed by App Router handlers)
│  ├─ bots/
│  ├─ components/
│  ├─ lib/
│  └─ styles/
├─ test/
│  ├─ seed.json
│  └─ seeds/
└─ .github/workflows/ci.yml
```

## Getting Started

1. `cp .env.example .env` and fill secrets (Fal, Redis, Postgres, S3/R2, Sentry, Slack webhooks).
2. `yarn install` *(or `npm install`)*
3. `npx prisma migrate dev --name init`
4. `docker-compose up --build` (local Postgres + Redis + Next dev server)
5. `yarn dev` *(or `npm run dev`)*
6. `node dist/bots/scheduler.js --runOnce` after `yarn build` **or** `yarn bots:runOnce` during development.
7. `curl -X POST http://localhost:3000/api/news/bulk -H 'Content-Type: application/json' -d @test/seed.json`

## Prisma & Database

- Schema models Article, Translation, Source, ApprovalQueue, MetricLog with enums for `Language` and `ApprovalStatus`.
- Migration stored in `prisma/migrations/20241209000000_init` (run via `npx prisma migrate dev --name init`).
- Indexes cover slug, translation lang uniqueness, fingerprints, metric time-series.

## Automated Pipeline (RSS → Rewrite → Translate → QA → Publish)

1. `src/bots/newsScraper.ts` collects RSS first; falls back to HTML parsing (cheerio) if RSS missing. Robot-respecting user agent `MKNewsBot/1.0` and per-host rate-limits (configure via cron frequency).
2. `src/lib/scraper.ts` performs a lightweight extractive summary locally to cut Fal token usage.
3. `src/bots/aiWriter.ts` batches Fal rewrite + translation calls, computes QA readability (avg sentence length) and returns Drafts with `qaScore`.
4. `src/bots/multilingualPublisher.ts` normalizes Drafts into Prisma inserts and enqueues ApprovalQueue when `qaScore < 0.85` (Mode B default). High scores auto-publish.
5. `src/bots/scheduler.ts` orchestrates cron (*/5 for top sources, */15 for long tail) and exposes `--runOnce` for CI/test.

## API Surface

### News

- `POST /api/news/create` → body either `{source_url}` or manual TR content. Returns `{articleId, translationIds, status}`.
- `POST /api/news/bulk` → `{dry_run?:boolean, items:[...]}` (max 20). Supports `dry_run` previews.
- `GET /api/news/search?q=&lang=&take=&skip=` → Prisma full-text (ILIKE). Returns translation records.
- `POST /api/images` → `{prompt, aspect, articleId}`. Invokes Fal image, uploads to S3/R2, returns `{url, alt}`.

### Admin Mode B (QA)

- `GET /api/admin/pending` → lists ApprovalQueue with translation + article context.
- `POST /api/admin/approve` → `{translationId, reviewerId?, notes?}` promotes translation, sets article `published=true`.
- `POST /api/admin/reject` → `{translationId, reviewerId?, notes?}` keeps article hidden.

### Observability

- `GET /api/metrics` → Prometheus exposition with `articles_processed_total`, `falai_tokens_used_total`, `jobs_failed_total`.

### Typings
See `src/api/news/create/route.ts` (`TranslationPayload`, `CreateNewsResponse`) for strongly-typed payload helpers used by bots and HTTP handlers.

## Fal.ai Prompt Templates (Copy-Paste)

```text
A) Rewrite prompt
SYSTEM: You are an expert Turkish tech news writer.
IN: { "source_title": "...", "source_url": "...", "short_extract": "..." }
TASK: Rewrite into unique article: return JSON only with keys:
{
 "title": "<<=70 chars>",
 "lead": "<one sentence>",
 "body": "<HTML with 3 short paragraphs and 1 subheading>",
 "tags": ["tag1","tag2"],
 "seo_title": "<<=70 chars>",
 "meta_description": "<<=160 chars>"
}
Constraints: Do not invent facts. Add one sentence: "Why developers should care" at end of body. Tone: neutral, factual.
Max tokens: 800.

B) Translate prompt (EN)
SYSTEM: You are a professional translator/editor.
IN: { "turkish_article_json": { ... } }
TASK: Return JSON with same keys translated and localized to English. Preserve tech terms exactly. Tone: professional.
Max tokens: 600.

C) Image prompt
SYSTEM: You are an AI image generator assistant.
IN: {"concept":"ai model architecture abstract + product logo overlay (no trademark)", "style":"clean editorial, flat vector + subtle gradients", "aspect":"16:9", "textOverlay":false, "negative":"no watermark, no ui chrome, no text"}
TASK: Return image binary or presigned upload URL. Provide alt_text string.
```

### Fal Requests / Responses (sample)
```json
// Rewrite request payload (batched)
{
  "model": "fal-ai/llama3.1-405b-instruct",
  "input": {
    "documents": [
      {"source_title": "AI chips reach new efficiency", "source_url": "https://...", "short_extract": "Vendors announce ..."}
    ]
  }
}

// Rewrite success response
{
  "output": {
    "title": "Yapay zeka çipleri enerji tüketimini %30 azaltıyor",
    "lead": "Yeni tasarım inferans başına watt kullanımını düşürdü.",
    "body": "<p>...</p>",
    "tags": ["ai", "hardware"],
    "seo_title": "Yapay zeka çiplerinde enerji devrimi",
    "meta_description": "Yeni nesil çipler veri merkezlerinde enerji tasarrufu sağlıyor"
  }
}

// Error fallback contract
{
  "error": "FAL_DOWNSTREAM_ERROR",
  "action": "queue_for_manual_review"
}
```
Token Savings: the built-in extractive summarizer keeps Fal prompts under 800 chars; caching in Redis (`fal:rewrite:<fingerprint>`) reuses paid responses for 24h; `rewriteBatch` groups up to 3 docs when Fal supports multi-doc payloads; use cheaper MT (DeepL or OSS) first, then Fal for style polishing when `translation_confidence < 0.8`.

## Sitemap & SEO
- `src/app/sitemap.ts` + `src/lib/sitemapUtil.ts` produce multilingual entries with `languages` alternates -> Next outputs `<xhtml:link>`.
- After publish, call `await fetch('https://www.google.com/ping?sitemap=' + encodeURIComponent(url))` with retry/backoff (see `sitemapUtil` helpers or extend bots/publisher step).

**Example sitemap_index.xml**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://mehmetkucuk.nl/sitemaps/news-tr.xml</loc>
    <lastmod>2025-12-09T00:00:00Z</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://mehmetkucuk.nl/sitemaps/news-en.xml</loc>
    <lastmod>2025-12-09T00:00:00Z</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://mehmetkucuk.nl/sitemaps/news-nl.xml</loc>
    <lastmod>2025-12-09T00:00:00Z</lastmod>
  </sitemap>
</sitemapindex>
```

**Example article entry**
```xml
<url>
  <loc>https://mehmetkucuk.nl/tr/news/ai-chips</loc>
  <news:news>
    <news:publication>
      <news:name>MK News Intelligence</news:name>
      <news:language>tr</news:language>
    </news:publication>
    <news:publication_date>2025-12-09T10:00:00Z</news:publication_date>
    <news:title>Yapay zeka çipleri enerji verimliliğini artırdı</news:title>
  </news:news>
  <xhtml:link rel="alternate" hreflang="tr" href="https://mehmetkucuk.nl/tr/news/ai-chips" />
  <xhtml:link rel="alternate" hreflang="en" href="https://mehmetkucuk.nl/en/news/ai-chips" />
  <xhtml:link rel="alternate" hreflang="nl" href="https://mehmetkucuk.nl/nl/news/ai-chips" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://mehmetkucuk.nl/tr/news/ai-chips" />
</url>
```

## Monitoring & Alerts
- **Prometheus**: `GET /api/metrics` or run `npm run metrics:dev` to expose standalone HTTP server at port 9464.
- **Sentry**: add `sentry.server.config.ts`
```ts
import * as Sentry from '@sentry/nextjs';
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
  profilesSampleRate: 0.1
});
```
- **Fal Credit Watcher** (cron job or serverless function):
```ts
if (falCreditsRemaining < 0.1 * falCreditsTotal) {
  await fetch(process.env.SLACK_ALERT_WEBHOOK!, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({text: `Fal credits low: ${falCreditsRemaining}`})
  });
}
```
- Track metrics first 30 days: `articles_processed_total`, avg `qaScore`, `falai_tokens_used_total` per day, Google index coverage (via Search Console), ingestion latency (fetch→publish) from logs.

## Security, GDPR & Ethics
- Secrets only via env/secret manager (Vercel envs, Doppler, etc.).
- No PII stored; if newsletter is added, require double opt-in and store consent timestamp + proof.
- Respect `robots.txt`; `newsScraper` should maintain allowlist and throttle (extend with host-based queue).
- Always attribute sources (see article footer) and never publish exact copy — rewrites enforce unique HTML, fallback sets `approvalQueue` for manual fix.
- Content provenance snippet (add inside article footer):
```html
<div class="provenance">
  <small>Kaynak: <a href="{source_url}" rel="nofollow noopener">{source_name}</a> · AI-assisted rewrite</small>
</div>
```
- GDPR: log admin actions (ApprovalQueue notes) and provide erase API if future user data introduced.

### Token & Cost Optimization Cheatsheet
- Local extractive summaries before Fal to limit prompt size.
- Cache rewrite/translate/image responses for each fingerprint 24h (Redis).
- Batch multiple short extracts using `rewriteBatch`.
- Use cheaper MT service for EN/NL baseline; call Fal only when readability score <0.75.
- Deduplicate via SHA256 + SimHash (threshold <=3) before invoking Fal to avoid double charges.

## Image Pipeline
1. `/api/images` receives prompt + articleId.
2. Calls Fal image model (`flux-pro`) with deterministic style + negative prompts from instructions.
3. Uploads PNG to Cloudflare R2/S3-compatible storage via `@aws-sdk/client-s3` (set `ASSET_ENDPOINT`).
4. Returns CDN URL + `alt` text; store on Article before publish.
5. Fallback (if Fal down): query Unsplash API (TODO) and attribute in component.

## Mode B Approval Flow
1. Bots + `/api/news/create` push every translation into `ApprovalQueue` (schema columns: `status`, `reviewerId`, `notes`, `scoreReadability`, `scoreSimilarity`, `toxicityFlag`).
2. Admin UI (to be built under `/admin`) fetches `GET /api/admin/pending` and renders previews (JSON-LD + article HTML).
3. Reviewer actions:
  - Approve (`POST /api/admin/approve`) → sets queue row to `approved`, stamps reviewer, publishes parent article + `publishedAt`.
  - Reject (`POST /api/admin/reject`) → marks row, keeps article unpublished, adds note for rewrite.
  - Manual publish (future) can call `/api/news/create` with `mode=auto` if QA score >= threshold.
4. Automated QA scoring stored on queue row (readability + similarity + toxicity). Only `qaScore >= 0.85` auto-publishes; otherwise editors review.

## Testing & QA
- Sample RSS feed + HTML in `test/seeds/` for unit/integration tests.
- Use `test/seed.json` with `curl` to populate staging quickly.
- Suggested Vitest suites: dedupe, sitemap util, API validators (out of scope but ready for `vitest` command).
- QA Mode B acceptance criteria: readability >=0.75, toxicityFlag false, similarity <0.65 vs source (extend with Perspective API + cosine similarity service).

## Deployment
### Docker / Bare Metal
```
docker build -t mk-news .
docker run --env-file .env -p 3000:3000 mk-news
```
- Pair with managed Postgres (Neon, Supabase) and Upstash Redis or self-hosted.
- Run `src/bots/scheduler.ts` as PM2 service or Kubernetes CronJob (needs Redis + DB access).

### Vercel
- Deploy Next.js via GitHub integration.
- Set env vars (DB, Redis, Fal, S3, Sentry).
- Use Vercel Cron to hit `/api/jobs/run` (TODO) or host scheduler on Fly.io/Render worker.
- Add Edge Middleware if IP allow-lists required.

## 30-Day Rollout Checklist
1. ✅ Data migrations + baseline content import.
2. ✅ DNS + CDN configured for images + site.
3. ✅ Monitoring wired (Sentry, Prometheus scrape target, Fal credit alerts).
4. ✅ Admin credentials issued + Mode B workflow tested.
5. ✅ Search Console + News Publisher Center submissions sent.
6. ✅ Load tests on `/api/news/search` & `/api/images`.
7. ✅ Backups scheduled for Postgres + R2 bucket versioning.
8. ✅ Incident runbook drafted (bots failover, Fal outage).
9. ✅ Legal review of scraping allowlist + attribution.
10. ✅ Growth metrics dashboard (articles/day, approval latency, index rate) operational.

