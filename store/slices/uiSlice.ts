import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useATSStore } from './atsSlice'

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
  activeTab: string
}

interface UIActions {
  setWindowSize: (size: WindowSize) => void
  setCurrentRoute: (route: string) => void
  setTheme: (theme: ThemeType) => void
  setActiveTab: (tab: string) => void
}

export type UISlice = UIState & UIActions

/* --- Utils ---- */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const useUIStore = create<UISlice>()(
  devtools(
    (set, get) => ({
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
      activeTab: 'KalypsoAI',

      // UI Actions
      setWindowSize: (size) => set({ window: size }),
      setCurrentRoute: (route) => set({ currentRoute: route }),
      setTheme: (theme) => {
        set({ theme })
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', theme)
        }
      },
      setActiveTab: (tab) => {
        set({ activeTab: tab })
        // Handle ATS timer in the ATS store
        if (tab === 'AdaptiveTutoringSuite') {
          useATSStore.getState().startTimer()
        } else {
          useATSStore.getState().resetState()
        }
      }
    }),
    {
      name: 'ui-store'
    }
  )
)
