import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Alert } from 'react-native'
import { AreaPicker, DateField, EditScreen, Input, Label, need, parseDay, parseTags, useClose } from '@/components/form'
import { Chips, Segmented } from '@/components/ui'
import { DIFF_LABEL } from '@/lib/meta'
import { PLATFORMS } from '@/lib/platforms'
import { useStore } from '@/lib/store'
import type { Difficulty, WorkStatus } from '@/lib/types'
import { nowIso, today, uid } from '@/lib/utils'

/** New lab, or edit one with `?id=`. The writeup is edited on the lab page. */
export default function LabEditor() {
  const close = useClose()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const existing = useStore((s) => (id ? s.labs.find((l) => l.id === id) : undefined))
  const upsert = useStore((s) => s.upsert)
  const [name, setName] = useState(existing?.name ?? '')
  const [platform, setPlatform] = useState(existing?.platform ?? 'TryHackMe')
  const [difficulty, setDifficulty] = useState<Difficulty>(existing?.difficulty ?? 'easy')
  const [status, setStatus] = useState<WorkStatus>(existing?.status ?? 'todo')
  const [url, setUrl] = useState(existing?.url ?? '')
  const [tags, setTags] = useState(existing?.tags.join(', ') ?? '')
  const [minutes, setMinutes] = useState(existing?.minutes ? String(existing.minutes) : '')
  const [date, setDate] = useState(existing?.date ?? '')
  const [areaId, setAreaId] = useState(existing?.areaId)

  const save = () => {
    if (!name.trim()) return need('a name')
    const day = parseDay(date)
    if (day === null) return Alert.alert('Check the date', 'Use the format YYYY-MM-DD, for example 2026-11-03.')
    upsert('labs', {
      ...existing,
      id: existing?.id ?? uid(),
      name: name.trim(),
      platform: platform.trim() || 'Other',
      difficulty,
      status,
      url: url.trim(),
      tags: parseTags(tags),
      minutes: Math.max(0, Math.round(Number(minutes) || 0)),
      date: day ?? (status === 'done' ? today() : undefined),
      areaId,
      writeup: existing?.writeup ?? '',
      createdAt: existing?.createdAt ?? nowIso()
    })
    close()
  }

  const platforms = PLATFORMS.includes(platform) ? PLATFORMS : [platform, ...PLATFORMS]

  return (
    <EditScreen title={existing ? 'Edit lab' : 'New lab'} onSave={save}>
      <Label text="Name" />
      <Input value={name} onChangeText={setName} placeholder="e.g. Blue, Lame, SQLi UNION attack" autoFocus={!existing} />

      <Label text="Platform" />
      <Chips value={platform} onChange={setPlatform} options={platforms.map((p) => ({ value: p, label: p }))} />

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

      <Label text="Difficulty" />
      <Segmented
        value={difficulty}
        onChange={setDifficulty}
        options={(Object.keys(DIFF_LABEL) as Difficulty[]).map((d) => ({ value: d, label: DIFF_LABEL[d] }))}
      />

      <AreaPicker value={areaId} onChange={setAreaId} />

      <Label text="Link" />
      <Input value={url} onChangeText={setUrl} placeholder="https://" autoCapitalize="none" keyboardType="url" />

      <Label text="Tags" />
      <Input value={tags} onChangeText={setTags} placeholder="linux, smb, privesc" autoCapitalize="none" />

      <Label text="Time spent (minutes)" />
      <Input value={minutes} onChangeText={setMinutes} placeholder="0" keyboardType="number-pad" />

      <Label text="Date" hint="When you solved it. Set automatically when you mark it done." />
      <DateField value={date} onChange={setDate} />
    </EditScreen>
  )
}
