"use client";

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useUI, useUser, useGame } from '@/store/selectors'

/* --- Constants ----- */
const DEBUG_PARAM = 'debug'

const DebugPanel = () => {
  /* ---- State ----- */
  const searchParams = useSearchParams()
  const pathname = usePathname() || ''
  const router = useRouter()
  const [isDebug, setIsDebug] = useState(false)
  
  // Zustand state
  const uiState = useUI()
  const userState = useUser()
  const gameState = useGame()

  /* --- Effects --- */
  // Persist debug mode across navigation - optimized version
  useEffect(() => {
    const debugValue = searchParams?.get(DEBUG_PARAM)
    
    if (debugValue === 'true') {
      setIsDebug(true)
      localStorage.setItem('debug_mode', 'true')
      // Add a class to the body for CSS targeting
      document.body.classList.add('debug-mode')
    } else if (debugValue === null && localStorage.getItem('debug_mode') === 'true') {
      // If debug param is missing but we have it in localStorage, add it to URL
      // Use a more efficient approach with URLSearchParams
      const params = new URLSearchParams(window.location.search)
      params.set(DEBUG_PARAM, 'true')
      
      // Use replace instead of push to avoid adding to history stack
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      setIsDebug(true)
    }
    
    // Cleanup function
    return () => {
      if (debugValue === 'false') {
        localStorage.removeItem('debug_mode')
        document.body.classList.remove('debug-mode')
      }
    }
  }, [searchParams, pathname, router])

  // Helper function to sort object keys alphabetically - memoized for performance
  const sortObjectAlphabetically = useCallback((obj: any): any => {
    // Handle null or undefined
    if (obj === null || obj === undefined) return obj;
    
    // Handle Sets by converting to arrays
    if (obj instanceof Set) {
      return Array.from(obj).sort();
    }
    
    // If it's not an object (primitive value), return as is
    if (typeof obj !== 'object') return obj;
    
    // If it's an array, sort each object in the array
    if (Array.isArray(obj)) {
      return obj.map(item => 
        typeof item === 'object' && item !== null ? sortObjectAlphabetically(item) : item
      );
    }
    
    // For regular objects, sort the keys
    const sortedObj: Record<string, any> = {};
    Object.keys(obj)
      .sort((a, b) => a.localeCompare(b))
      .forEach(key => {
        const value = obj[key];
        // Special handling for Set objects
        if (value instanceof Set) {
          sortedObj[key] = Array.from(value).sort();
        } else {
          sortedObj[key] = typeof value === 'object' && value !== null 
            ? sortObjectAlphabetically(value) 
            : value;
        }
      });
    
    return sortedObj;
  }, []);

  if (!isDebug) return null

  // Sort the state objects alphabetically
  const sortedUIState = sortObjectAlphabetically(uiState);
  const sortedGameState = sortObjectAlphabetically(gameState);
  const sortedUserState = sortObjectAlphabetically(userState);

  return (
    <div className="fixed top-0 right-0 z-50 p-4 bg-red-100 bg-opacity-90 max-h-screen overflow-auto shadow-lg border-l border-red-300">
      <div className="space-y-4">
        {/* UI Store State */}
        <div>
          <h3 className="font-bold mb-2 text-black">UI Store State</h3>
          <pre className="bg-white bg-opacity-50 p-2 rounded text-black text-sm">
            {JSON.stringify(sortedUIState, null, 2)}
          </pre>
        </div>

        {/* Game Store State */}
        <div>
          <h3 className="font-bold mb-2 text-black">Game Store State</h3>
          <pre className="bg-white bg-opacity-50 p-2 rounded text-black text-sm">
            {JSON.stringify(sortedGameState, null, 2)}
          </pre>
        </div>

        {/* User Store State */}
        <div>
          <h3 className="font-bold mb-2 text-black">User Store State</h3>
          <pre className="bg-white bg-opacity-50 p-2 rounded text-black text-sm">
            {JSON.stringify(sortedUserState, null, 2)}
          </pre>
        </div>

        <div className="fixed bottom-4 right-4">
          <div className="text-black text-[10px] opacity-70 bg-white bg-opacity-50 px-2 py-1 rounded">
            Debug Mode: ON | Route: {uiState.currentRoute}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebugPanel