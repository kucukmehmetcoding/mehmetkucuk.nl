import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import JsonLd from "@/components/JsonLd";
import { prisma } from '@/lib/prisma';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'SEO'});

  let settings;
  try {
    settings = await prisma.settings.findFirst();
    if (!settings) {
      console.warn('Settings not found in the database. Using default values.');
      settings = {
        faviconUrl: '/default-favicon.ico',
        logoUrl: null,
      };
    }
  } catch (error) {
    console.error('Error fetching settings from the database:', error);
    settings = {
      faviconUrl: '/default-favicon.ico',
      logoUrl: null,
    };
  }

  return {
    title: {
      template: '%s | Mehmet Kucuk',
      default: t('defaultTitle'),
    },
    description: t('defaultDescription'),
    metadataBase: new URL('https://mehmetkucuk.nl'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'tr': '/tr',
        'en': '/en',
        'nl': '/nl',
      },
    },
    openGraph: {
      title: t('defaultTitle'),
      description: t('defaultDescription'),
      url: `https://mehmetkucuk.nl/${locale}`,
      siteName: 'Mehmet Kucuk',
      locale: locale,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: settings.faviconUrl,
    },
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  // Fetch settings from the database
  let settings;
  try {
    settings = await prisma.settings.findFirst();
    if (!settings) {
      console.error('Settings not found in the database. Please ensure the Settings table has data.');
    }
  } catch (error) {
    console.error('Error fetching settings from the database:', error);
  }

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as 'tr' | 'en' | 'nl')) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href={settings?.faviconUrl || '/default-favicon.ico'} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <JsonLd />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
