import { BlurView } from 'expo-blur'
import type { BottomTabBarProps } from 'expo-router/js-tabs'
import { useEffect, useState } from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { IconDotsCircleHorizontal, IconFlag3, IconHome, IconMap2, IconNotebook, type Icon } from '@/lib/icons'
import { alpha, useTheme } from '@/theme'
import { Txt } from './ui'

const META: Record<string, { label: string; icon: Icon }> = {
  index: { label: 'Home', icon: IconHome },
  journal: { label: 'Journal', icon: IconNotebook },
  roadmap: { label: 'Roadmap', icon: IconMap2 },
  labs: { label: 'Labs', icon: IconFlag3 },
  more: { label: 'More', icon: IconDotsCircleHorizontal }
}

const BAR_H = 62
const PAD = 5
const SPRING = { damping: 22, stiffness: 240, mass: 0.7 }

/**
 * Floating pill tab bar. A soft accent pill slides to the active tab.
 * iOS gets a real blur behind it; Android uses a see-through fill
 * (a live blur there needs the whole screen wrapped, which costs too much).
 */
// Mostly solid so content behind the bar barely shows. iOS is a little lower
// because the blur underneath already softens what is behind it.
const FILL_OPACITY = {
  ios: { dark: 0.92, light: 0.93 },
  android: { dark: 0.94, light: 0.95 }
} as const

export function TabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const t = useTheme()
  const dark = t.scheme === 'dark'
  const routes = state.routes.filter((r) => META[r.name])
  const active = Math.max(
    0,
    routes.findIndex((r) => r.key === state.routes[state.index]?.key)
  )
  const [width, setWidth] = useState(0)
  const tabW = width > 0 ? (width - PAD * 2) / routes.length : 0
  const x = useSharedValue(0)

  useEffect(() => {
    if (tabW) x.value = withSpring(PAD + active * tabW, SPRING)
  }, [active, tabW, x])

  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }))

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingBottom: Math.max(insets.bottom, 10) + 6 }}>
      <View
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width
          if (!width) x.value = PAD + active * ((w - PAD * 2) / routes.length)
          setWidth(w)
        }}
        style={{
          height: BAR_H,
          borderRadius: 999,
          shadowColor: '#000',
          shadowOpacity: dark ? 0.4 : 0.1,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
          backgroundColor: 'transparent'
        }}>
        <View style={[StyleSheet.absoluteFill, { borderRadius: 999, overflow: 'hidden' }]}>
          {Platform.OS === 'ios' ? (
            <BlurView tint={dark ? 'systemThinMaterialDark' : 'systemThinMaterialLight'} intensity={40} style={StyleSheet.absoluteFill} />
          ) : null}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: alpha(t.card, FILL_OPACITY[Platform.OS === 'ios' ? 'ios' : 'android'][dark ? 'dark' : 'light']),
                borderRadius: 999,
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
              }
            ]}
          />
        </View>

        {tabW ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: PAD,
                left: 0,
                width: tabW,
                height: BAR_H - PAD * 2,
                borderRadius: 999,
                backgroundColor: alpha(t.accent, dark ? 0.16 : 0.11),
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderColor: alpha(t.accent, dark ? 0.2 : 0.16)
              },
              pill
            ]}
          />
        ) : null}

        <View style={{ flex: 1, flexDirection: 'row', paddingHorizontal: PAD }}>
          {routes.map((route, i) => {
            const meta = META[route.name]
            const focused = i === active
            const Ico = meta.icon
            const onPress = () => {
              const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
              if (!focused && !event.defaultPrevented) navigateToTab(route.key)
            }
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="tab"
                accessibilityLabel={meta.label}
                accessibilityState={{ selected: focused }}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Ico size={21} color={focused ? t.accent : t.muted} strokeWidth={focused ? 2 : 1.6} />
                <Txt
                  variant="tiny"
                  color={focused ? t.accent : t.muted}
                  style={{ fontSize: 10.5, fontWeight: focused ? '600' : '500', opacity: focused ? 1 : 0.7 }}>
                  {meta.label}
                </Txt>
              </Pressable>
            )
          })}
        </View>
      </View>
    </View>
  )
}
