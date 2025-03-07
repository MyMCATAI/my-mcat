"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUI, useUser } from '@/store/selectors';
import { OnboardingInfo } from '@/types';
import { useUser as useClerkUser } from '@clerk/nextjs';

/**
 * RouteTracker - Updates the Zustand store with the current route
 * and handles redirection based on user status and subscription.
 */

const RouteTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setCurrentRoute } = useUI();
  const { userInfo, isSubscribed, hasCompletedOnboarding, profileLoading, statsLoading } = useUser();
  const { isSignedIn } = useClerkUser();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Track route changes
  useEffect(() => {
    if (pathname) setCurrentRoute(pathname);
  }, [pathname, setCurrentRoute]);

  // Track when initial loading is complete
  useEffect(() => {
    // Consider data loaded when both profile and stats are loaded
    // and we have userInfo data
    if (!profileLoading && !statsLoading && userInfo && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [profileLoading, statsLoading, userInfo, initialLoadComplete]);

  // Handle redirection logic
  useEffect(() => {
    // Only proceed if we have user info, a valid pathname, and initial loading is complete
    // IMPORTANT: Also check if the user is signed in before redirecting
    if (!userInfo || !pathname || !initialLoadComplete || !isSignedIn) {
      return;
    }

    const checkRedirectPath = async () => {
      // Check for debug mode in query parameters
      const isDebugMode = searchParams?.get('debug') === 'true';
      
      // Skip redirection for exempt paths
      if (
        pathname === '/redirect' ||
        pathname.startsWith('/onboarding') ||
        pathname.startsWith('/mobile') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/sign-in') ||
        pathname.startsWith('/sign-up') ||
        pathname.startsWith('/preferences') ||
        // Skip redirection for the landing page if it's the root path
        pathname === '/' ||
        // Skip redirection if debug mode is enabled
        isDebugMode
      ) {
        return;
      }

      // 1. Redirect to onboarding if user has not completed onboarding
      if (!hasCompletedOnboarding) {
        router.push('/onboarding');
        return;
      }

      // 2. Redirect non-gold users to ankiclinic
      if (!isSubscribed && !pathname.startsWith('/ankiclinic')) {
        router.push('/ankiclinic');
        return;
      }

      // 3. Check if gold user needs study plan (skip for exempt paths)
      if (
        isSubscribed && 
        !pathname.startsWith('/examcalendar') &&
        !pathname.startsWith('/ankiclinic')
      ) {
        try {
          const response = await fetch('/api/study-plan');
          const data = await response.json();
          
          // Redirect to examcalendar if no study plan
          if (!data.studyPlan) {
            router.push('/examcalendar');
          }
        } catch (error) {
          console.error('Error checking study plan:', error);
        }
      }
    };

    checkRedirectPath();
    
    // hasCompletedOnboarding is critical in this dependency array
    // When it changes (via store updates), this effect re-runs and ensures
    // the user is redirected correctly based on their current onboarding status
  }, [pathname, router, userInfo, isSubscribed, hasCompletedOnboarding, initialLoadComplete, isSignedIn, searchParams]);

  return null;
};

export default RouteTracker; 