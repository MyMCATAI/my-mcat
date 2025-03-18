"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUI, useUser, useAudio } from '@/store/selectors';
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
  const { userInfo, isSubscribed, onboardingComplete, profileLoading, statsLoading } = useUser();
  const { isSignedIn } = useClerkUser();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { stopLoop, currentLoop } = useAudio();

  // Handle immediate redirection for users with no userInfo
  useEffect(() => {
    // Define exempt paths that should never redirect to onboarding
    const exemptPaths = [
      '/auth',
      '/api',
      '/redirect',
      '/sign-in',
      '/sign-up',
      '/login',
      '/register'
    ];

    // If user is signed in but has no userInfo, redirect to onboarding immediately
    if (isSignedIn && !profileLoading && !userInfo && pathname) {
      // Only allow exempt paths to proceed without redirection
      if (!exemptPaths.some(path => pathname.startsWith(path))) {
        router.push('/onboarding');
      }
    }
  }, [isSignedIn, userInfo, profileLoading, pathname, router]);

  // Track route changes
  useEffect(() => {
    if (pathname) {
      setCurrentRoute(pathname);

      // Define exempt paths that should never redirect to onboarding
      const exemptPaths = [
        '/auth',
        '/api',
        '/redirect',
        '/sign-in',
        '/sign-up',
        '/login',
        '/register'
      ];

      // Skip remaining redirection checks for exempt paths
      if (exemptPaths.some(path => pathname.startsWith(path))) {
        return;
      }

      // Only redirect to onboarding if:
      // 1. User is signed in
      // 2. Not already on onboarding page
      // 3. Not in loading state
      // 4. Onboarding is not complete
      if (isSignedIn && !profileLoading && pathname !== '/onboarding') {
        if (!onboardingComplete) {
          router.push('/onboarding');
          return;
        }
      }
    }
  }, [pathname, setCurrentRoute, isSignedIn, userInfo, onboardingComplete, profileLoading, router]);

  // Handle ambient sound cleanup on route changes
  useEffect(() => {    
    // Only stop the ambient loop if we're not in AnkiClinic and it's currently playing
    if (currentLoop === 'flashcard-loop-catfootsteps' && !pathname?.startsWith('/ankiclinic')) {
      stopLoop();
    }
  }, [pathname, currentLoop, stopLoop]); // Only depend on pathname changes, not currentLoop

  // Track when initial loading is complete - skip for onboarding
  useEffect(() => {
    // Skip loading state tracking if we're on onboarding
    if (pathname === '/onboarding') {
      setInitialLoadComplete(true);
      return;
    }

    // Consider data loaded when both profile and stats are loaded
    // and we have userInfo data
    if (!profileLoading && !statsLoading && userInfo && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [profileLoading, statsLoading, userInfo, initialLoadComplete, pathname]);

  // Handle redirection logic
  useEffect(() => {
    // Skip redirection checks if we're on onboarding
    if (pathname === '/onboarding') {
      return;
    }

    // Only proceed if we have user info, a valid pathname, and initial loading is complete
    // IMPORTANT: Also check if the user is signed in before redirecting
    if (!userInfo || !pathname || !initialLoadComplete || !isSignedIn) {
      return;
    }

    const checkRedirectPath = async () => {
      // Check for debug mode in query parameters
      const isDebugMode = searchParams?.get('debug') === 'true';
      
      if (
        pathname === '/redirect' ||
        pathname.startsWith('/onboarding') ||
        pathname.startsWith('/pricing')
      ) {
        return;
      }

      // 1. Redirect to onboarding if user has not completed onboarding
      if (!onboardingComplete) {
        router.push('/onboarding');
        
        // Fallback for critical redirects
        const fallbackTimeout = setTimeout(() => {
          window.location.href = '/onboarding';
        }, 2000); // 2 second timeout
        
        // Clear timeout if component unmounts
        return () => clearTimeout(fallbackTimeout);
        
        return;
      }

      // 2. Redirect non-gold users to ankiclinic
      if (!isSubscribed && !pathname.startsWith('/ankiclinic')) {
        router.push('/ankiclinic');
        
        // Fallback for critical redirects
        const fallbackTimeout = setTimeout(() => {
          window.location.href = '/ankiclinic';
        }, 2000); // 2 second timeout
        
        // Clear timeout if component unmounts
        return () => clearTimeout(fallbackTimeout);
        
        return;
      }

      // 3. Check if gold user needs study plan (skip for exempt paths)
      // Match main branch exempt paths
      const studyPlanExemptPaths = ['/examcalendar', '/api', '/auth', '/onboarding', '/redirect'];
      const shouldCheckStudyPlan = !studyPlanExemptPaths.some(path => pathname.startsWith(path));
      
      if (isSubscribed && shouldCheckStudyPlan) {
        try {
          const response = await fetch('/api/study-plan');
          
          // Add response validation like main branch
          if (!response.ok) {
            throw new Error('Failed to fetch study plan');
          }
          
          const data = await response.json();
          
          // Redirect to examcalendar if no study plan
          if (!data.studyPlan) {
            router.push('/examcalendar');
            
            // Add fallback for critical redirects
            const fallbackTimeout = setTimeout(() => {
              window.location.href = '/examcalendar';
            }, 2000); // 2 second timeout
            
            // Clear timeout if component unmounts
            return () => clearTimeout(fallbackTimeout);
          }
        } catch (error) {
          console.error('Error checking study plan:', error);
        }
      }
    };

    checkRedirectPath();
    
    // onboardingComplete is critical in this dependency array
    // When it changes (via store updates), this effect re-runs and ensures
    // the user is redirected correctly based on their current onboarding status
  }, [pathname, router, userInfo, isSubscribed, onboardingComplete, initialLoadComplete, isSignedIn, searchParams]);

  return null;
};

export default RouteTracker; 