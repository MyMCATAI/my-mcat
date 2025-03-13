import { create } from 'zustand'
import { devtools } from 'zustand/middleware'


/* --- Types ---- */
export interface WindowSize {
  width: number
  height: number
  isDesktop: boolean
}

export type ThemeType = 'cyberSpace' | 'sakuraTrees' | 'sunsetCity' | 'mykonosBlue'

//******************************************* UI Slice ****************************************************//
interface UIState {
  window: WindowSize
  currentRoute: string
  theme: ThemeType
}

interface UIActions {
  setWindowSize: (size: WindowSize) => void
  setCurrentRoute: (route: string) => void
  setTheme: (theme: ThemeType) => void
}

export type UISlice = UIState & UIActions

export const useUIStore = create<UISlice>()(
  devtools(
    (set) => ({
      //***********************************************************************************************//
      //************************************** UI State ***********************************************//
      //***********************************************************************************************//
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
      },
    }),
    {
      name: 'ui-store'
    }
  )
)
