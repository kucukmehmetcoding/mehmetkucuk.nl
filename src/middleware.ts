import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for admin, API, maintenance, and static files
  if (
    pathname.startsWith('/admin') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/maintenance') ||
    pathname.startsWith('/login') ||
    pathname.includes('.') // Skip all files with extensions
  ) {
    return createMiddleware(routing)(request);
  }
  
  return createMiddleware(routing)(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(tr|en|nl)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};