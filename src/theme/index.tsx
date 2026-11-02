import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { useStore } from '@/lib/store'
import { makeTheme, type Theme } from './tokens'

const ThemeContext = createContext<Theme>(makeTheme('dark'))

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme()
  const pref = useStore((s) => s.settings.theme)
  const accent = useStore((s) => s.settings.accent)
  const scheme = pref === 'system' ? (system === 'light' ? 'light' : 'dark') : pref
  const theme = useMemo(() => makeTheme(scheme, accent), [scheme, accent])
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTheme(): Theme {
  return useContext(ThemeContext)
}

export * from './tokens'
