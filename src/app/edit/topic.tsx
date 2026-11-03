import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { confirmDelete, EditScreen, Input, Label, need, useClose } from '@/components/form'
import { Segmented } from '@/components/ui'
import { useStore } from '@/lib/store'
import type { TopicStatus } from '@/lib/types'
import { nowIso, uid } from '@/lib/utils'

/** New topic in `?areaId=`, or edit one with `?id=`. */
export default function TopicEditor() {
  const close = useClose()
  const { id, areaId } = useLocalSearchParams<{ id?: string; areaId?: string }>()
  const existing = useStore((s) => (id ? s.topics.find((x) => x.id === id) : undefined))
  const upsert = useStore((s) => s.upsert)
  const remove = useStore((s) => s.remove)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [status, setStatus] = useState<TopicStatus>(existing?.status ?? 'todo')
  const [notes, setNotes] = useState(existing?.notes ?? '')

  const save = () => {
    if (!title.trim()) return need('a title')
    const area = existing?.areaId ?? areaId
    if (!area) return close()
    upsert('topics', { ...existing, id: existing?.id ?? uid(), areaId: area, title: title.trim(), status, notes, updatedAt: nowIso(), sample: false })
    close()
  }

  return (
    <EditScreen
      title={existing ? 'Edit topic' : 'New topic'}
      onSave={save}
      onDelete={
        existing
          ? () =>
              confirmDelete('Delete topic?', `"${existing.title}" will be removed from your roadmap.`, () => {
                remove('topics', existing.id)
                close()
              })
          : undefined
      }>
      <Label text="Title" />
      <Input value={title} onChangeText={setTitle} placeholder="e.g. Burp Suite basics" autoFocus={!existing} />

      <Label text="Status" />
      <Segmented
        value={status}
        onChange={setStatus}
        options={[
          { value: 'todo', label: 'To do' },
          { value: 'learning', label: 'Learning' },
          { value: 'done', label: 'Done' }
        ]}
      />

      <Label text="Notes" />
      <Input value={notes} onChangeText={setNotes} placeholder="Links, key ideas, what to do next…" multiline />
    </EditScreen>
  )
}
