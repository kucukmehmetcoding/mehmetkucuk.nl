import {getTranslations} from 'next-intl/server';
import {notFound, redirect} from 'next/navigation';
import {routing} from '@/i18n/routing';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from '@/lib/prisma';

async function checkMaintenanceMode() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'maintenanceMode' }
    });
    return setting?.value === 'true';
  } catch {
    return false;
  }
}



export default async function PublicLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  // Check maintenance mode for public pages
  const isMaintenanceMode = await checkMaintenanceMode();
  if (isMaintenanceMode) {
    redirect('/maintenance');
  }

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as 'tr' | 'en' | 'nl')) {
    notFound();
  }

  return (
    <>
      <Header locale={locale} />
      {children}
      <Footer />
    </>
  );
}