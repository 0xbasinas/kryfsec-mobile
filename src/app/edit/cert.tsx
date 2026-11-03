import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Alert } from 'react-native'
import { confirmDelete, DateField, EditScreen, Input, Label, need, parseDay, useClose } from '@/components/form'
import { Chips, Segmented } from '@/components/ui'
import { CERT_LABEL } from '@/lib/meta'
import { useStore } from '@/lib/store'
import type { CertStatus } from '@/lib/types'
import { uid } from '@/lib/utils'

const STEPS = ['0', '10', '25', '50', '75', '90', '100']

/** New certification, or edit one with `?id=`. */
export default function CertEditor() {
  const close = useClose()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const existing = useStore((s) => (id ? s.certs.find((c) => c.id === id) : undefined))
  const upsert = useStore((s) => s.upsert)
  const remove = useStore((s) => s.remove)
  const [name, setName] = useState(existing?.name ?? '')
  const [provider, setProvider] = useState(existing?.provider ?? '')
  const [status, setStatus] = useState<CertStatus>(existing?.status ?? 'planned')
  const [progress, setProgress] = useState(String(existing?.progress ?? 0))
  const [targetDate, setTargetDate] = useState(existing?.targetDate ?? '')
  const [url, setUrl] = useState(existing?.url ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')

  const save = () => {
    if (!name.trim()) return need('a name')
    const day = parseDay(targetDate)
    if (day === null) return Alert.alert('Check the date', 'Use the format YYYY-MM-DD, for example 2026-11-03.')
    const pct = status === 'passed' ? 100 : Math.max(0, Math.min(100, Math.round(Number(progress) || 0)))
    upsert('certs', {
      ...existing,
      id: existing?.id ?? uid(),
      name: name.trim(),
      provider: provider.trim(),
      status,
      progress: pct,
      targetDate: day,
      url: url.trim(),
      notes
    })
    close()
  }

  const steps = STEPS.includes(progress) ? STEPS : [progress, ...STEPS]

  return (
    <EditScreen
      title={existing ? 'Edit certification' : 'New certification'}
      onSave={save}
      onDelete={
        existing
          ? () =>
              confirmDelete('Delete certification?', `"${existing.name}" will be removed.`, () => {
                remove('certs', existing.id)
                close()
              })
          : undefined
      }>
      <Label text="Name" />
      <Input value={name} onChangeText={setName} placeholder="e.g. CompTIA Security+" autoFocus={!existing} />

      <Label text="Provider" />
      <Input value={provider} onChangeText={setProvider} placeholder="e.g. CompTIA, OffSec, INE" />

      <Label text="Status" />
      <Segmented value={status} onChange={setStatus} options={(Object.keys(CERT_LABEL) as CertStatus[]).map((s) => ({ value: s, label: CERT_LABEL[s] }))} />

      <Label text="Progress" />
      <Chips value={progress} onChange={setProgress} options={steps.map((p) => ({ value: p, label: `${p}%` }))} />

      <Label text="Exam date" />
      <DateField value={targetDate} onChange={setTargetDate} />

      <Label text="Link" />
      <Input value={url} onChangeText={setUrl} placeholder="https://" autoCapitalize="none" keyboardType="url" />

      <Label text="Notes" />
      <Input value={notes} onChangeText={setNotes} placeholder="Exam format, study plan…" multiline />
    </EditScreen>
  )
}
