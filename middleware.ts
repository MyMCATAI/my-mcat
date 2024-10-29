import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/intro",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/disclaimer",
  "/cookiepolicy",
  "/acceptableuse",
  "/termsandconditions",
  "/privacypolicy",
  "/redirect",
  "/api/webhook",
  "/sitemap.xml",
  "/robots.txt",
  "/parallax/(.*)",
  "/colleges/(.*)",
  "/game-components/(.*)",
  "/icons/(.*)",
  "/landingpage/(.*)"
];

const isPublicRoute = createRouteMatcher(publicRoutes);
const isAdminRoute = createRouteMatcher(["/admin(.*)"])

const allowedAdminUserIds = [
  "user_2jCZfJZbTtFdqyqwcjaMNTOz1Lm",
  "user_2krxKeoPq12i3Nm8AD77AkIwC3H"
];

export default clerkMiddleware((auth, request) => {
  // Allow search engines to crawl public routes
  const userAgent = request.headers.get('user-agent') || '';
  const isCrawler = /bot|crawler|spider|crawling/i.test(userAgent);
  
  if (isCrawler && isPublicRoute(request)) {
    return NextResponse.next();
  }

  if (!isPublicRoute(request)) {
    auth().protect();
  }

  if (isAdminRoute(request)) {
    const userId = auth().userId;
    if (!userId || !allowedAdminUserIds.includes(userId)) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return NextResponse.next();
});

// Update the config matcher to explicitly exclude all static assets
export const config = {
  matcher: [
    // Exclude static files and public assets
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
    '/api/:path*',
    '/trpc/:path*',
    '/((?!parallax|colleges|game-components|icons|landingpage).*)',
    '/((?!\\.(?:svg|jpg|png|gif|ico|json|xml)).*)'
  ],
};
