"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useUI } from '@/store/selectors';

/* --- Types ---- */
interface RouteHandlerProps {
  children: React.ReactNode;
}

const RouteHandler = ({ children }: RouteHandlerProps) => {
  const pathname = usePathname() || '';
  const { setCurrentRoute } = useUI();

  useEffect(() => {
    setCurrentRoute(pathname);
  }, [pathname, setCurrentRoute]);

  return <>{children}</>;
};

export default RouteHandler; 