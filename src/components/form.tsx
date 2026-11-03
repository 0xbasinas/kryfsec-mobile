import { addDays, addMonths, format, isValid, parseISO } from 'date-fns'
import { useRouter } from 'expo-router'
import type { ReactNode } from 'react'
import { Alert, Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { IconCheck, IconTrash } from '@/lib/icons'
import { useStore } from '@/lib/store'
import { useKeyboardHeight } from '@/lib/use-keyboard'
import { fmtDate } from '@/lib/utils'
import { useTheme } from '@/theme'
import { Button, Chips, Screen, StackBar, Txt } from './ui'

/** A full-screen form: Save in the top bar and at the bottom, optional Delete. */
export function EditScreen({ title, onSave, onDelete, children }: { title: string; onSave: () => void; onDelete?: () => void; children: ReactNode }) {
  const t = useTheme()
  const insets = useSafeAreaInsets()
  const kb = useKeyboardHeight()
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingBottom: kb }}>
      <StackBar
        title={title}
        right={
          <Pressable
            onPress={onSave}
            hitSlop={8}
            accessibilityRole="button"
            style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: t.accentSoft }}>
            <Txt variant="small" color={t.accent} style={{ fontWeight: '600' }}>
              Save
            </Txt>
          </Pressable>
        }
      />
      <Screen keyboardShouldPersistTaps="handled">{children}</Screen>
      {kb > 0 ? null : (
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            paddingHorizontal: 18,
            paddingTop: 10,
            paddingBottom: insets.bottom + 12,
            backgroundColor: t.bg,
            borderTopWidth: StyleSheet.hairlineWidth * 2,
            borderTopColor: t.border
          }}>
          {onDelete ? <Button label="Delete" icon={IconTrash} variant="danger" onPress={onDelete} /> : null}
          <Button label="Save" icon={IconCheck} onPress={onSave} style={{ flex: 1 }} />
        </View>
      )}
    </View>
  )
}

export function Label({ text, hint }: { text: string; hint?: string }) {
  return (
    <View style={{ marginBottom: -6, marginTop: 2, gap: 2 }}>
      <Txt variant="small" style={{ fontWeight: '600' }}>
        {text}
      </Txt>
      {hint ? (
        <Txt variant="tiny" muted>
          {hint}
        </Txt>
      ) : null}
    </View>
  )
}

export function Input(props: TextInputProps) {
  const t = useTheme()
  return (
    <TextInput
      placeholderTextColor={t.faint}
      {...props}
      style={[
        {
          color: t.fg,
          fontSize: 15,
          backgroundColor: t.card,
          borderRadius: 14,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: t.border,
          paddingHorizontal: 14,
          paddingVertical: 12
        },
        props.multiline && { minHeight: 110, textAlignVertical: 'top' },
        props.style
      ]}
    />
  )
}

/** Ask before deleting. */
export function confirmDelete(title: string, text: string, onYes: () => void) {
  Alert.alert(title, text, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onYes }
  ])
}

/** Shown when a required field is empty. Returns false so callers can `return need(...)`. */
export function need(what: string): false {
  Alert.alert(`Add ${what}`, `Please fill in ${what} first.`)
  return false
}

/** `YYYY-MM-DD` text -> date string, `undefined` when empty, `null` when not a real date. */
export function parseDay(s: string): string | undefined | null {
  const v = s.trim()
  if (!v) return undefined
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || !isValid(parseISO(v))) return null
  return v
}

/** Optional date: quick picks plus a text field for an exact day. */
export function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const day = (d: Date) => format(d, 'yyyy-MM-dd')
  const now = new Date()
  const picks = [
    { value: '', label: 'None' },
    { value: day(addDays(now, 7)), label: 'In 1 week' },
    { value: day(addMonths(now, 1)), label: 'In 1 month' },
    { value: day(addMonths(now, 3)), label: 'In 3 months' }
  ]
  const known = picks.some((p) => p.value === value)
  const shown = known || parseDay(value) == null ? picks : [{ value, label: fmtDate(value, 'd MMM yyyy') }, ...picks]
  return (
    <>
      <Chips value={value} onChange={onChange} options={shown} />
      <Input value={value} onChangeText={onChange} placeholder="YYYY-MM-DD" autoCapitalize="none" keyboardType="numbers-and-punctuation" />
    </>
  )
}

/** Pick a skill area, or none. */
export function AreaPicker({ value, onChange }: { value: string | undefined; onChange: (v: string | undefined) => void }) {
  const areas = useStore((s) => s.areas)
  if (areas.length === 0) return null
  return (
    <>
      <Label text="Skill area" />
      <Chips
        value={value ?? ''}
        onChange={(v) => onChange(v || undefined)}
        options={[{ value: '', label: 'None' }, ...areas.map((a) => ({ value: a.id, label: a.name }))]}
      />
    </>
  )
}

/** Comma or space separated tags -> clean list (same rules as journal entries). */
export function parseTags(s: string): string[] {
  return [
    ...new Set(
      s
        .split(/[,\s]+/)
        .map((x) => x.replace(/^#/, '').trim().toLowerCase())
        .filter(Boolean)
    )
  ]
}

/** Close the form. */
export function useClose() {
  const router = useRouter()
  return () => (router.canGoBack() ? router.back() : router.replace('/'))
}
