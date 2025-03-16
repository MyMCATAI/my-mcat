import { Roboto_Slab } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import ThemeInitializer from '@/components/home/ThemeInitializer'
import { Analytics } from '@vercel/analytics/react';
import MobileRedirect from '@/components/MobileRedirect'
import { FullscreenPrompt } from '@/components/FullscreenPrompt'
import DebugPanel from "@/components/ui/DebugPanel"
import StoreInitializer from '@/components/StoreInitializer'
import LayoutWindowSizeTracker from './layoutWindowSizeTracker'
import { metadata } from './metadata'
import RouteTracker from '@/components/RouteTracker'
import { Toaster } from 'react-hot-toast';
import { toastConfig } from '@/lib/toast';

import './globals.css'

const robotoSlab = Roboto_Slab({ subsets: ['latin'] })

export { metadata }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider afterSignOutUrl={"/"}>
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"></meta>
        </head>
        <body className={robotoSlab.className}>
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
            <Toaster toastOptions={toastConfig} />
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}