"use client";

import { useAnkiClinicStore } from '@/store/useAnkiClinicStore'
import { useEffect, useState } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'

const DebugPanel = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname() || '' // Provide default empty string
  const [isDebug, setIsDebug] = useState(false)
  const store = useAnkiClinicStore()

  useEffect(() => {
    setIsDebug(searchParams?.get('debug') === 'true')
  }, [searchParams])

  if (!isDebug) return null

  return (
    <div className="fixed right-0 top-[4rem] bottom-0 bg-red-500/90 text-white p-4 overflow-y-auto w-[300px] font-mono text-xs z-[99999]">
      <div className="space-y-4">
        <div>
          <h3 className="font-bold mb-2">Current Route</h3>
          <pre>{pathname}</pre>
        </div>

        {pathname.includes('ankiclinic') && (
          <>
            <div>
              <h3 className="font-bold mb-2">UI State</h3>
              <pre>{JSON.stringify(store.ui, null, 2)}</pre>
            </div>

            <div>
              <h3 className="font-bold mb-2">Progress State</h3>
              <pre>{JSON.stringify({
                ...store.progress,
                activeRooms: Array.from(store.progress.activeRooms)
              }, null, 2)}</pre>
            </div>

            <div>
              <h3 className="font-bold mb-2">Quiz State</h3>
              <pre>{JSON.stringify(store.quiz, null, 2)}</pre>
            </div>
          </>
        )}

        <div className="fixed bottom-4 right-4">
          <div className="text-[10px] opacity-70">
            Debug Mode: ON | Route: {pathname}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebugPanel 