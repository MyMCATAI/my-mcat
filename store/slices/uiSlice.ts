import { create } from 'zustand'
import { devtools } from 'zustand/middleware'


/* --- Types ---- */
export interface WindowSize {
  width: number
  height: number
  isDesktop: boolean
}

export type ThemeType = 'cyberSpace' | 'sakuraTrees' | 'sunsetCity' | 'mykonosBlue'

export interface Navigation {
  page: string;
  subSection: Record<string, any>;
}

// URL path mapping for consistent routing
export const URL_PATHS: Record<string, string> = {
  'kalypso-ai': '/kalypsoai',
  'tests': '/practice-tests',
  'cars': '/cars-suite',
  'tutoring': '/tutoring-suite',
  'ankiclinic': '/ankiclinic'
};

//******************************************* UI Slice ****************************************************//
interface UIState {
  window: WindowSize
  theme: ThemeType
  navigation: Navigation
}

interface UIActions {
  setWindowSize: (size: WindowSize) => void
  setTheme: (theme: ThemeType) => void
  setNavigation: (page: string, subSection?: Record<string, any>) => void
  updateSubSection: (updates: Record<string, any>) => void
  clearNavigation: () => void
  navigateTo: (navigationId: string, router: any) => void
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
      theme: 'cyberSpace',
      navigation: {
        page: '/',
        subSection: {}
      },

      // UI Actions
      setWindowSize: (size) => set({ window: size }),
      setTheme: (theme) => {
        set({ theme })
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', theme)
        }
      },
      setNavigation: (page, subSection = {}) => {
        set({
          navigation: {
            page,
            subSection
          }
        });
      },
      updateSubSection: (updates) => {
        set((state) => ({
          navigation: {
            ...state.navigation,
            subSection: {
              ...state.navigation.subSection,
              ...updates
            }
          }
        }));
      },
      clearNavigation: () => {
        set({
          navigation: {
            page: '',
            subSection: {}
          }
        });
      },
      
      // Combined navigation action that updates state and handles routing
      navigateTo: (navigationId, router) => {
        // Get the URL path from the mapping
        const urlPath = URL_PATHS[navigationId];
        
        if (urlPath) {
          // Update the navigation state
          set({
            navigation: {
              page: urlPath,
              subSection: {}
            }
          });
          
          // Navigate using the router
          router.push(urlPath);
        } else {
          console.warn(`No URL path found for navigation ID: ${navigationId}`);
        }
      },
    }),
    {
      name: 'ui-store'
    }
  )
)
