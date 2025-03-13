'use client'

import { useEffect } from 'react'
import { useUI } from '@/store/selectors'
import type { ThemeType } from '@/store/slices/uiSlice'

/* --- Constants ----- */
const scrollbarColors = {
  cyberSpace: '#3b82f6',
  sakuraTrees: '#b973af',
  sunsetCity: '#ff6347',
  mykonosBlue: '#4cb5e6'
}

export default function ThemeInitializer() {
  const { theme, setTheme } = useUI();

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType | null
    if (savedTheme && ['cyberSpace', 'sakuraTrees', 'sunsetCity', 'mykonosBlue'].includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [setTheme])

  // Apply theme classes and CSS variables
  useEffect(() => {
    document.body.classList.remove('theme-cyberSpace', 'theme-sakuraTrees', 'theme-sunsetCity', 'theme-mykonosBlue')
    document.body.classList.add(`theme-${theme}`)
    document.documentElement.style.setProperty('--theme-scrollbar-color', scrollbarColors[theme])
  }, [theme])

  return null
}
