import { useEffect, useCallback } from 'react'
import { useStore } from '@/store/uiStore'

/* --- Constants ----- */
const DEBOUNCE_DELAY = 250

/* ----- Types ---- */
type DebouncedFunction = (...args: any[]) => void

/* --- Utils ----- */
function debounce(func: DebouncedFunction, wait: number) {
  let timeout: NodeJS.Timeout
  
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const useWindowSize = () => {
  const setWindowSize = useStore(state => state.setWindowSize)
  
  const handleResize = useCallback(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    
    setWindowSize({
      width,
      height,
      isMobile: width < 640, // sm breakpoint
      isTablet: width >= 640 && width < 1024, // between sm and lg
      isDesktop: width >= 1024 // lg breakpoint
    })
  }, [setWindowSize])

  useEffect(() => {
    // Create debounced version of handleResize
    const debouncedHandleResize = debounce(handleResize, DEBOUNCE_DELAY)

    // Initial size
    handleResize()

    window.addEventListener('resize', debouncedHandleResize)
    return () => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  }, [handleResize])
} 