import { useState, useCallback, useEffect } from 'react'

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'autoiq-theme'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'dark' || stored === 'light') return stored
  } catch {}
  return getSystemTheme()
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    root.setAttribute('data-theme', theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
  }, [theme])

  // Sync with system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(e.matches ? 'light' : 'dark')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }, [])

  return { theme, toggleTheme, isDark: theme === 'dark' }
}
