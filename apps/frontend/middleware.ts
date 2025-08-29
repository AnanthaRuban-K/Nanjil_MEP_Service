import { authMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/contact',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
    '/api/public(.*)'
  ],
  
  // Routes that are ignored by auth middleware
  ignoredRoutes: [
    '/api/health',
    '/_next(.*)',
    '/favicon.ico',
    '/sitemap.xml',
    '/robots.txt'
  ],

  // Custom logic after Clerk auth
  afterAuth(auth, req, evt) {
    // Handle locale redirection for non-API routes
    if (!req.nextUrl.pathname.startsWith('/api/') && 
        !req.nextUrl.pathname.startsWith('/_next/')) {
      return handleLocaleRedirection(req)
    }
    
    // Handle admin routes
    if (req.nextUrl.pathname.startsWith('/admin/') && 
        req.nextUrl.pathname !== '/admin/login') {
      if (!auth.userId) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
    }
    
    return NextResponse.next()
  }
})

// Locale handling function
function handleLocaleRedirection(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip if already has locale or is a special path
  if (pathname.startsWith('/ta/') || 
      pathname.startsWith('/en/') ||
      pathname === '/ta' || 
      pathname === '/en') {
    return NextResponse.next()
  }

  // Determine locale
  const cookieLocale = request.cookies.get('locale')?.value
  const acceptLanguage = request.headers.get('accept-language')
  
  let locale = 'ta' // Default to Tamil
  
  if (cookieLocale === 'en' || cookieLocale === 'ta') {
    locale = cookieLocale
  } else if (acceptLanguage?.includes('en') && !acceptLanguage?.includes('ta')) {
    locale = 'en'
  }

  // Redirect with locale
  const response = NextResponse.redirect(
    new URL(`/${locale}${pathname}`, request.url)
  )
  
  response.cookies.set('locale', locale, { path: '/' })
  return response
}

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ]
}