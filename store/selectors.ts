import { useStore } from './store'

/* --- UI Selectors ---- */
export const useUI = () => {
  const theme = useStore((state) => state.theme)
  const window = useStore((state) => state.window)
  const currentRoute = useStore((state) => state.currentRoute)
  const setTheme = useStore((state) => state.setTheme)
  const setWindowSize = useStore((state) => state.setWindowSize)
  const setCurrentRoute = useStore((state) => state.setCurrentRoute)
  
  return {
    // State
    theme,
    window,
    currentRoute,
    // Actions
    setTheme,
    setWindowSize,
    setCurrentRoute,
  }
}

// Individual property selectors for performance
export const useTheme = () => useStore(state => state.theme)
export const useWindowSize = () => useStore(state => state.window)
export const useCurrentRoute = () => useStore(state => state.currentRoute) 