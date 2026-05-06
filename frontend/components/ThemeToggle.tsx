'use client'

import { Moon, Sun } from 'lucide-react'
import { useThemeMode } from '@/hooks/useThemeMode'

export function ThemeToggle() {
  const { isDark, toggleTheme, mounted } = useThemeMode()

  if (!mounted) {
    return (
      <button
        className="p-2.5 rounded-base bg-muted border border-border transition-colors duration-300 cursor-not-allowed opacity-50"
        aria-label="Theme toggle"
        disabled
      >
        <Sun className="h-5 w-5 text-muted-foreground" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2.5 rounded-lg border-2 transition-all duration-300
        flex items-center justify-center gap-2 font-medium text-sm
        hover:shadow-lg hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950
        group
        ${isDark 
          ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 text-indigo-300 hover:border-indigo-400 hover:text-indigo-200 focus:ring-indigo-500 shadow-lg shadow-indigo-900/20 dark:shadow-slate-900/50' 
          : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 text-amber-700 hover:border-amber-400 hover:text-amber-800 focus:ring-amber-500 shadow-md shadow-amber-200/50'
        }
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`${isDark ? '☀️ Cambiar a Light Mode' : '🌙 Cambiar a Dark Mode'}`}
    >
      <div className="relative overflow-hidden w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Moon 
            className="h-5 w-5 transition-all duration-300 rotate-0 group-hover:rotate-12 group-hover:scale-110" 
            strokeWidth={1.5}
          />
        ) : (
          <Sun 
            className="h-5 w-5 transition-all duration-300 rotate-0 group-hover:rotate-12 group-hover:scale-110" 
            strokeWidth={1.5}
          />
        )}
      </div>
      <span className="hidden sm:inline text-xs font-semibold transition-all duration-300">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}

