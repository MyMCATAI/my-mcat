import { Roboto_Slab } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import ThemeInitializer from '@/components/home/ThemeInitializer'
import { Analytics } from '@vercel/analytics/react';
import MobileRedirect from '@/components/MobileRedirect'
import { FullscreenPrompt } from '@/components/FullscreenPrompt'
import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { AudioProvider } from '@/contexts/AudioContext'
import { UserInfoProvider } from '@/contexts/UserInfoContext'
import DebugPanel from "@/components/ui/DebugPanel"
import RouteHandler from '@/components/RouteHandler'
import LayoutWindowSizeTracker from './layoutWindowSizeTracker'
import { metadata } from './metadata'

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
      <AudioProvider>
        <UserInfoProvider>
          <UserProfileProvider>
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
                  <div className="relative z-50">
                    <RouteHandler>
                      {children}
                    </RouteHandler>
                  </div>
                  <Analytics />
                  <DebugPanel />
                </div>
              </body>
            </html>
          </UserProfileProvider>
        </UserInfoProvider>
      </AudioProvider>
    </ClerkProvider>
  )
}
