"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useUI } from '@/store/selectors';

/* --- Constants ----- */
const TRANSITION_DURATION = 50; // ms

/* ----- Types ---- */
interface RouteHandlerProps {
  children: React.ReactNode;
}

const RouteHandler = memo(({ children }: RouteHandlerProps) => {
  /* ---- State ----- */
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentChildren, setCurrentChildren] = useState(children);
  
  /* ---- Refs --- */
  const renderCountRef = useRef(0);
  const prevPathnameRef = useRef<string | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const childrenRef = useRef(children);
  const isTransitioningRef = useRef(false);
  const isMountedRef = useRef(false);
  
  /* ---- Hooks ----- */
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setCurrentRoute } = useUI();
  
  // Check if we're in debug mode
  const isDebugMode = searchParams?.get('debug') === 'true';

  /* ----- Callbacks --- */
  // Memoized function to handle transitions
  const handleRouteTransition = useCallback(() => {
    // Skip if not mounted
    if (!isMountedRef.current) return;
    
    // Skip if already transitioning or no pathname change
    if (isTransitioningRef.current || prevPathnameRef.current === pathname) {
      return;
    }
    
    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    
    // Only transition if the pathname has actually changed
    if (prevPathnameRef.current !== pathname) {
      // Check if children have changed
      const childrenChanged = childrenRef.current !== children;
      if (childrenChanged) {
        childrenRef.current = children;
      }
      
      // Skip animation in debug mode for instant navigation
      if (isDebugMode) {
        setCurrentChildren(children);
      } else {
        // Start transition
        isTransitioningRef.current = true;
        setIsTransitioning(true);
        
        // After a short delay, update the children
        transitionTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setCurrentChildren(children);
            setIsTransitioning(false);
            isTransitioningRef.current = false;
          }
          transitionTimeoutRef.current = null;
        }, TRANSITION_DURATION);
      }
      
      // Update the previous pathname
      prevPathnameRef.current = pathname;
    }
  }, [children, isDebugMode, pathname]);

  /* --- Animations & Effects --- */
  // Track mount status
  useEffect(() => {
    renderCountRef.current += 1;
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, [pathname]);

  // Update the current route in the UI store
  useEffect(() => {
    if (pathname) {
      setCurrentRoute(pathname);
    }
  }, [pathname, setCurrentRoute]);

  // Handle route transitions with animation
  useEffect(() => {
    handleRouteTransition();
    
    // Cleanup function
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, [handleRouteTransition]);

  /* ---- Render Methods ----- */
  // Apply transition classes based on state
  const transitionClass = isDebugMode 
    ? 'debug-mode' 
    : isTransitioning 
      ? 'page-transition-exit-active' 
      : 'page-transition-enter-active';

  return (
    <div className={`route-transition ${transitionClass}`}>
      {currentChildren}
    </div>
  );
});

// Add display name for debugging
RouteHandler.displayName = 'RouteHandler';

export default RouteHandler; 