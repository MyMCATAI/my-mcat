import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/* --- Constants ----- */
export const MOBILE_BREAKPOINT = 640  // sm
export const TABLET_BREAKPOINT = 1024 // lg

/* ----- Types ---- */
interface WindowSize {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

interface UIStore {
  window: WindowSize
  activeTab: string
  currentRoute: string
  isLoading: boolean
  
  // Actions
  setWindowSize: (size: WindowSize) => void
  setActiveTab: (tab: string) => void
  setCurrentRoute: (route: string) => void
}


export const useStore = create<UIStore>()(
  devtools(
    (set) => ({
      window: {
        width: typeof window !== 'undefined' ? window.innerWidth : 1920,
        height: typeof window !== 'undefined' ? window.innerHeight : 1080,
        isMobile: false,
        isTablet: false,
        isDesktop: true
      },
      activeTab: 'home',
      currentRoute: '/',
      isLoading: false,

      setWindowSize: (size) => set({ window: size }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setCurrentRoute: (route) => set({ currentRoute: route })
    }),
    { name: 'UI Store' }
  )
) 