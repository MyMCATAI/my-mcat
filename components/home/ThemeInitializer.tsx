'use client'

import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

const scrollbarColors = {
  cyberSpace: '#3b82f6',
  sakuraTrees: '#b973af',
  sunsetCity: '#ff6347',
  mykonosBlue: '#4cb5e6'
}

export default function ThemeInitializer() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'cyberSpace' | 'sakuraTrees' | 'sunsetCity' | 'mykonosBlue' | null
    if (savedTheme && ['cyberSpace', 'sakuraTrees', 'sunsetCity', 'mykonosBlue'].includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [setTheme])

  useEffect(() => {
    document.body.classList.remove('theme-cyberSpace', 'theme-sakuraTrees', 'theme-sunsetCity', 'theme-mykonosBlue')
    document.body.classList.add(`theme-${theme}`)
    document.documentElement.style.setProperty('--theme-scrollbar-color', scrollbarColors[theme])
  }, [theme])

  return null
}
