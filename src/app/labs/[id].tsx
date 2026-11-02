import { useLocalSearchParams } from 'expo-router'
import { useRef, useState } from 'react'
import { Linking, Pressable, View } from 'react-native'
import { NoteEditorView, NoteToolbar, useNoteEditor } from '@/components/note-editor'
import { NoteView } from '@/components/note-view'
import { Badge, Button, Card, Dot, Empty, Screen, Segmented, StackBar, Txt } from '@/components/ui'
import { diffColor } from '@/lib/colors'
import { IconExternalLink } from '@/lib/icons'
import { DIFF_LABEL } from '@/lib/meta'
import { platformColor } from '@/lib/platforms'
import { useStore } from '@/lib/store'
import type { Lab, WorkStatus } from '@/lib/types'
import { useKeyboardHeight } from '@/lib/use-keyboard'
import { fmtDate, fmtHours, hostOf, today } from '@/lib/utils'
import { useTheme } from '@/theme'

export default function LabDetail() {
  const t = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const lab = useStore((s) => s.labs.find((l) => l.id === id))
  const upsert = useStore((s) => s.upsert)
  const kb = useKeyboardHeight()
  const [editing, setEditing] = useState(false)
  if (!lab)
    return (
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <StackBar title="Lab" />
        <Empty text="This lab was not found." />
      </View>
    )
  if (editing) return <WriteupEditor lab={lab} onDone={() => setEditing(false)} keyboard={kb} />
  const setStatus = (status: WorkStatus) => upsert('labs', { ...lab, status, date: status === 'done' ? (lab.date ?? today()) : lab.date })

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StackBar title="Lab" />
      <Screen>
        <View style={{ gap: 10, paddingHorizontal: 2, marginTop: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Dot color={t.color(platformColor(lab.platform))} />
            <Txt variant="small" muted>
              {lab.platform}
            </Txt>
          </View>
          <Txt variant="h2" style={{ fontSize: 24, lineHeight: 30 }}>
            {lab.name}
          </Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <Badge label={DIFF_LABEL[lab.difficulty]} color={diffColor(t, lab.difficulty)} soft={false} />
            {lab.minutes > 0 && <Badge label={fmtHours(lab.minutes)} />}
            {lab.date ? <Badge label={fmtDate(lab.date, 'd MMM yyyy')} /> : null}
            {lab.tags.map((x) => (
              <Badge key={x} label={`#${x}`} color={t.accent2} />
            ))}
          </View>
        </View>
        <Segmented
          value={lab.status}
          onChange={setStatus}
          options={[
            { value: 'todo', label: 'To do' },
            { value: 'doing', label: 'In progress' },
            { value: 'done', label: 'Done' }
          ]}
        />
        <Card style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Txt variant="h3" style={{ flex: 1 }}>
              Writeup
            </Txt>
            <Pressable onPress={() => setEditing(true)} hitSlop={8} accessibilityRole="button">
              <Txt variant="small" color={t.accent} style={{ fontWeight: '600' }}>
                {lab.writeup.trim() ? 'Edit' : 'Write'}
              </Txt>
            </Pressable>
          </View>
          {lab.writeup.trim() ? (
            <NoteView source={lab.writeup} onChange={(writeup) => upsert('labs', { ...lab, writeup })} />
          ) : (
            <Txt variant="small" muted>
              No writeup yet. Write down the steps while they are fresh.
            </Txt>
          )}
        </Card>
        {lab.url ? (
          <Button label={`Open ${hostOf(lab.url) || 'link'}`} icon={IconExternalLink} variant="ghost" onPress={() => Linking.openURL(lab.url)} />
        ) : null}
      </Screen>
    </View>
  )
}

function WriteupEditor({ lab, onDone, keyboard }: { lab: Lab; onDone: () => void; keyboard: number }) {
  const t = useTheme()
  const upsert = useStore((s) => s.upsert)
  const body = useRef<string | null>(null)
  const editor = useNoteEditor(lab.writeup, (md) => (body.current = md))
  const done = () => {
    if (body.current !== null && body.current !== lab.writeup) upsert('labs', { ...lab, writeup: body.current })
    onDone()
  }
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingBottom: keyboard }}>
      <StackBar
        title="Writeup"
        right={
          <Pressable
            onPress={done}
            hitSlop={8}
            accessibilityRole="button"
            style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: t.accentSoft }}>
            <Txt variant="small" color={t.accent} style={{ fontWeight: '600' }}>
              Done
            </Txt>
          </Pressable>
        }
      />
      <Screen keyboardShouldPersistTaps="handled">
        <Txt variant="small" muted style={{ paddingHorizontal: 2 }}>
          {lab.name}
        </Txt>
        <Card style={{ borderColor: editor.focus ? t.accentLine : t.border }}>
          <NoteEditorView editor={editor} placeholder="Recon, foothold, privilege escalation and what you learned." />
        </Card>
      </Screen>
      {keyboard > 0 && editor.focus ? <NoteToolbar editor={editor} /> : null}
    </View>
  )
}
