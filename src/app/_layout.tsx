import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavThemeProvider } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { startSync } from '@/lib/sync'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { ThemeProvider, useTheme } from '@/theme'

SplashScreen.preventAutoHideAsync().catch(() => {})

function Root() {
  const t = useTheme()
  const hydrated = useStore((s) => s.hydrated)

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(t.bg).catch(() => {})
  }, [t.bg])

  useEffect(() => {
    if (!hydrated) return
    SplashScreen.hideAsync().catch(() => {})
    void startSync()
  }, [hydrated])

  const base = t.scheme === 'dark' ? DarkTheme : DefaultTheme
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: t.bg, card: t.bg, text: t.fg, border: t.border, primary: t.accent }
  }

  return (
    <NavThemeProvider value={navTheme}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg }, animation: 'fade_from_bottom' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="journal/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        {['area', 'topic', 'lab', 'resource', 'cert', 'goal'].map((k) => (
          <Stack.Screen key={k} name={`edit/${k}`} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        ))}
      </Stack>
    </NavThemeProvider>
  )
}

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </KeyboardProvider>
  )
}
