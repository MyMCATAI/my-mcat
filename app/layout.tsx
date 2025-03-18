import { Roboto_Slab } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import RootLayoutContent from './components/RootLayoutContent'
import './globals.css'

const robotoSlab = Roboto_Slab({ subsets: ['latin'] })

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
          <RootLayoutContent>{children}</RootLayoutContent>
        </body>
      </html>
    </ClerkProvider>
  )
}