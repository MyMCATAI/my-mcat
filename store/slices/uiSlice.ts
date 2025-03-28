import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'


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
  
  // New navigation state
  navigation: {
    page: string
    subSection: Record<string, any>
  }
  
  // Content context
  context: Record<string, any>
}

interface UIActions {
  setWindowSize: (size: WindowSize) => void
  setCurrentRoute: (route: string) => void
  setTheme: (theme: ThemeType) => void
  
  // New navigation actions
  setPage: (page: string) => void
  setSubSection: (updates: Record<string, any>) => void
  setContext: (updates: Record<string, any>) => void
  clearContext: () => void
}

export type UISlice = UIState & UIActions

export const useUIStore = create<UISlice>()(
  persist(
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
        
        // Initialize navigation state
        navigation: {
          page: 'KalypsoAI',
          subSection: {}
        },
        
        // Initialize content context
        context: {},

        // UI Actions
        setWindowSize: (size) => set({ window: size }),
        setCurrentRoute: (route) => set({ currentRoute: route }),
        setTheme: (theme) => {
          set({ theme })
          if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme)
          }
        },
        
        // Navigation actions
        setPage: (page) => {
          console.log(`[uiSlice] setPage called with: ${page}`);
          // Only update if the page is actually changing
          set((state) => {
            if (state.navigation.page === page) {
              console.log(`[uiSlice] setPage - no change needed, page already: ${page}`);
              return {}; // Return empty object = no state change
            }
            console.log(`[uiSlice] setPage - updating from ${state.navigation.page} to ${page}`);
            return {
              navigation: {
                ...state.navigation,
                page
              }
            };
          });
        },
        
        setSubSection: (updates) => set((state) => ({
          navigation: {
            ...state.navigation,
            subSection: {
              ...state.navigation.subSection,
              ...updates
            }
          }
        })),
        
        setContext: (updates) => set((state) => ({
          context: {
            ...state.context,
            ...updates
          }
        })),
        
        clearContext: () => set({ context: {} })
      }),
      {
        name: 'ui-store'
      }
    ),
    {
      name: 'ui-navigation-storage',
      partialize: (state) => ({
        navigation: state.navigation,
        context: state.context
      })
    }
  )
)
