import { format, subDays } from 'date-fns'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native'
import { NoteEditorView, NoteToolbar, useNoteEditor } from '@/components/note-editor'
import { Button, Chips, Screen, StackBar, Txt } from '@/components/ui'
import { IconCheck } from '@/lib/icons'
import { useStore } from '@/lib/store'
import { useKeyboardHeight } from '@/lib/use-keyboard'
import { nowIso, uid } from '@/lib/utils'
import { useTheme } from '@/theme'

const MINUTES = ['15', '30', '45', '60', '90', '120']

/** New entry, or edit an existing one with `?id=`. */
export default function EntryEditor() {
  const t = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const kb = useKeyboardHeight()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const existing = useStore((s) => (id ? s.logs.find((l) => l.id === id) : undefined))
  const upsert = useStore((s) => s.upsert)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [day, setDay] = useState<string>(existing ? existing.date : '0')
  const [minutes, setMinutes] = useState(existing ? String(existing.minutes) : '45')
  const [tags, setTags] = useState(existing ? existing.tags.join(', ') : '')
  // Only save a new body when the note was really edited, so untouched notes stay byte for byte the same.
  const body = useRef<string | null>(null)
  const editor = useNoteEditor(existing?.body ?? '', (md) => (body.current = md))

  const save = () => {
    const date = /^\d{4}-/.test(day) ? day : format(subDays(new Date(), Number(day)), 'yyyy-MM-dd')
    upsert('logs', {
      id: existing?.id ?? uid(),
      date,
      title: title.trim() || 'Untitled entry',
      body: body.current ?? existing?.body ?? '',
      tags: tags
        .split(/[,\s]+/)
        .map((x) => x.replace(/^#/, '').trim().toLowerCase())
        .filter(Boolean),
      minutes: Number(minutes) || 0,
      topicId: existing?.topicId,
      createdAt: existing?.createdAt ?? nowIso()
    })
    router.back()
  }

  const dayOptions = [
    { value: '0', label: 'Today' },
    { value: '1', label: 'Yesterday' },
    { value: '2', label: format(subDays(new Date(), 2), 'EEE d MMM') }
  ]
  if (existing && !['0', '1', '2'].includes(day))
    dayOptions.unshift({ value: existing.date, label: format(new Date(existing.date + 'T12:00:00'), 'EEE d MMM') })
  const minuteOptions = MINUTES.includes(minutes) ? MINUTES : [minutes, ...MINUTES]
  const editing = kb > 0 && editor.focus !== null

  const field = (props: TextInputProps) => (
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
        props.style
      ]}
    />
  )

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingBottom: kb }}>
      <StackBar
        title={existing ? 'Edit entry' : 'New entry'}
        right={
          <Pressable
            onPress={save}
            hitSlop={8}
            accessibilityRole="button"
            style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: t.accentSoft }}>
            <Txt variant="small" color={t.accent} style={{ fontWeight: '600' }}>
              Save
            </Txt>
          </Pressable>
        }
      />
      <Screen keyboardShouldPersistTaps="handled">
        <Label text="Title" />
        {field({ value: title, onChangeText: setTitle, placeholder: 'What did you learn?', autoFocus: false })}

        <Label text="When" />
        <Chips value={day} onChange={setDay} options={dayOptions} />

        <Label text="Time spent" />
        <Chips
          value={minutes}
          onChange={setMinutes}
          options={minuteOptions.map((m) => ({ value: m, label: Number(m) >= 60 ? `${Number(m) / 60}h` : `${m}m` }))}
        />

        <Label text="Tags" />
        {field({ value: tags, onChangeText: setTags, placeholder: 'web, sqli, portswigger', autoCapitalize: 'none' })}

        <Label text="Notes" hint="Type # for a heading, - for a list, ``` for code, [] for a checklist." />
        <View
          style={{
            backgroundColor: t.card,
            borderRadius: 14,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: editor.focus ? t.accentLine : t.border,
            paddingHorizontal: 14,
            paddingVertical: 12
          }}>
          <NoteEditorView editor={editor} placeholder="What did you do? What will you try next?" />
        </View>
      </Screen>
      {editing ? (
        <NoteToolbar editor={editor} />
      ) : (
        <View
          style={{
            paddingHorizontal: 18,
            paddingTop: 10,
            paddingBottom: insets.bottom + 12,
            backgroundColor: t.bg,
            borderTopWidth: StyleSheet.hairlineWidth * 2,
            borderTopColor: t.border
          }}>
          <Button label="Save entry" icon={IconCheck} onPress={save} />
        </View>
      )}
    </View>
  )
}

function Label({ text, hint }: { text: string; hint?: string }) {
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
