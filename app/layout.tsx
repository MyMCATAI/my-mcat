import type { Metadata } from 'next'
import { Inter, Roboto_Slab } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ModalProvider } from '@/components/modal-provider'
import { ToasterProvider } from '@/components/toaster-provider'
import Script from 'next/script'
import ThemeInitializer from '@/components/home/ThemeInitializer'
import { Analytics } from '@vercel/analytics/react';
import MobileRedirect from '@/components/MobileRedirect'

const inter = Inter({ subsets: ['latin'] })
const robotoSlab = Roboto_Slab({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mymcat.ai'),
  title: 'My MCAT - Beat The Competition',
  description: 'Interactive learning platform with AI-powered study tools, practice tests, and personalized feedback.',
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
    title: 'My MCAT - Your Path to MCAT Success',
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
    title: 'My MCAT - Revolutionary MCAT Preparation',
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
    afterSignOutUrl="/"
    >
      <html lang="en">
        <head>
          <Script
            src="https://js.stripe.com/v3/pricing-table.js"
            strategy="lazyOnload"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"></meta>
        </head>
        <body className={robotoSlab.className}>
          <div id="app-root">
            {/* Redirects mobile users to landing page except for '/' and '/intro' */}
            <MobileRedirect />
            <ThemeInitializer />
            <ModalProvider />
            <ToasterProvider />
            {children}
            <Analytics />
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
