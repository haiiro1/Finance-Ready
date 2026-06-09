import { createContext } from 'react'

export type Theme = 'dark' | 'light' | 'system'

export type ThemeProviderState = {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

export const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => null,
})