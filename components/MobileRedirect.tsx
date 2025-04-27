'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { isMobileButNotIpad } from '@/lib/utils'

export default function MobileRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isMobileButNotIpad() && 
        pathname !== '/' && 
        pathname !== '/intro' && 
        pathname !== '/preferences' &&
        pathname !== '/ankiclinic' &&
        !pathname?.startsWith('/sign-in') &&
        !pathname?.startsWith('/sign-up') &&
        !pathname?.startsWith('/pricing') &&
        !pathname?.startsWith('/blog')) {
      router.replace('/redirect')
    }
  }, [pathname, router])

  // Prevent content flash on restricted pages
  if (isMobileButNotIpad() && 
      pathname !== '/' && 
      pathname !== '/intro' && 
      pathname !== '/preferences' &&
      !pathname?.startsWith('/sign-in') &&
      !pathname?.startsWith('/sign-up') &&
      !pathname?.startsWith('/pricing') &&
      !pathname?.startsWith('/blog')) {
    return null
  }

  return null
}