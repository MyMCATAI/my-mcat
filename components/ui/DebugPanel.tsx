"use client";

import { useEffect, useState } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useUI } from '@/store/selectors'

/* --- Constants ----- */
const DEBUG_PARAM = 'debug'

const DebugPanel = () => {
  /* ---- State ----- */
  const searchParams = useSearchParams()
  const pathname = usePathname() || ''
  const router = useRouter()
  const [isDebug, setIsDebug] = useState(false)
  
  // Use UI store
  const uiState = useUI()

  /* --- Effects --- */
  // Persist debug mode across navigation
  useEffect(() => {
    const debugValue = searchParams?.get(DEBUG_PARAM)
    if (debugValue === 'true') {
      setIsDebug(true)
      localStorage.setItem('debug_mode', 'true')
    } else if (debugValue === null && localStorage.getItem('debug_mode') === 'true') {
      const newUrl = `${pathname}?${DEBUG_PARAM}=true`
      router.replace(newUrl)
    }
  }, [searchParams, pathname, router])

  useEffect(() => {
    // Persist debug mode in localStorage
    const debugMode = localStorage.getItem('debugMode')
    if (debugMode === 'true') {
      document.body.classList.add('debug-mode')
    }
  }, [])

  if (!isDebug) return null

  return (
    <div className="fixed top-0 right-0 z-50 p-4 bg-red-100 bg-opacity-90 max-h-screen overflow-auto shadow-lg border-l border-red-300">
      <div className="space-y-4">
        {/* UI Store State */}
        <div>
          <h3 className="font-bold mb-2 text-black">UI Store State</h3>
          <pre className="bg-white bg-opacity-50 p-2 rounded text-black text-sm">
            {JSON.stringify(uiState, null, 2)}
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