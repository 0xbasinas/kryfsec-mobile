import type { BottomTabBarProps } from 'expo-router/js-tabs'
import { Pressable, StyleSheet, View } from 'react-native'
import { IconDotsCircleHorizontal, IconFlag3, IconHome, IconMap2, IconNotebook, type Icon } from '@/lib/icons'
import { useTheme } from '@/theme'
import { Txt } from './ui'

const META: Record<string, { label: string; icon: Icon }> = {
  index: { label: 'Home', icon: IconHome },
  journal: { label: 'Journal', icon: IconNotebook },
  roadmap: { label: 'Roadmap', icon: IconMap2 },
  labs: { label: 'Labs', icon: IconFlag3 },
  more: { label: 'More', icon: IconDotsCircleHorizontal }
}

/** Floating, rounded tab bar in the calm CyberJourney style. */
export function TabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const t = useTheme()
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 6,
        paddingBottom: Math.max(insets.bottom, 10) + 4,
        paddingHorizontal: 14,
        backgroundColor: t.bg
      }}>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: t.scheme === 'dark' ? t.chrome : t.card,
          borderRadius: 24,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: t.borderStrong,
          paddingVertical: 7,
          paddingHorizontal: 6,
          shadowColor: '#000',
          shadowOpacity: t.scheme === 'dark' ? 0.35 : 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10
        }}>
        {state.routes.map((route, index) => {
          const meta = META[route.name]
          if (!meta) return null
          const focused = index === state.index
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
              accessibilityState={{ selected: focused }}
              style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 2 }}>
              <View
                style={{
                  width: 48,
                  height: 30,
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: focused ? t.accentSoft : 'transparent'
                }}>
                <Ico size={21} color={focused ? t.accent : t.muted} strokeWidth={focused ? 2 : 1.7} />
              </View>
              <Txt variant="tiny" color={focused ? t.fg : t.muted} style={{ fontWeight: focused ? '600' : '500', fontSize: 11 }}>
                {meta.label}
              </Txt>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
