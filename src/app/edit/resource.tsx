import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Linking } from 'react-native'
import { AreaPicker, confirmDelete, EditScreen, Input, Label, need, useClose } from '@/components/form'
import { Button, Chips, Segmented } from '@/components/ui'
import { IconExternalLink } from '@/lib/icons'
import { KIND_META } from '@/lib/meta'
import { useStore } from '@/lib/store'
import type { ResourceKind, WorkStatus } from '@/lib/types'
import { hostOf, nowIso, uid } from '@/lib/utils'

/** New resource, or edit one with `?id=`. */
export default function ResourceEditor() {
  const close = useClose()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const existing = useStore((s) => (id ? s.resources.find((r) => r.id === id) : undefined))
  const upsert = useStore((s) => s.upsert)
  const remove = useStore((s) => s.remove)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [kind, setKind] = useState<ResourceKind>(existing?.kind ?? 'course')
  const [url, setUrl] = useState(existing?.url ?? '')
  const [status, setStatus] = useState<WorkStatus>(existing?.status ?? 'todo')
  const [free, setFree] = useState(existing?.free ?? true)
  const [areaId, setAreaId] = useState(existing?.areaId)
  const [notes, setNotes] = useState(existing?.notes ?? '')

  const save = () => {
    if (!title.trim()) return need('a title')
    upsert('resources', {
      ...existing,
      id: existing?.id ?? uid(),
      title: title.trim(),
      kind,
      url: url.trim(),
      status,
      free,
      areaId,
      notes,
      createdAt: existing?.createdAt ?? nowIso()
    })
    close()
  }

  return (
    <EditScreen
      title={existing ? 'Edit resource' : 'New resource'}
      onSave={save}
      onDelete={
        existing
          ? () =>
              confirmDelete('Delete resource?', `"${existing.title}" will be removed.`, () => {
                remove('resources', existing.id)
                close()
              })
          : undefined
      }>
      <Label text="Title" />
      <Input value={title} onChangeText={setTitle} placeholder="e.g. PortSwigger Web Security Academy" autoFocus={!existing} />

      <Label text="Kind" />
      <Chips value={kind} onChange={setKind} options={(Object.keys(KIND_META) as ResourceKind[]).map((k) => ({ value: k, label: KIND_META[k].label }))} />

      <Label text="Status" />
      <Segmented
        value={status}
        onChange={setStatus}
        options={[
          { value: 'todo', label: 'To do' },
          { value: 'doing', label: 'In progress' },
          { value: 'done', label: 'Done' }
        ]}
      />

      <Label text="Price" />
      <Segmented
        value={free ? 'free' : 'paid'}
        onChange={(v) => setFree(v === 'free')}
        options={[
          { value: 'free', label: 'Free' },
          { value: 'paid', label: 'Paid' }
        ]}
      />

      <AreaPicker value={areaId} onChange={setAreaId} />

      <Label text="Link" />
      <Input value={url} onChangeText={setUrl} placeholder="https://" autoCapitalize="none" keyboardType="url" />
      {url.trim() ? (
        <Button label={`Open ${hostOf(url.trim()) || 'link'}`} icon={IconExternalLink} variant="ghost" onPress={() => Linking.openURL(url.trim())} />
      ) : null}

      <Label text="Notes" />
      <Input value={notes} onChangeText={setNotes} placeholder="Why it is useful, where you stopped…" multiline />
    </EditScreen>
  )
}
