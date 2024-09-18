import type { Metadata } from 'next'
import { Inter, Roboto_Slab } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ModalProvider } from '@/components/modal-provider'
import { ToasterProvider } from '@/components/toaster-provider'
import Script from 'next/script'
import ThemeInitializer from '@/components/home/ThemeInitializer'
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] })
const robotoSlab = Roboto_Slab({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My MCAT',
  description: 'Your Personal MCAT Success Companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script
            src="https://js.stripe.com/v3/pricing-table.js"
            strategy="lazyOnload"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"></meta>
        </head>
        <body className={robotoSlab.className}>
            <ThemeInitializer />
            <ModalProvider />
            <ToasterProvider />
            {children}
        </body>
      </html>
    </ClerkProvider>
        <Analytics />
    </>
  )
}