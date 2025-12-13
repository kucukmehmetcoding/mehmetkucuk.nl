import '../styles/globals.css';
import type {Metadata, Viewport} from 'next';
import {ReactNode} from 'react';
import {Inter, Space_Grotesk} from 'next/font/google';
import AnalyticsScripts from '@/components/AnalyticsScripts';
import {prisma} from '@/lib/prisma';

// Optimized font loading with next/font
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mehmetkucuk.nl';
const siteTitle = 'MK News Intelligence';
const siteDescription = 'Multilingual, AI-assisted developer newswire for tech professionals. Turkish, English, Dutch coverage.';

// Branding (logo/favicon/OG) and analytics are stored in DB and can change at runtime.
// Force dynamic rendering so updates appear without rebuilding.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'dark light',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`
  },
  description: siteDescription,
  keywords: ['news', 'technology', 'developer', 'multilingual', 'Turkish', 'English', 'Dutch'],
  authors: [
    {
      name: 'MK News Intelligence',
      url: siteUrl,
    }
  ],
  creator: 'Mehmet Kucuk',
  publisher: 'MK News Intelligence',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName: siteTitle,
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: siteTitle,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [`${siteUrl}/og-image.jpg`],
    creator: '@mehmetkucuk',
  },
};

// WebSite schema for Google Sitelinks Search Box
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteTitle,
  url: siteUrl,
  description: siteDescription,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/tr/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// Organization schema for brand identity
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteTitle,
  url: siteUrl,
  logo: `${siteUrl}/icon-512.png`,
  sameAs: ['https://twitter.com/mehmetkucuk'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['Turkish', 'English', 'Dutch'],
  },
};

// Fetch analytics settings from database
async function getAnalyticsSettings() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ['googleAnalyticsId', 'googleTagManager', 'googleAdsenseId', 'facebookPixel', 'yandexMetrica'],
        },
      },
    });
    return settings.reduce((acc, s) => ({...acc, [s.key]: s.value}), {} as Record<string, string>);
  } catch {
    return {};
  }
}

// Fetch branding settings from database
async function getBrandingSettings() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ['siteLogo', 'siteFavicon', 'siteFaviconMain', 'ogImage', 'siteName'],
        },
      },
    });
    return settings.reduce((acc, s) => ({...acc, [s.key]: s.value}), {} as Record<string, string>);
  } catch {
    return {};
  }
}

export default async function RootLayout({children}: {children: ReactNode}) {
  const analyticsSettings = await getAnalyticsSettings();
  const brandingSettings = await getBrandingSettings();
  
  // Dynamic favicon URLs from settings or defaults
  const faviconMain = brandingSettings.siteFaviconMain || '/favicon.ico';
  const ogImage = brandingSettings.ogImage || `${siteUrl}/og-image.jpg`;

  return (
    <html lang="tr" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* DNS Prefetch & Preconnect for Performance */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        
        {/* Dynamic Favicon - from admin settings */}
        <link rel="icon" href={faviconMain} sizes="32x32" />
        <link rel="icon" href={brandingSettings.siteFaviconMain ? faviconMain.replace('-32x32', '-192x192') : '/icon-192.png'} sizes="192x192" />
        <link rel="apple-touch-icon" href={brandingSettings.siteFaviconMain ? faviconMain.replace('-32x32', '-180x180') : '/icon-180.png'} />
        
        {/* RSS Feeds */}
        <link rel="alternate" type="application/rss+xml" title="MK News - Türkçe" href="/feed/tr" />
        <link rel="alternate" type="application/rss+xml" title="MK News - English" href="/feed/en" />
        <link rel="alternate" type="application/rss+xml" title="MK News - Nederlands" href="/feed/nl" />
        
        {/* Dynamic OG Image */}
        <meta property="og:image" content={ogImage} />
        
        {/* WebSite Schema for Google Sitelinks Search Box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(websiteSchema)}}
        />
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(organizationSchema)}}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <main>{children}</main>
        
        {/* Analytics Scripts - Dynamically loaded from admin settings */}
        <AnalyticsScripts
          googleAnalyticsId={analyticsSettings.googleAnalyticsId || process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}
          googleTagManagerId={analyticsSettings.googleTagManager}
          googleAdsenseId={analyticsSettings.googleAdsenseId}
          facebookPixelId={analyticsSettings.facebookPixel}
          yandexMetricaId={analyticsSettings.yandexMetrica}
        />
      </body>
    </html>
  );
}
