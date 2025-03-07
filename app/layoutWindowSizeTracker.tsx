//app/layoutWindowSizeTracker.tsx
'use client'

import { useEffect } from 'react'
import { useUI } from '@/store/selectors'

export default function LayoutWindowSizeTracker() {
  const { setWindowSize } = useUI()

  useEffect(() => {
    const checkIfPhone = () => {
      // Check if device is a phone using user agent
      const isPhoneUA = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent)
      
      // Check if screen size matches phone dimensions (max-width: 768px)
      const isPhoneSize = window.innerWidth <= 768
      
      // Consider it a phone if either condition is true
      return isPhoneUA || isPhoneSize
    }

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isPhone = checkIfPhone()
      
      setWindowSize({
        width,
        height,
        isDesktop: !isPhone
      })
    }

    // Set initial size
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setWindowSize])

  return null
} 