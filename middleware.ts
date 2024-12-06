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
  "/api/cron",
  "/sitemap.xml",
  "/robots.txt",
  "/parallax/(.*)",
  "/colleges/(.*)",
  "/game-components/(.*)",
  "/icons/(.*)",
  "/landingpage/(.*)",
  "/blog(.*)",
  "/Wallpaperwire.jpg",
  "/kalypsotumble.gif",
];

const isPublicRoute = createRouteMatcher(publicRoutes);
const isAdminRoute = createRouteMatcher(["/admin(.*)"])

const allowedAdminUserIds = [
  "user_2jCZfJZbTtFdqyqwcjaMNTOz1Lm",
  "user_2krxKeoPq12i3Nm8AD77AkIwC3H"
];

export default clerkMiddleware((auth, request) => {
  const userAgent = request.headers.get('user-agent') || ''
  const isCrawler = /bot|crawler|spider|crawling|googlebot|bingbot|duckduckbot/i.test(userAgent);
  
  // More permissive crawler access
  if (isCrawler) {
    return NextResponse.next();
  }

  if (!isPublicRoute(request)) {
    // Redirect unauthenticated users to sign-in
    if (!auth().userId) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', request.url);
      return NextResponse.redirect(signInUrl);
    }
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/(api|trpc)(.*)'
  ],
};
