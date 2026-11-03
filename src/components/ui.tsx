import { useRouter } from 'expo-router'
import { useState, type ReactNode } from 'react'
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ScrollViewProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { IconChevronLeft, IconChevronRight, type Icon } from '@/lib/icons'
import { refreshSync, useSync } from '@/lib/sync'
import { radius, useTheme } from '@/theme'

/* ---------- Text ---------- */

type Variant = 'title' | 'h2' | 'h3' | 'body' | 'small' | 'tiny' | 'mono' | 'stat'

export function Txt({ variant = 'body', color, muted, style, ...rest }: TextProps & { variant?: Variant; color?: string; muted?: boolean }) {
  const t = useTheme()
  return <Text {...rest} style={[styles[variant], { color: color ?? (muted ? t.muted : t.fg) }, style]} />
}

/* ---------- Layout ---------- */

/** A scrolling page. `tab` pages leave room for the floating tab bar. `refresh`: pull down to sync. */
export function Screen({
  children,
  tab,
  refresh,
  contentStyle,
  ...rest
}: ScrollViewProps & { children: ReactNode; tab?: boolean; refresh?: boolean; contentStyle?: StyleProp<ViewStyle> }) {
  const t = useTheme()
  const insets = useSafeAreaInsets()
  const paired = useSync((s) => s.paired)
  const [pulling, setPulling] = useState(false)
  const refreshControl =
    refresh && paired ? (
      <RefreshControl
        refreshing={pulling}
        tintColor={t.muted}
        colors={[t.accent]}
        progressBackgroundColor={t.card}
        progressViewOffset={tab ? insets.top : 0}
        onRefresh={() => {
          setPulling(true)
          refreshSync().finally(() => setPulling(false))
        }}
      />
    ) : undefined
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        refreshControl={refreshControl}
        {...rest}
        style={{ flex: 1, backgroundColor: t.bg }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          { paddingHorizontal: 18, paddingTop: tab ? insets.top + 18 : 8, paddingBottom: (tab ? 104 : 32) + insets.bottom, gap: 14 },
          contentStyle
        ]}>
        {children}
      </ScrollView>
      {tab ? <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: t.bg }} /> : null}
    </View>
  )
}

/** Big page title used on tab pages. */
export function PageTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
      <View style={{ flex: 1, gap: 4 }}>
        <Txt variant="title">{title}</Txt>
        {subtitle ? (
          <Txt variant="small" muted>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right}
    </View>
  )
}

/** Top bar for pushed screens: round back button, centered title, optional action. */
export function StackBar({ title, right }: { title?: string; right?: ReactNode }) {
  const t = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 14,
        paddingBottom: 8,
        backgroundColor: t.bg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
      }}>
      <IconButton icon={IconChevronLeft} label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <Txt variant="h3" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
        {title ?? ''}
      </Txt>
      <View style={{ minWidth: 38, alignItems: 'flex-end' }}>{right}</View>
    </View>
  )
}

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  const t = useTheme()
  return (
    <View
      style={[
        { backgroundColor: t.card, borderColor: t.border, borderWidth: StyleSheet.hairlineWidth * 2, borderRadius: radius.xl },
        padded && { padding: 16 },
        style
      ]}>
      {children}
    </View>
  )
}

export function SectionHeader({ title, icon: Ico, action, onAction }: { title: string; icon?: Icon; action?: string; onAction?: () => void }) {
  const t = useTheme()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      {Ico ? <Ico size={17} color={t.muted} strokeWidth={1.75} /> : null}
      <Txt variant="h3" style={{ flex: 1 }}>
        {title}
      </Txt>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Txt variant="small" color={t.muted}>
            {action}
          </Txt>
          <IconChevronRight size={14} color={t.muted} />
        </Pressable>
      ) : null}
    </View>
  )
}

/* ---------- Controls ---------- */

export function IconButton({ icon: Ico, label, onPress, filled }: { icon: Icon; label: string; onPress?: () => void; filled?: boolean }) {
  const t = useTheme()
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: filled ? t.accent : pressed ? t.card2 : t.card,
        borderWidth: filled ? 0 : StyleSheet.hairlineWidth * 2,
        borderColor: t.border
      })}>
      <Ico size={19} color={filled ? t.accentFg : t.fg} strokeWidth={1.8} />
    </Pressable>
  )
}

export function Button({
  label,
  icon: Ico,
  variant = 'primary',
  onPress,
  style,
  disabled
}: {
  label: string
  icon?: Icon
  variant?: 'primary' | 'ghost' | 'danger'
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  disabled?: boolean
}) {
  const t = useTheme()
  const fg = variant === 'primary' ? t.accentFg : variant === 'danger' ? t.danger : t.fg
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          height: 46,
          borderRadius: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          backgroundColor: variant === 'primary' ? t.accent : t.card,
          borderWidth: variant === 'primary' ? 0 : StyleSheet.hairlineWidth * 2,
          borderColor: t.border
        },
        style
      ]}>
      {Ico ? <Ico size={18} color={fg} strokeWidth={1.9} /> : null}
      <Txt variant="body" color={fg} style={{ fontWeight: '600' }}>
        {label}
      </Txt>
    </Pressable>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange
}: {
  value: T
  options: { value: T; label: string; icon?: Icon }[]
  onChange: (v: T) => void
}) {
  const t = useTheme()
  return (
    <View style={{ flexDirection: 'row', backgroundColor: t.card2, borderRadius: 13, padding: 3, gap: 3 }}>
      {options.map((o) => {
        const on = o.value === value
        const Ico = o.icon
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              height: 34,
              borderRadius: 10,
              flexDirection: 'row',
              gap: 6,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: on ? t.card : 'transparent',
              borderWidth: on ? StyleSheet.hairlineWidth * 2 : 0,
              borderColor: t.border
            }}>
            {Ico ? <Ico size={15} color={on ? t.fg : t.muted} strokeWidth={1.8} /> : null}
            <Txt variant="small" color={on ? t.fg : t.muted} style={{ fontWeight: on ? '600' : '500' }}>
              {o.label}
            </Txt>
          </Pressable>
        )
      })}
    </View>
  )
}

/** Horizontal filter chips. */
export function Chips<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const t = useTheme()
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 18 }}
      style={{ flexGrow: 0, marginHorizontal: -18 }}>
      {options.map((o) => {
        const on = o.value === value
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              paddingHorizontal: 14,
              height: 34,
              borderRadius: 17,
              justifyContent: 'center',
              backgroundColor: on ? t.accentSoft : t.card,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: on ? t.accentLine : t.border
            }}>
            <Txt variant="small" color={on ? t.accent2 : t.muted} style={{ fontWeight: on ? '600' : '500' }}>
              {o.label}
            </Txt>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

/* ---------- Bits ---------- */

export function Badge({ label, color, soft = true }: { label: string; color?: string; soft?: boolean }) {
  const t = useTheme()
  const c = color ?? t.muted
  return (
    <View
      style={{
        paddingHorizontal: 8,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        backgroundColor: soft ? withAlpha(c, t.scheme === 'dark' ? 0.14 : 0.1) : 'transparent',
        borderWidth: soft ? 0 : StyleSheet.hairlineWidth * 2,
        borderColor: t.border
      }}>
      <Txt variant="tiny" color={c} style={{ fontWeight: '600' }}>
        {label}
      </Txt>
    </View>
  )
}

export function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
}

export function Progress({ value, color, height = 6 }: { value: number; color?: string; height?: number }) {
  const t = useTheme()
  return (
    <View style={{ height, borderRadius: height, backgroundColor: t.card2, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', borderRadius: height, backgroundColor: color ?? t.accent }} />
    </View>
  )
}

export function IconTile({ icon: Ico, color, size = 38 }: { icon: Icon; color: string; size?: number }) {
  const t = useTheme()
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: withAlpha(color, t.scheme === 'dark' ? 0.13 : 0.1)
      }}>
      <Ico size={size * 0.5} color={color} strokeWidth={1.8} />
    </View>
  )
}

/** A tappable list row inside a card. */
export function Row({
  title,
  subtitle,
  left,
  right,
  onPress,
  last,
  chevron = true
}: {
  title: string
  subtitle?: string
  left?: ReactNode
  right?: ReactNode
  onPress?: PressableProps['onPress']
  last?: boolean
  chevron?: boolean
}) {
  const t = useTheme()
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: pressed ? t.card2 : 'transparent',
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth * 2,
        borderBottomColor: t.border
      })}>
      {left}
      <View style={{ flex: 1, gap: 3 }}>
        <Txt variant="body" numberOfLines={1} style={{ fontWeight: '500' }}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="small" muted numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right}
      {onPress && chevron ? <IconChevronRight size={16} color={t.faint} /> : null}
    </Pressable>
  )
}

export function Empty({ text }: { text: string }) {
  return (
    <Txt variant="small" muted style={{ textAlign: 'center', paddingVertical: 24 }}>
      {text}
    </Txt>
  )
}

export function withAlpha(hex: string, a: number): string {
  if (!hex.startsWith('#') || hex.length !== 7) return hex
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

const styles = StyleSheet.create<Record<Variant, TextStyle>>({
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.6 },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '600', letterSpacing: -0.3 },
  h3: { fontSize: 16, lineHeight: 22, fontWeight: '600', letterSpacing: -0.15 },
  body: { fontSize: 15, lineHeight: 21 },
  small: { fontSize: 13, lineHeight: 18 },
  tiny: { fontSize: 11.5, lineHeight: 15 },
  mono: { fontSize: 12, lineHeight: 16, fontFamily: 'monospace' },
  stat: { fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.5 }
})
