'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function useThemeMode() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return {
      isDark: true,
      theme: 'dark',
      toggleTheme: () => {},
      mounted: false,
    }
  }

  const currentTheme = resolvedTheme || theme || 'dark'
  const isDark = currentTheme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return {
    isDark,
    theme: currentTheme,
    toggleTheme,
    mounted,
  }
}
