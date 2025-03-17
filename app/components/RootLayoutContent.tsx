'use client'

import { useAuth } from '@clerk/nextjs'
import ThemeInitializer from '@/components/home/ThemeInitializer'
import { Analytics } from '@vercel/analytics/react'
import MobileRedirect from '@/components/MobileRedirect'
import { FullscreenPrompt } from '@/components/FullscreenPrompt'
import DebugPanel from "@/components/ui/DebugPanel"
import StoreInitializer from '@/components/StoreInitializer'
import LayoutWindowSizeTracker from '../layoutWindowSizeTracker'
import RouteTracker from '@/components/RouteTracker'
import { Toaster } from 'react-hot-toast'
import { toastConfig } from '@/lib/toast'

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  
  return (
    <div id="app-root" className="relative">
      <LayoutWindowSizeTracker />
      <MobileRedirect />
      <ThemeInitializer />
      <FullscreenPrompt />
      <StoreInitializer />
      <RouteTracker />
      <div className="relative z-50">
        {children}
      </div>
      <Analytics />
      <DebugPanel />
      {isSignedIn && <Toaster toastOptions={toastConfig} />}
    </div>
  );
} 