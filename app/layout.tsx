import type { Metadata } from 'next'
import { Inter, Roboto_Slab } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ModalProvider } from '@/components/modal-provider'
import { ToasterProvider } from '@/components/toaster-provider'

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
    <ClerkProvider>
      <html lang="en">
        <body className={robotoSlab.className}>
            <ModalProvider />
            <ToasterProvider />
            {children}
        </body>
      </html>
    </ClerkProvider>
  )
}