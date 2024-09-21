import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
      publicRoutes: ["/","/intro","/disclaimer","/cookiepolicy","/acceptableuse","/termsandconditions","/privacypolicy", "/api/webhook"],
      debug: true,
      afterAuth(auth, req, evt) {
            // Handle auth for public routes
            if (auth.isPublicRoute) {
              return NextResponse.next();
            }
        
            // Handle other routes as before
            if (!auth.userId && !auth.isPublicRoute) {
              const signInUrl = new URL('/sign-in', req.url);
              signInUrl.searchParams.set('redirect_url', req.url);
              return NextResponse.redirect(signInUrl);
            }
          },
});
export const config = {
      matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};