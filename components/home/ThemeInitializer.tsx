'use client'

import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeInitializer() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'cyberSpace' | 'sakuraTrees' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [setTheme])

  useEffect(() => {
    if (theme === 'sakuraTrees') {
      document.body.classList.add('theme-sakuraTrees')
    } else {
      document.body.classList.remove('theme-sakuraTrees')
    }
  }, [theme])

  return null
}
