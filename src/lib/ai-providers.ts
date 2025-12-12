/**
 * Multi-Provider AI System
 * Primary: Gemini (1.5M tokens/day free)
 * Fallback 1: Groq (100K tokens/day free)
 * Fallback 2: DeepSeek (pay-per-use, very affordable)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import OpenAI from 'openai';

// Initialize providers
const geminiApiKey = process.env.GEMINI_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

let gemini: GoogleGenerativeAI | null = null;
let groq: Groq | null = null;
let deepseek: OpenAI | null = null;

if (geminiApiKey) {
  gemini = new GoogleGenerativeAI(geminiApiKey);
  console.log('[AI] ✓ Gemini initialized (primary provider)');
} else {
  console.warn('[AI] ⚠ GEMINI_API_KEY missing. Gemini will not be available.');
}

if (groqApiKey) {
  groq = new Groq({ apiKey: groqApiKey });
  console.log('[AI] ✓ Groq initialized (fallback #1)');
} else {
  console.warn('[AI] ⚠ GROQ_API_KEY missing. Groq will not be available.');
}

if (deepseekApiKey) {
  deepseek = new OpenAI({
    apiKey: deepseekApiKey,
    baseURL: 'https://api.deepseek.com',
  });
  console.log('[AI] ✓ DeepSeek initialized (fallback #2)');
} else {
  console.warn('[AI] ⚠ DEEPSEEK_API_KEY missing. DeepSeek will not be available.');
}

// Rate limit tracking per provider
const rateLimitState: Record<string, { blocked: boolean; resetTime: number }> = {
  gemini: { blocked: false, resetTime: 0 },
  groq: { blocked: false, resetTime: 0 },
  deepseek: { blocked: false, resetTime: 0 },
};

function isProviderAvailable(provider: 'gemini' | 'groq' | 'deepseek'): boolean {
  const state = rateLimitState[provider];
  if (state.blocked && Date.now() < state.resetTime) {
    return false;
  }
  if (state.blocked && Date.now() >= state.resetTime) {
    state.blocked = false;
  }
  return true;
}

function markProviderRateLimited(provider: 'gemini' | 'groq' | 'deepseek', retryAfterMs: number = 60000) {
  rateLimitState[provider].blocked = true;
  rateLimitState[provider].resetTime = Date.now() + retryAfterMs;
  console.warn(`[AI] ${provider} rate limited. Will retry after ${retryAfterMs / 1000}s`);
}

// Gemini-specific call
async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!gemini) throw new Error('Gemini not initialized');
  
  const model = gemini.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userPrompt }
  ]);

  const response = result.response;
  const text = response.text();
  
  if (!text) {
    throw new Error('No content returned from Gemini');
  }
  
  return text;
}

// Groq-specific call
async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!groq) throw new Error('Groq not initialized');
  
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content returned from Groq');
  }
  
  return content;
}

// DeepSeek-specific call (OpenAI-compatible API)
async function callDeepSeek(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!deepseek) throw new Error('DeepSeek not initialized');
  
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content returned from DeepSeek');
  }
  
  return content;
}

// Multi-provider call with automatic fallback
export async function callAI(
  systemPrompt: string, 
  userPrompt: string,
  operationName: string
): Promise<string> {
  const providers: Array<{
    name: 'gemini' | 'groq' | 'deepseek';
    call: () => Promise<string>;
    available: boolean;
  }> = [
    { 
      name: 'gemini', 
      call: () => callGemini(systemPrompt, userPrompt),
      available: !!gemini && isProviderAvailable('gemini')
    },
    { 
      name: 'groq', 
      call: () => callGroq(systemPrompt, userPrompt),
      available: !!groq && isProviderAvailable('groq')
    },
    { 
      name: 'deepseek', 
      call: () => callDeepSeek(systemPrompt, userPrompt),
      available: !!deepseek && isProviderAvailable('deepseek')
    },
  ];

  const availableProviders = providers.filter(p => p.available);
  
  if (availableProviders.length === 0) {
    throw new Error('No AI providers available. Check API keys and rate limits.');
  }

  for (const provider of availableProviders) {
    try {
      console.log(`[AI] Using ${provider.name} for ${operationName}...`);
      const result = await provider.call();
      console.log(`[AI] ✓ ${provider.name} completed ${operationName}`);
      return result;
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; code?: number; errorDetails?: unknown[] };
      
      // Log full error for debugging
      console.error(`[AI] ${provider.name} full error:`, JSON.stringify({
        status: err.status,
        code: err.code,
        message: err.message?.substring(0, 200),
        errorDetails: err.errorDetails
      }));
      
      // Check for rate limit errors
      const errorMessage = err.message?.toLowerCase() || '';
      const isRateLimit = 
        err.status === 429 || 
        err.code === 429 ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('resource exhausted') ||
        errorMessage.includes('too many requests');
      
      if (isRateLimit) {
        console.warn(`[AI] ${provider.name} rate limited for ${operationName}`);
        // Different retry times: Gemini 1min, Groq 5min, DeepSeek 2min
        const retryTimes: Record<string, number> = {
          gemini: 60000,
          groq: 300000,
          deepseek: 120000,
        };
        markProviderRateLimited(provider.name, retryTimes[provider.name] || 60000);
        continue; // Try next provider
      }
      
      // For non-rate-limit errors, log and try next provider
      console.error(`[AI] ${provider.name} error for ${operationName}:`, err.message);
      continue;
    }
  }

  throw new Error(`All AI providers failed for ${operationName}`);
}

// Rewrite types
export type FalRewritePayload = {
  source_title: string;
  source_url: string;
  short_extract: string;
};

export type RewriteOutput = {
  title: string;
  lead: string;
  body: string;
  tags: string[];
  seo_title: string;
  meta_description: string;
};

// Translate types
export type TranslateOutput = {
  title: string;
  lead: string;
  body: string;
  seo_title: string;
  meta_description: string;
};

// Rewrite function
export async function callFalRewrite(payload: FalRewritePayload): Promise<RewriteOutput> {
  const systemPrompt = `You are a SENIOR NEWS EDITOR at a major international technology publication with 20+ years of experience. Your expertise spans technology, science, business, and digital culture. Transform source material into comprehensive, professionally-written news articles.

## CRITICAL REQUIREMENTS:

### 1. CONTENT LENGTH (MANDATORY)
- Body MUST be at least 500-700 words
- Expand the source material with:
  * Historical context and background information
  * Industry analysis and market implications
  * Expert perspectives (cite "industry analysts", "market experts", "tech observers")
  * Comparative analysis with competitors or similar developments
  * Future outlook and predictions
  * Potential challenges and concerns
  * Impact on consumers/businesses/industry

### 2. JOURNALISTIC STRUCTURE
- **Headline**: Compelling, attention-grabbing, factual (max 70 chars)
- **Lead Paragraph**: Answer WHO, WHAT, WHEN, WHERE, WHY in 2-3 sentences
- **Body Structure**:
  * Opening context (1-2 paragraphs)
  * Main news details (2-3 paragraphs)
  * Expert analysis/industry impact (2-3 paragraphs)
  * Background/historical context (1-2 paragraphs)
  * Future implications (1-2 paragraphs)
  * Closing thoughts (1 paragraph)

### 3. WRITING STYLE
- Professional, authoritative, objective tone
- Active voice, present tense for current events
- Short paragraphs (3-4 sentences maximum)
- Smooth transitions between sections
- Specific numbers, dates, and facts where available
- NO filler content, NO repetition
- Avoid sensationalism, maintain journalistic integrity

### 4. HTML FORMATTING (CRITICAL!)
- Body MUST use proper HTML tags for structure:
  * <h2> for section subheadings (2-3 subheadings in article)
  * <p> for each paragraph
  * <strong> for emphasis on key terms
  * <blockquote> for expert quotes
  * <ul>/<li> for lists when appropriate
- Example structure:
  <p>Opening paragraph...</p>
  <h2>Section Title</h2>
  <p>Section content...</p>
  <blockquote>"Expert quote here" - Industry Analyst</blockquote>
  <p>More content...</p>

### 5. SEO OPTIMIZATION
- SEO title: Keyword-rich, under 60 characters
- Meta description: Compelling summary, under 160 characters
- Tags: 5 relevant, specific keywords

## OUTPUT FORMAT (JSON ONLY):
{
  "title": "Compelling headline (max 70 chars)",
  "lead": "2-3 sentence summary answering key questions (plain text)",
  "body": "<p>First paragraph...</p><h2>Section Title</h2><p>More content...</p>... (HTML formatted, 500-700 words)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "seo_title": "SEO optimized title (max 60 chars)",
  "meta_description": "Compelling meta description (max 160 chars)"
}`;

  const userPrompt = `Transform this source material into a comprehensive, professional news article:

## SOURCE TITLE:
${payload.source_title}

## SOURCE URL:
${payload.source_url}

## SOURCE CONTENT:
${payload.short_extract}

## INSTRUCTIONS:
1. Write a MINIMUM of 500 words
2. Use proper HTML formatting (<p>, <h2>, <strong>, <blockquote>)
3. Add context, analysis, and expert perspectives
4. Use proper journalistic structure with subheadings
5. Output valid JSON only`;

  const content = await callAI(systemPrompt, userPrompt, 'rewrite');
  
  try {
    // Clean potential markdown code blocks
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return JSON.parse(cleanContent) as RewriteOutput;
  } catch {
    console.error('[AI] Failed to parse rewrite response:', content.substring(0, 200));
    throw new Error('Failed to parse AI response as JSON');
  }
}

// Translate function
export async function callFalTranslate(
  targetLang: 'tr' | 'nl',
  articleJson: Record<string, unknown>
): Promise<TranslateOutput> {
  const langNames: Record<string, string> = {
    tr: 'Turkish',
    nl: 'Dutch',
  };

  const langInstructions: Record<string, string> = {
    tr: `
## Turkish-Specific Rules:
- Use formal Turkish (siz form) appropriate for professional news
- Translate technical terms accurately:
  * "artificial intelligence" = "yapay zeka"
  * "machine learning" = "makine öğrenimi"
  * "cryptocurrency" = "kripto para"
  * "blockchain" = "blok zinciri"
- Keep brand names unchanged (Apple, Google, Microsoft, etc.)
- Use Turkish quotation marks: "..."
- Numbers: Use Turkish format (1.000.000 for million, %50 for percentages)
- Dates: Use Turkish format (11 Aralık 2025)
- Currency: Convert context (e.g., "$100 million" = "100 milyon dolar")
- Maintain the authoritative tone of Turkish journalism`,
    nl: `
## Dutch-Specific Rules:
- Use formal Dutch appropriate for news articles
- Translate technical terms while keeping commonly used English terms
- Keep brand names unchanged
- Use Dutch quotation marks: „..." or "..."
- Numbers: Use Dutch format (1.000.000 for million)
- Maintain professional journalistic tone
- Use "u" form for formal address`
  };

  const systemPrompt = `You are a SENIOR PROFESSIONAL TRANSLATOR with 15+ years of expertise in technology and business journalism. You specialize in translating news articles to ${langNames[targetLang]}.

## CRITICAL TRANSLATION REQUIREMENTS:

### Quality Standards:
- Translate ALL content COMPLETELY - never summarize or shorten
- The translation MUST be the SAME LENGTH as the original (500+ words)
- Preserve ALL paragraphs, ALL details, ALL context
- Maintain journalistic style, structure, and professional tone
- Create natural, fluent ${langNames[targetLang]} that reads like original content

${langInstructions[targetLang]}

### What to Keep Unchanged:
- Company and brand names (Apple, Google, Microsoft, OpenAI, etc.)
- Person names
- Technical product names
- URLs and links
- Code snippets (if any)

### What to Translate:
- All body text and explanations
- Headlines and subheadings
- Quotes (translate the content, attribute to original speaker)
- Technical concepts (use proper ${langNames[targetLang]} terminology)

### HTML PRESERVATION (CRITICAL!):
- Keep ALL HTML tags exactly as they are: <p>, <h2>, <strong>, <blockquote>, <ul>, <li>
- Only translate the TEXT inside the tags
- Do NOT add, remove, or modify any HTML tags

## OUTPUT FORMAT (JSON ONLY):
{
  "title": "translated headline - same impact and length as original",
  "lead": "translated lead paragraph - complete translation, 2-3 sentences (plain text)",
  "body": "FULLY translated body with HTML formatting preserved - MUST be same length as original",
  "seo_title": "translated SEO title (max 60 chars)",
  "meta_description": "translated meta description (max 160 chars)"
}`;

  const userPrompt = `Translate this English news article to ${langNames[targetLang]}. 
IMPORTANT: 
- Translate EVERYTHING completely. Do not shorten or summarize.
- PRESERVE all HTML tags (<p>, <h2>, <strong>, <blockquote>, <ul>, <li>)
- Only translate the TEXT CONTENT inside the tags, keep the tags themselves unchanged.

Article to translate:
${JSON.stringify(articleJson, null, 2)}`;

  const content = await callAI(systemPrompt, userPrompt, `translate-${targetLang}`);
  
  try {
    // Clean potential markdown code blocks
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return JSON.parse(cleanContent) as TranslateOutput;
  } catch {
    console.error('[AI] Failed to parse translation response:', content.substring(0, 200));
    throw new Error('Failed to parse AI translation response as JSON');
  }
}
