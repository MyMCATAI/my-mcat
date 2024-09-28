import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([  "/","/intro",'/sign-in(.*)', '/sign-up(.*)',
"/disclaimer",
"/cookiepolicy",
"/acceptableuse",
"/termsandconditions",
"/privacypolicy", 
"/api/webhook"])


const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const allowedAdminUserIds = [
  "user_2jCZfJZbTtFdqyqwcjaMNTOz1Lm",
  "user_2krxKeoPq12i3Nm8AD77AkIwC3H"
];
export default clerkMiddleware((auth, request) => {
  const userId = auth().userId;
  if (!isPublicRoute(request)) {
    auth().protect()
  }
  if (isAdminRoute(request)) {
    console.log("admin route")
    console.log("userId", auth().userId)
    const userId = auth().userId;
    if (!userId || !allowedAdminUserIds.includes(userId)) {
      console.log("Unauthorized access attempt to admin route")
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}