"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useUI } from '@/store/selectors';

/* --- Types ---- */
interface RouteHandlerProps {
  children: React.ReactNode;
}

const RouteHandler: React.FC<RouteHandlerProps> = memo(({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setCurrentRoute } = useUI();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentChildren, setCurrentChildren] = useState(children);
  const renderCountRef = useRef(0);
  const prevPathnameRef = useRef<string | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const childrenRef = useRef(children);
  const isTransitioningRef = useRef(false);
  const isMountedRef = useRef(false);
  
  // Check if we're in debug mode
  const isDebugMode = searchParams?.get('debug') === 'true';

  // Track render count
  useEffect(() => {
    renderCountRef.current += 1;
    isMountedRef.current = true;
    if (isDebugMode) {
      console.log(`[Debug] RouteHandler rendered #${renderCountRef.current} for path: ${pathname}`);
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [pathname, isDebugMode]);

  // Update the current route in the UI store
  useEffect(() => {
    if (pathname) {
      setCurrentRoute(pathname);
    }
  }, [pathname, setCurrentRoute]);

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
    
    // Only log and transition if the pathname has actually changed
    if (prevPathnameRef.current !== pathname) {
      if (isDebugMode) {
        console.log(`[Navigation] Route transition detected to ${pathname} at ${new Date().toISOString()}`);
      }
      
      // Check if children have changed
      const childrenChanged = childrenRef.current !== children;
      if (childrenChanged && isDebugMode) {
        console.log(`[Debug] RouteHandler children changed on render #${renderCountRef.current}`);
        childrenRef.current = children;
      }
      
      // Skip animation in debug mode for instant navigation
      if (isDebugMode) {
        if (isDebugMode) {
          console.log(`[Navigation] Debug mode detected - skipping animation`);
        }
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
            if (isDebugMode) {
              console.log(`[Navigation] Route transition completed at ${new Date().toISOString()}`);
            }
          }
          transitionTimeoutRef.current = null;
        }, 50); // Reduced from 100ms to 50ms for faster transitions
      }
      
      // Update the previous pathname
      prevPathnameRef.current = pathname;
    }
  }, [children, isDebugMode, pathname]);

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