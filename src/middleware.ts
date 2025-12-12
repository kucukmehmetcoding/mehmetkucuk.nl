import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute per IP

// In-memory store for rate limiting (use Redis in production for multi-instance)
const requestCounts = new Map<string, {count: number; resetTime: number}>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean up every minute

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIp) return cfConnectingIp;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIp) return realIp;
  
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    requestCounts.set(ip, {count: 1, resetTime: now + RATE_LIMIT_WINDOW});
    return false;
  }

  record.count++;
  
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  return false;
}

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /wget/i,
    /curl/i,
  ];
  
  // Allow good bots
  const goodBots = [
    /googlebot/i,
    /bingbot/i,
    /yandex/i,
    /duckduckbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /slackbot/i,
    /telegrambot/i,
  ];
  
  for (const pattern of goodBots) {
    if (pattern.test(userAgent)) return false;
  }
  
  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) return true;
  }
  
  return false;
}

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent');

  // Skip static files and internal Next.js requests
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/cron')
  ) {
    return NextResponse.next();
  }

  // Allow bots for sitemaps, RSS feeds, and SEO-related paths
  if (pathname.startsWith('/sitemap') || pathname.startsWith('/sitemaps/') || pathname.startsWith('/feed/') || pathname === '/robots.txt') {
    return NextResponse.next();
  }

  // Block bad bots on other paths
  if (isBot(userAgent)) {
    return new NextResponse('Forbidden', {status: 403});
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({error: 'Too many requests. Please try again later.'}),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
  }

  // Rate limiting for news pages (more aggressive)
  if (pathname.includes('/news/')) {
    const newsRateLimit = 200; // Higher limit for content pages
    const record = requestCounts.get(ip);
    if (record && record.count > newsRateLimit) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Too Many Requests</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #e2e8f0; }
              .container { text-align: center; padding: 2rem; }
              h1 { font-size: 3rem; margin-bottom: 1rem; }
              p { opacity: 0.7; margin-bottom: 2rem; }
              a { color: #3b82f6; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⏳ Yavaşlayın!</h1>
              <p>Çok fazla istek gönderdiniz. Lütfen biraz bekleyip tekrar deneyin.</p>
              <a href="/">Ana Sayfaya Dön</a>
            </div>
          </body>
        </html>
        `,
        {
          status: 429,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // Locale redirect: / → /tr
  if (pathname === '/') {
    const acceptLanguage = request.headers.get('accept-language') || '';
    let locale = 'tr'; // Default

    if (acceptLanguage.includes('nl')) {
      locale = 'nl';
    } else if (acceptLanguage.includes('en')) {
      locale = 'en';
    }

    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  
  // HSTS - Strict Transport Security (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://connect.facebook.net https://mc.yandex.ru",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://pagead2.googlesyndication.com",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://googleads.g.doubleclick.net",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
