import type { Metadata } from 'next'
import { Roboto_Slab } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import ThemeInitializer from '@/components/home/ThemeInitializer'
import { Analytics } from '@vercel/analytics/react';
import MobileRedirect from '@/components/MobileRedirect'
import { FullscreenPrompt } from '@/components/FullscreenPrompt'
import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { AudioProvider } from '@/contexts/AudioContext'
import { UserInfoProvider } from '@/contexts/UserInfoContext'
const robotoSlab = Roboto_Slab({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mymcat.ai'),
  title: 'mymcat - you\'re better with us',
  description: 'interactive learning platform with AI-powered study tools, practice tests, and personalized feedback.',
  keywords: 'MCAT prep, medical school admission, interactive learning, study tools, MCAT practice tests, MyMCAT, AI MCAT Prep, MCAT study platform',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'mymcat - you\'re better with us',
    description: 'Prepare for the MCAT with our innovative, gamified learning platform. Boost your scores and make studying enjoyable.',
    images: [
      {
        url: '/knowledge.png',
        width: 1200,
        height: 630,
        alt: 'My MCAT Platform Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mymcat - you\'re better with us',
    description: 'Transform your MCAT study experience with My MCAT. Engaging, effective, and tailored for success.',
    images: ['/knowledge.png'],
  },
  verification: {
    google: 'F6e4Rh-tPmtWbb_Ij-lgHvb2cXGQjy_h-UNxh9E-9Xc',
  },
  alternates: {
    canonical: 'https://www.mymcat.ai',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
    afterSignOutUrl={"/"}
    >
      <AudioProvider>
        <UserInfoProvider>
          <UserProfileProvider>
            <html lang="en">
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"></meta>
              </head>
              <body className={robotoSlab.className}>
                <div id="app-root" className="relative">
                  <MobileRedirect />
                  <ThemeInitializer />
                  <FullscreenPrompt />
                  <div className="relative z-50">
                    {children}
                  </div>
                  <Analytics />
                </div>
              </body>
            </html>
            </UserProfileProvider>
          </UserInfoProvider>
        </AudioProvider>
    </ClerkProvider>
  )
}
