import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/* --- Constants ----- */
export const MOBILE_BREAKPOINT = 640  // sm
export const TABLET_BREAKPOINT = 1024 // lg

/* --- Types ---- */
interface WindowSize {
  width: number
  height: number
  isDesktop: boolean
}

export type ThemeType = 'cyberSpace' | 'sakuraTrees' | 'sunsetCity' | 'mykonosBlue'

/* --- Store Slices ---- */
interface UISlice {
  window: WindowSize
  currentRoute: string
  theme: ThemeType
  setWindowSize: (size: WindowSize) => void
  setCurrentRoute: (route: string) => void
  setTheme: (theme: ThemeType) => void
}

/* --- Store Type ---- */
type Store = UISlice

/* --- Create Store ---- */
export const useStore = create<Store>()(
  devtools(
    (set) => ({
      // UI State
      window: {
        width: typeof window !== 'undefined' ? window.innerWidth : 1920,
        height: typeof window !== 'undefined' ? window.innerHeight : 1080,
        isDesktop: true
      },
      currentRoute: '/',
      theme: 'cyberSpace',

      // UI Actions
      setWindowSize: (size) => set({ window: size }),
      setCurrentRoute: (route) => set({ currentRoute: route }),
      setTheme: (theme) => {
        set({ theme })
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', theme)
        }
      }
    }),
    { name: 'UI Store' }
  )
) 