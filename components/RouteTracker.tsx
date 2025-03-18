"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUI, useUser, useAudio } from '@/store/selectors';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { useAuth as useClerkAuth } from '@clerk/nextjs';

/**
 * RouteTracker - Updates the Zustand store with the current route
 * and handles redirection based on user status and subscription.
 */

// Define auth-related paths that should be exempt from redirects
const AUTH_PATHS = ['/sign-in', '/sign-up', '/login', '/register', '/auth', '/sso-callback'];

// Define other exempt paths
const EXEMPT_PATHS = ['/auth', '/api', '/redirect', '/examcalendar', '/pricing', '/terms'];

const RouteTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setCurrentRoute } = useUI();
  const { userInfo, isSubscribed, onboardingComplete, profileLoading, statsLoading, refreshUserInfo } = useUser();
  const { isSignedIn } = useClerkUser();
  const { isLoaded } = useClerkAuth();
  const { stopLoop, currentLoop } = useAudio();
  
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const lastRedirectTime = useRef<number>(0);
  const isRedirecting = useRef<boolean>(false);

  // Memoize values that are used in effect dependencies to prevent unnecessary re-renders
  const isExemptPath = useMemo(() => {
    if (!pathname) return false;
    return AUTH_PATHS.some(path => pathname.includes(path)) || 
           EXEMPT_PATHS.some(path => pathname.startsWith(path));
  }, [pathname]);

  // Validate onboarding status (memoized)
  const effectiveOnboardingComplete = useMemo(() => {
    const targetScore = userInfo?.onboardingInfo?.targetScore;
    return targetScore !== undefined && targetScore !== null && targetScore > 0;
  }, [userInfo?.onboardingInfo?.targetScore]);

  // Local utility function for preserving debug parameter
  const preserveDebugParam = useCallback((path: string): string => {
    if (!searchParams) return path;
    
    const debugParam = searchParams.get('debug');
    if (debugParam === 'true') {
      return path.includes('?') ? `${path}&debug=true` : `${path}?debug=true`;
    }
    
    return path;
  }, [searchParams]);

  // Perform redirect with fallback like main branch
  const performRedirect = useCallback((targetPath: string, reason: string) => {
    // Prevent duplicate redirects and throttle redirect attempts
    if (Date.now() - lastRedirectTime.current < 1000 || isRedirecting.current) {
      return false;
    }

    isRedirecting.current = true;
    lastRedirectTime.current = Date.now();
    
    // Use the local function to preserve debug parameter
    const redirectPath = preserveDebugParam(targetPath);
    
    // Perform the redirect
    router.push(redirectPath);
    
    // Fallback for critical redirects (like main branch)
    const fallbackTimeout = setTimeout(() => {
      // Also preserve debug parameter in fallback URL
      window.location.href = redirectPath;
    }, 2000); // 2 second timeout
    
    // Reset redirect flag after 1.5 seconds
    setTimeout(() => {
      isRedirecting.current = false;
    }, 1500);
    
    // Return the fallback timeout to allow cleanup
    return fallbackTimeout;
  }, [router, preserveDebugParam]);

  // Update current route in the store
  useEffect(() => {
    if (pathname) {
      setCurrentRoute(pathname);
    }
  }, [pathname, setCurrentRoute]);

  // Track initial load completion - match main branch behavior
  useEffect(() => {
    // Skip loading state tracking if we're on onboarding
    if (pathname === '/onboarding') {
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
      return;
    }

    // Consider data loaded when both profile and stats are loaded
    // and we have userInfo data (like main branch)
    if (!profileLoading && !statsLoading && userInfo && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [profileLoading, statsLoading, userInfo, initialLoadComplete, pathname]);

  // Handle ambient sound cleanup on route changes
  useEffect(() => {    
    // Only stop the ambient loop if we're not in AnkiClinic and it's currently playing
    if (currentLoop === 'flashcard-loop-catfootsteps' && pathname && !pathname.startsWith('/ankiclinic')) {
      stopLoop();
    }
  }, [pathname, stopLoop, currentLoop]);

  // EFFECT 1: Handle immediate redirection for users with no userInfo (like main branch)
  useEffect(() => {
    // Don't redirect during loads or for exempt paths
    if (!isLoaded || isRedirecting.current || isExemptPath) {
      return;
    }

    // If user is signed in but has no userInfo, redirect to onboarding immediately
    if (isSignedIn && !profileLoading && !userInfo && !pathname?.startsWith('/onboarding')) {
      const fallback = performRedirect('/onboarding', 'No userInfo');
      
      // Clean up fallback timeout if component unmounts
      return () => {
        if (fallback) clearTimeout(fallback);
      };
    }
  }, [isSignedIn, userInfo, profileLoading, pathname, isLoaded, isExemptPath, performRedirect]);

  // EFFECT 2: Handle redirects based on onboarding status (like main branch)
  useEffect(() => {
    if (pathname === '/onboarding' || isExemptPath) {
      return;
    }
    
    // Only redirect to onboarding if:
    // 1. User is signed in
    // 2. Not already on onboarding page
    // 3. Not in loading state
    // 4. Onboarding is not complete
    if (isSignedIn && !profileLoading && !isRedirecting.current && !effectiveOnboardingComplete) {
      const fallback = performRedirect('/onboarding', 'Onboarding not complete');
      
      // Clean up fallback timeout if component unmounts
      return () => {
        if (fallback) clearTimeout(fallback);
      };
    }
    
    // Onboarding complete but on onboarding page, redirect to home
    if (isSignedIn && !profileLoading && effectiveOnboardingComplete && pathname === '/onboarding') {
      const fallback = performRedirect('/home', 'Onboarding complete but on onboarding page');
      
      // Clean up fallback timeout if component unmounts
      return () => {
        if (fallback) clearTimeout(fallback);
      };
    }
    
    // Special case: If on root path and signed in with completed onboarding, redirect to home
    if (isSignedIn && !profileLoading && effectiveOnboardingComplete && pathname === '/') {
      const fallback = performRedirect('/home', 'On root with completed onboarding');
      
      // Clean up fallback timeout if component unmounts
      return () => {
        if (fallback) clearTimeout(fallback);
      };
    }
  }, [isSignedIn, profileLoading, pathname, effectiveOnboardingComplete, isExemptPath, performRedirect]);

  // EFFECT 3: Main redirection logic for subscription checks (like main branch)
  useEffect(() => {
    // Skip redirection checks for specific paths
    if (
      pathname === '/onboarding' || 
      pathname === '/redirect' ||
      pathname?.startsWith('/onboarding') ||
      pathname?.startsWith('/pricing') ||
      isExemptPath ||
      isRedirecting.current ||
      !initialLoadComplete ||
      !isLoaded ||
      !isSignedIn ||
      !userInfo
    ) {
      return;
    }

    // Check if we have userInfo, if not refresh it
    if (isSignedIn && !userInfo) {
      refreshUserInfo();
      return;
    }

    const checkRedirectPath = async () => {
      // 1. Subscription check - redirect non-subscribers to ankiclinic
      if (effectiveOnboardingComplete && !isSubscribed && pathname && !pathname.startsWith('/ankiclinic')) {
        const fallback = performRedirect('/ankiclinic', 'Not subscribed');
        if (fallback) return fallback;
      }

      // 2. Check study plan for subscribed users
      const studyPlanExemptPaths = ['/examcalendar', '/api', '/auth', '/onboarding', '/redirect'];
      const shouldCheckStudyPlan = pathname ? !studyPlanExemptPaths.some(path => pathname.startsWith(path)) : false;
      
      if (effectiveOnboardingComplete && isSubscribed && shouldCheckStudyPlan) {
        try {
          const response = await fetch('/api/study-plan');
          if (!response.ok) {
            throw new Error('Failed to fetch study plan');
          }
          
          const data = await response.json();
          
          if (!data.studyPlan) {
            const fallback = performRedirect('/examcalendar', 'No study plan');
            if (fallback) return fallback;
          }
        } catch (error) {
          console.error('[RouteTracker] Error checking study plan:', error);
        }
      }
    };
    
    // Handle async redirects with proper typing
    let fallbackTimeout: ReturnType<typeof setTimeout> | undefined;
    checkRedirectPath().then(timeout => {
      fallbackTimeout = timeout;
    });
    
    // Clean up fallback timeouts
    return () => {
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [
    initialLoadComplete,
    isLoaded,
    isSignedIn,
    pathname,
    userInfo,
    effectiveOnboardingComplete,
    isSubscribed,
    refreshUserInfo,
    isExemptPath,
    performRedirect
  ]);

  return null;
};

export default RouteTracker;