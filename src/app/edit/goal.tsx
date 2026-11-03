import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Alert } from 'react-native'
import { AreaPicker, confirmDelete, DateField, EditScreen, Input, Label, need, parseDay, useClose } from '@/components/form'
import { Segmented } from '@/components/ui'
import { useStore } from '@/lib/store'
import { nowIso, today, uid } from '@/lib/utils'

/** New goal, or edit one with `?id=`. */
export default function GoalEditor() {
  const close = useClose()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const existing = useStore((s) => (id ? s.goals.find((g) => g.id === id) : undefined))
  const upsert = useStore((s) => s.upsert)
  const remove = useStore((s) => s.remove)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [deadline, setDeadline] = useState(existing?.deadline ?? '')
  const [areaId, setAreaId] = useState(existing?.areaId)
  const [done, setDone] = useState(existing?.done ?? false)

  const save = () => {
    if (!title.trim()) return need('a title')
    const day = parseDay(deadline)
    if (day === null) return Alert.alert('Check the date', 'Use the format YYYY-MM-DD, for example 2026-11-03.')
    upsert('goals', {
      ...existing,
      id: existing?.id ?? uid(),
      title: title.trim(),
      deadline: day,
      areaId,
      done,
      doneAt: done ? (existing?.doneAt ?? today()) : undefined,
      createdAt: existing?.createdAt ?? nowIso()
    })
    close()
  }

  return (
    <EditScreen
      title={existing ? 'Edit goal' : 'New goal'}
      onSave={save}
      onDelete={
        existing
          ? () =>
              confirmDelete('Delete goal?', `"${existing.title}" will be removed.`, () => {
                remove('goals', existing.id)
                close()
              })
          : undefined
      }>
      <Label text="Goal" />
      <Input value={title} onChangeText={setTitle} placeholder="e.g. Finish 5 SQL injection labs" autoFocus={!existing} />

      <Label text="Deadline" />
      <DateField value={deadline} onChange={setDeadline} />

      <AreaPicker value={areaId} onChange={setAreaId} />

      {existing ? (
        <>
          <Label text="Status" />
          <Segmented
            value={done ? 'done' : 'open'}
            onChange={(v) => setDone(v === 'done')}
            options={[
              { value: 'open', label: 'Open' },
              { value: 'done', label: 'Done' }
            ]}
          />
        </>
      ) : null}
    </EditScreen>
  )
}
