"use client";

import { useStore as useUIStore } from '@/store/uiStore'
import { useAnkiClinicStore } from '@/store/useAnkiClinicStore'
import { useEffect, useState } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'

/* --- Constants ----- */
const DEBUG_PARAM = 'debug'

const DebugPanel = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname() || ''
  const router = useRouter()
  const [isDebug, setIsDebug] = useState(false)
  
  // Use both stores
  const uiStore = useUIStore()
  const gameStore = useAnkiClinicStore()

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

  if (!isDebug) return null

  return (
    <div className="fixed top-0 right-0 z-50 p-4 bg-red-100 bg-opacity-90 max-h-screen overflow-auto shadow-lg border-l border-red-300">
      <div className="space-y-4">
        {/* UI State section */}
        <div>
          <h3 className="font-bold mb-2 text-black">UI State</h3>
          <pre className="bg-white bg-opacity-50 p-2 rounded text-black text-sm">
            {JSON.stringify({
              activeTab: uiStore.activeTab,
              currentRoute: uiStore.currentRoute,
              isLoading: uiStore.isLoading
            }, null, 2)}
          </pre>
        </div>

        {/* Window Size section */}
        <div>
          <h3 className="font-bold mb-2 text-black">Window Size</h3>
          <pre className="bg-white bg-opacity-50 p-2 rounded text-black text-sm">
            {JSON.stringify(uiStore.window, null, 2)}
          </pre>
        </div>

        {/* Progress State */}
        <div>
          <h3 className="font-bold mb-2 text-black">Progress State</h3>
          <pre className="bg-white bg-opacity-50 p-2 rounded text-black text-sm">
            {JSON.stringify({
              ...gameStore.progress,
              activeRooms: Array.from(gameStore.progress.activeRooms || new Set())
            }, null, 2)}
          </pre>
        </div>

        {/* Quiz State */}
        <div>
          <h3 className="font-bold mb-2 text-black">Quiz State</h3>
          <pre className="bg-white bg-opacity-50 p-2 rounded text-black text-sm">
            {JSON.stringify(gameStore.quiz, null, 2)}
          </pre>
        </div>

        <div className="fixed bottom-4 right-4">
          <div className="text-black text-[10px] opacity-70 bg-white bg-opacity-50 px-2 py-1 rounded">
            Debug Mode: ON | Route: {uiStore.currentRoute}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebugPanel 