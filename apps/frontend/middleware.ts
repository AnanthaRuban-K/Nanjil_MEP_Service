import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from '../frontend/src/lib/i18n/config';

function getLocale(request: NextRequest): string {
  // Check URL pathname for locale
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Check cookies or headers for preferred locale
  const cookieLocale = request.cookies.get('locale')?.value;
  const acceptLanguage = request.headers.get('accept-language');
  
  if (cookieLocale && i18n.locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }
  
  // Default to Tamil for Indian users
  if (acceptLanguage?.includes('ta') || acceptLanguage?.includes('in')) {
    return 'tamil';
  }
  
  return i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes, _next, and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    const response = NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
    
    // Set locale cookie
    response.cookies.set('locale', locale, { path: '/' });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|sitemap.xml|robots.txt).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
};