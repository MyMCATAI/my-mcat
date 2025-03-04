"use client";

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useUI, useUser, useGame } from '@/store/selectors'

/* --- Constants ----- */
const DEBUG_PARAM = 'debug'

const DebugPanel = () => {
  /* ---- State ----- */
  const searchParams = useSearchParams()
  const pathname = usePathname() || ''
  const [isDebug, setIsDebug] = useState(false)
  
  // Zustand state
  const uiState = useUI()
  const userState = useUser()
  const gameState = useGame()

  /* --- Effects --- */
  // Simple debug mode logic - only use URL parameter
  useEffect(() => {
    const debugValue = searchParams?.get(DEBUG_PARAM)
    
    if (debugValue === 'true') {
      setIsDebug(true)
      document.body.classList.add('debug-mode')
    } else {
      // Any other value (including null) - disable debug mode
      setIsDebug(false)
      document.body.classList.remove('debug-mode')
    }
  }, [searchParams, pathname])

  // Don't render anything if not in debug mode
  if (!isDebug) return null;

  // Debug panel UI
  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-black/80 text-white p-4 rounded-lg max-w-[400px] max-h-[80vh] overflow-auto text-xs">
      <h3 className="text-lg font-bold mb-2">Debug Panel</h3>
      <div className="grid grid-cols-1 gap-2">
        <div>
          <h4 className="font-bold">UI State</h4>
          <pre>{JSON.stringify(uiState, null, 2)}</pre>
        </div>
        <div>
          <h4 className="font-bold">User State</h4>
          <pre>{JSON.stringify(userState, null, 2)}</pre>
        </div>
        <div>
          <h4 className="font-bold">Game State</h4>
          <pre>{JSON.stringify(gameState, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}

export default DebugPanel