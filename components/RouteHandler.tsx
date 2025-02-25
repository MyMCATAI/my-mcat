"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useStore } from '@/store/uiStore';

const RouteHandler = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname() || '';
  const setActiveTab = useStore(state => state.setActiveTab);
  const setCurrentRoute = useStore(state => state.setCurrentRoute);

  useEffect(() => {
    // Extract the main route segment
    const route = pathname.split('/')[1] || 'home';
    setActiveTab(route);
    setCurrentRoute(pathname);
  }, [pathname, setActiveTab, setCurrentRoute]);

  return <>{children}</>;
};

export default RouteHandler; 