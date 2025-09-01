import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth(); // 👈 async ஆக await பண்ணணும்

  const path = req.nextUrl.pathname;

  // Public routes
  const publicRoutes = [
    "/",
    "/contact",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/api/public(.*)",
  ];

  // Ignored routes
  const ignoredRoutes = [
    "/api/health",
    "/_next(.*)",
    "/favicon.ico",
    "/sitemap.xml",
    "/robots.txt",
  ];

  // Skip auth check
  if (
    publicRoutes.some((route) => new RegExp(`^${route}$`).test(path)) ||
    ignoredRoutes.some((route) => new RegExp(`^${route}$`).test(path))
  ) {
    return NextResponse.next();
  }

  // Locale redirection
  if (!path.startsWith("/api/") && !path.startsWith("/_next/")) {
    return handleLocaleRedirection(req);
  }

  // Admin protection
  if (path.startsWith("/admin/") && path !== "/admin/login") {
    if (!userId) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
});

// Locale handling function
function handleLocaleRedirection(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/ta/") ||
    pathname.startsWith("/en/") ||
    pathname === "/ta" ||
    pathname === "/en"
  ) {
    return NextResponse.next();
  }

  const cookieLocale = request.cookies.get("locale")?.value;
  const acceptLanguage = request.headers.get("accept-language");

  let locale = "ta";

  if (cookieLocale === "en" || cookieLocale === "ta") {
    locale = cookieLocale;
  } else if (acceptLanguage?.includes("en") && !acceptLanguage?.includes("ta")) {
    locale = "en";
  }

  const response = NextResponse.redirect(
    new URL(`/${locale}${pathname}`, request.url)
  );

  response.cookies.set("locale", locale, { path: "/" });
  return response;
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
