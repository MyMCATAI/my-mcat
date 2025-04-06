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

// Define other exempt paths - Remove '/' from this list since we handle it specially
const EXEMPT_PATHS = ['/auth', '/api', '/redirect', '/examcalendar', '/pricing', '/terms'];

// Type for tracking loading states
type LoadingState = {
  auth: boolean;      // Clerk auth loaded
  profile: boolean;   // User profile data loaded
  stats: boolean;     // User stats loaded
  studyPlan: boolean; // Study plan check loading
  redirect: boolean;  // Redirect in progress
};

// Type for tracking async operations
type AsyncOpState = {
  loading: boolean;
  error: Error | null;
  complete: boolean;
};

const initialAsyncState: AsyncOpState = {
  loading: false,
  error: null,
  complete: false
};

const RouteTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setCurrentRoute } = useUI();
  const { userInfo, isSubscribed, onboardingComplete, profileLoading, statsLoading, refreshUserInfo } = useUser();
  const { isSignedIn } = useClerkUser();
  const { isLoaded } = useClerkAuth();
  const { stopLoop, currentLoop } = useAudio();
  
  // Consolidated loading state
  const [loadingState, setLoadingState] = useState<LoadingState>({
    auth: true,
    profile: true,
    stats: true,
    studyPlan: false,
    redirect: false
  });
  
  // Request state for study plan check
  const [studyPlanCheckState, setStudyPlanCheckState] = useState<AsyncOpState>(initialAsyncState);
  
  // State flags
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Refs for redirection management
  const lastRedirectTime = useRef<number>(0);
  const isRedirecting = useRef<boolean>(false);
  const prevSignedInState = useRef<boolean | undefined>(undefined);
  
  // Debug mode - Set to true to enable verbose logging
  const isDebugMode = searchParams?.get('debug') === 'true';
  
  // Debug logging helper that only logs in debug mode
  const debugLog = useCallback((section: string, ...args: unknown[]) => {
    if (isDebugMode) {
      console.log(`[${section}]`, ...args);
    }
  }, [isDebugMode]);
  
  // Update loading state when auth or data loading status changes
  useEffect(() => {
    setLoadingState(prev => ({
      ...prev,
      auth: !isLoaded,
      profile: profileLoading,
      stats: statsLoading
    }));
    
    // Track initial load completion when all primary data is loaded
    if (isLoaded && !profileLoading && !statsLoading && userInfo && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [isLoaded, profileLoading, statsLoading, userInfo, initialLoadComplete]);
  
  // Memoize values that are used in effect dependencies to prevent unnecessary re-renders
  const isExemptPath = useMemo(() => {
    // Root path is always exempt
    if (pathname === '/') {
      debugLog('PATH_CHECK', 'Root path is exempt');
      return true;
    }
    
    if (!pathname) return false;
    
    // Always exempt auth-related paths
    if (AUTH_PATHS.some(path => pathname.includes(path))) {
      debugLog('PATH_CHECK', 'Auth path is exempt');
      return true;
    }
    
    // Other standard exempt paths
    const isStandardExempt = EXEMPT_PATHS.some(path => pathname.startsWith(path));
    debugLog('PATH_CHECK', `Path ${pathname} exempt: ${isStandardExempt}`);
    return isStandardExempt;
  }, [pathname, debugLog]);

  // Validate onboarding status (memoized)
  const effectiveOnboardingComplete = useMemo(() => {
    // First check the direct onboardingComplete flag from onboardingInfo
    if (userInfo?.onboardingInfo?.onboardingComplete === true) {
      debugLog('ONBOARDING', 'Complete via direct flag');
      return true;
    }
    
    // Then fall back to targetScore validation as a secondary check
    const targetScore = userInfo?.onboardingInfo?.targetScore;
    const isComplete = targetScore !== undefined && targetScore !== null && targetScore > 0;
    debugLog('ONBOARDING', `Complete via target score: ${isComplete}`);
    return isComplete;
  }, [userInfo?.onboardingInfo?.onboardingComplete, userInfo?.onboardingInfo?.targetScore, debugLog]);

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
      debugLog('REDIRECT', `Skipping redirect to ${targetPath} - too soon or already redirecting`);
      return undefined;
    }

    debugLog('REDIRECT', `Redirecting to ${targetPath} - reason: ${reason}`);

    // Set redirect state
    isRedirecting.current = true;
    setLoadingState(prev => ({ ...prev, redirect: true }));
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
      setLoadingState(prev => ({ ...prev, redirect: false }));
    }, 1500);
    
    // Return the fallback timeout to allow cleanup
    return fallbackTimeout;
  }, [router, preserveDebugParam, debugLog]);

  // Check study plan with proper async state tracking
  const checkStudyPlan = useCallback(async (): Promise<boolean> => {
    // Set loading state
    setStudyPlanCheckState({ loading: true, error: null, complete: false });
    setLoadingState(prev => ({ ...prev, studyPlan: true }));
    
    try {
      // Check localStorage cache first
      const cachedPlan = localStorage.getItem('study_plan_cache');
      const cacheTimestamp = localStorage.getItem('study_plan_cache_timestamp');
      const cacheAge = cacheTimestamp ? Date.now() - Number.parseInt(cacheTimestamp) : null;
      
      // Use cache if it exists and is less than 10 minutes old
      if (cachedPlan && cacheAge && cacheAge < 10 * 60 * 1000) {
        debugLog('STUDY_PLAN', 'Using cached study plan, cache age:', Math.round(cacheAge/1000), 'seconds');
        
        // Update states
        setStudyPlanCheckState({ loading: false, error: null, complete: true });
        setLoadingState(prev => ({ ...prev, studyPlan: false }));
        
        // Return whether study plan exists based on cache
        const data = JSON.parse(cachedPlan);
        return !!data.studyPlan;
      }
      
      // If no valid cache, fetch from API
      debugLog('STUDY_PLAN', 'Fetching fresh study plan data');
      const response = await fetch('/api/study-plan');
      
      if (!response.ok) {
        throw new Error('Failed to fetch study plan');
      }
      
      const data = await response.json();
      
      // Cache the response
      localStorage.setItem('study_plan_cache', JSON.stringify(data));
      localStorage.setItem('study_plan_cache_timestamp', Date.now().toString());
      
      // Update states
      setStudyPlanCheckState({ loading: false, error: null, complete: true });
      setLoadingState(prev => ({ ...prev, studyPlan: false }));
      
      // Return whether study plan exists
      return !!data.studyPlan;
    } catch (error) {
      debugLog('STUDY_PLAN', 'Error checking study plan:', error);
      console.error('Error checking study plan:', error);
      
      // Set error state
      const typedError = error instanceof Error ? error : new Error('Unknown error checking study plan');
      setStudyPlanCheckState({ loading: false, error: typedError, complete: true });
      setLoadingState(prev => ({ ...prev, studyPlan: false }));
      
      return false;
    }
  }, [debugLog, pathname]);

  // Update current route in the store
  useEffect(() => {
    if (pathname) {
      setCurrentRoute(pathname);
    }
  }, [pathname, setCurrentRoute]);

  // Handle ambient sound cleanup on route changes
  useEffect(() => {    
    // Only stop the ambient loop if we're not in AnkiClinic and it's currently playing
    if (currentLoop === 'flashcard-loop-catfootsteps' && pathname && !pathname.startsWith('/ankiclinic')) {
      stopLoop();
    }
  }, [pathname, stopLoop, currentLoop]);

  // Track if user just logged in
  useEffect(() => {
    const wasExplicitLogin = localStorage.getItem('explicit_login_click') === 'true';
    
    // If signed in state changed AND it was an explicit login button click
    if (isSignedIn === true && prevSignedInState.current !== true && wasExplicitLogin) {
      debugLog('AUTH', 'Login detected from explicit button click');
      setJustLoggedIn(true);
      // Clear the flag
      localStorage.removeItem('explicit_login_click');
    }
    
    // Update previous state for next comparison
    prevSignedInState.current = isSignedIn;
  }, [isSignedIn, debugLog]);

  // Special effect for handling login from root path
  useEffect(() => {
    // Only handle explicit login redirects on root path
    if (pathname !== '/' || !justLoggedIn) return;

    // Skip if still loading or redirect in progress
    if (!isLoaded || loadingState.profile || isRedirecting.current) return;
    
    // Decide where to redirect based on onboarding status
    if (isSignedIn) {
      if (effectiveOnboardingComplete) {
        debugLog('ROOT_PATH', 'Redirecting to /home - onboarding complete');
        const fallback = performRedirect('/home', 'Login with onboarding complete');
        setJustLoggedIn(false); // Reset flag
        return () => { if (fallback) clearTimeout(fallback); };
      }
      
      // Handle non-complete onboarding case
      debugLog('ROOT_PATH', 'Redirecting to /onboarding - onboarding incomplete');
      const fallback = performRedirect('/onboarding', 'Login with onboarding incomplete');
      setJustLoggedIn(false); // Reset flag
      return () => { if (fallback) clearTimeout(fallback); };
    }
  }, [
    pathname, 
    isSignedIn, 
    isLoaded, 
    justLoggedIn, 
    effectiveOnboardingComplete, 
    loadingState.profile, 
    performRedirect,
    debugLog,
    userInfo
  ]);

  // Handle redirection for users with no userInfo
  useEffect(() => {
    // Skip if any of these conditions are true
    if (
      !isLoaded || 
      isRedirecting.current || 
      isExemptPath || 
      !isSignedIn || 
      loadingState.profile || 
      pathname?.startsWith('/onboarding')
    ) {
      return;
    }
    
    // If user is signed in but has no userInfo, redirect to onboarding immediately
    if (!userInfo) {
      debugLog('USERINFO', 'No userInfo - redirecting to onboarding');
      const fallback = performRedirect('/onboarding', 'No userInfo');
      
      // Clean up fallback timeout if component unmounts
      return () => {
        if (fallback) clearTimeout(fallback);
      };
    }
  }, [
    isSignedIn, 
    userInfo, 
    loadingState.profile, 
    pathname, 
    isLoaded, 
    isExemptPath, 
    performRedirect,
    debugLog
  ]);

  // Handle redirects based on onboarding status
  useEffect(() => {
    // Skip if any of these conditions are true
    if (
      pathname === '/onboarding' || 
      isExemptPath || 
      loadingState.redirect || 
      loadingState.profile
    ) {
      return;
    }
    
    // Redirect to onboarding if needed
    if (isSignedIn && !effectiveOnboardingComplete) {
      debugLog('ONBOARDING_CHECK', 'Redirecting to onboarding - incomplete');
      const fallback = performRedirect('/onboarding', 'Onboarding not complete');
      
      // Clean up fallback timeout if component unmounts
      return () => {
        if (fallback) clearTimeout(fallback);
      };
    }
    
    // Redirect from onboarding page if already complete
    if (isSignedIn && effectiveOnboardingComplete && pathname === '/onboarding') {
      debugLog('ONBOARDING_CHECK', 'Redirecting to home - already complete');
      const fallback = performRedirect('/home', 'Onboarding already complete');
      
      // Clean up fallback timeout if component unmounts
      return () => {
        if (fallback) clearTimeout(fallback);
      };
    }
  }, [
    isSignedIn, 
    loadingState.profile, 
    loadingState.redirect,
    pathname, 
    effectiveOnboardingComplete, 
    isExemptPath, 
    performRedirect,
    debugLog
  ]);

  // Handle subscription and study plan checks
  useEffect(() => {
    // Skip checks if any of these conditions are true
    if (
      !initialLoadComplete ||
      !isLoaded || 
      !isSignedIn ||
      !userInfo ||
      !effectiveOnboardingComplete ||
      loadingState.redirect ||
      loadingState.studyPlan ||
      isExemptPath ||
      pathname === '/onboarding' || 
      pathname === '/redirect' ||
      pathname?.startsWith('/onboarding') ||
      pathname?.startsWith('/pricing')
    ) {
      return;
    }

    // Check subscription status
    const checkSubscriptionAndStudyPlan = async () => {
      // Subscription check - redirect non-subscribers to ankiclinic
      if (!isSubscribed && pathname && !pathname.startsWith('/ankiclinic')) {
        debugLog('SUBSCRIPTION', 'Not subscribed - redirecting to ankiclinic');
        const fallback = performRedirect('/ankiclinic', 'Not subscribed');
        return fallback;
      }
      
      // Check if home is unlocked - redirect to ankiclinic if not
      if (pathname === '/home') {
        // Parse unlocks to check if user has any non-game unlocks
        const unlocks = userInfo?.unlocks ? 
          (typeof userInfo.unlocks === 'string' ? JSON.parse(userInfo.unlocks) : userInfo.unlocks) : 
          [];
          
        // Check if user has any unlocks that aren't "game"
        const hasNonGameUnlocks = unlocks.length > 0 && unlocks.some((unlock: string) => unlock !== 'game');
        
        if (!hasNonGameUnlocks) {
          debugLog('FEATURE_GATE', 'No non-game unlocks - redirecting to ankiclinic');
          const fallback = performRedirect('/ankiclinic', 'No non-game features unlocked');
          return fallback;
        }
      }

      // Only log study plan status but don't force redirect
      const studyPlanExemptPaths = ['/examcalendar', '/api', '/auth', '/onboarding', '/redirect', '/ankiclinic'];
      const shouldCheckStudyPlan = !studyPlanExemptPaths.some(path => pathname?.startsWith(path));
      
      if (isSubscribed && shouldCheckStudyPlan) {
        debugLog('STUDY_PLAN', 'Checking study plan existence');
        
        // Check if study plan exists but don't redirect
        const hasStudyPlan = await checkStudyPlan();
        
        if (!hasStudyPlan) {
          debugLog('STUDY_PLAN', 'No study plan - but continuing without redirect');
          // No redirect to examcalendar anymore
        }
      }
      
      return undefined;
    };
    
    // Handle async operations with proper cleanup
    let fallbackTimeout: ReturnType<typeof setTimeout> | undefined;
    checkSubscriptionAndStudyPlan().then(timeout => {
      if (timeout) {
        fallbackTimeout = timeout;
      }
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
    loadingState.redirect,
    loadingState.studyPlan,
    isExemptPath,
    performRedirect,
    checkStudyPlan,
    debugLog
  ]);

  // Expose core loading state for the application
  const isApplicationLoading = useMemo(() => {
    return (
      loadingState.auth || 
      loadingState.profile || 
      loadingState.redirect || 
      isRedirecting.current
    );
  }, [loadingState]);

  // Expose consolidated state to components via Zustand if needed
  useEffect(() => {
    // Here you could update a loading state in a Zustand store
    // This would make the loading state available to all components
    // Example: setAppLoading(isApplicationLoading);
  }, []);

  return null;
};

export default RouteTracker;