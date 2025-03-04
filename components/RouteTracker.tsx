"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUI } from '@/store/selectors';

/**
 * RouteTracker - Updates the Zustand store with the current route
 * This component doesn't render anything, it just tracks route changes
 */
const RouteTracker = () => {
  const pathname = usePathname();
  const { setCurrentRoute } = useUI();

  // Update the current route in Zustand store whenever pathname changes
  useEffect(() => {
    if (pathname) {
      setCurrentRoute(pathname);
    }
  }, [pathname, setCurrentRoute]);

  // This component doesn't render anything
  return null;
};

export default RouteTracker; 