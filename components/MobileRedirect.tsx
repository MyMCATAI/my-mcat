'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

function isMobileButNotIpad() {
  if (typeof window === 'undefined') return false
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ];
  
  const isIpad = /iPad/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  }) && !isIpad;
}

export default function MobileRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isMobileButNotIpad() && 
        pathname !== '/' && 
        pathname !== '/intro' && 
        pathname !== '/onboarding' &&
        pathname !== '/preferences' &&
        pathname !== '/ankiclinic' &&
        !pathname?.startsWith('/sign-in') &&
        !pathname?.startsWith('/sign-up') &&
        !pathname?.startsWith('/offer') &&
        !pathname?.startsWith('/blog')) {
      router.replace('/redirect')
    }
  }, [pathname, router])

  // Prevent content flash on restricted pages
  if (isMobileButNotIpad() && 
      pathname !== '/' && 
      pathname !== '/intro' && 
      pathname !== '/onboarding' &&
      pathname !== '/preferences' &&
      !pathname?.startsWith('/sign-in') &&
      !pathname?.startsWith('/sign-up') &&
      !pathname?.startsWith('/offer') &&
      !pathname?.startsWith('/blog')) {
    return null
  }

  return null
}