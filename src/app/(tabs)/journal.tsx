import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { Badge, Card, Chips, Empty, IconButton, PageTitle, Screen, Txt } from '@/components/ui'
import { IconClock, IconPlus, IconSearch } from '@/lib/icons'
import { useStore } from '@/lib/store'
import type { LogEntry } from '@/lib/types'
import { fmtDate, fmtHours, preview } from '@/lib/utils'
import { useTheme } from '@/theme'

function EntryCard({ e, onPress }: { e: LogEntry; onPress: () => void }) {
  const t = useTheme()
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Txt variant="small" muted>
            {fmtDate(e.date, 'EEE, d MMM')}
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <IconClock size={14} color={t.faint} />
            <Txt variant="small" muted>
              {fmtHours(e.minutes)}
            </Txt>
          </View>
        </View>
        <Txt variant="h3" numberOfLines={1}>
          {e.title || 'Untitled entry'}
        </Txt>
        <Txt variant="small" muted numberOfLines={2}>
          {preview(e.body) || 'No notes yet.'}
        </Txt>
        {e.tags.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
            {e.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} label={`#${tag}`} color={t.accent2} />
            ))}
          </View>
        )}
      </Card>
    </Pressable>
  )
}

export default function Journal() {
  const t = useTheme()
  const router = useRouter()
  const logs = useStore((s) => s.logs)
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('all')

  const tags = useMemo(() => {
    const count = new Map<string, number>()
    for (const l of logs) for (const x of l.tags) count.set(x, (count.get(x) ?? 0) + 1)
    return [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([x]) => x)
  }, [logs])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return [...logs]
      .filter((l) => tag === 'all' || l.tags.includes(tag))
      .filter((l) => !s || l.title.toLowerCase().includes(s) || l.body.toLowerCase().includes(s))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.createdAt < b.createdAt ? 1 : -1))
  }, [logs, q, tag])

  const total = logs.reduce((a, l) => a + l.minutes, 0)

  return (
    <Screen tab keyboardShouldPersistTaps="handled">
      <PageTitle
        title="Journal"
        subtitle={`${logs.length} entries · ${fmtHours(total)} logged`}
        right={<IconButton icon={IconPlus} label="New entry" filled onPress={() => router.push('/journal/new')} />}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          height: 44,
          paddingHorizontal: 14,
          borderRadius: 14,
          backgroundColor: t.card,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: t.border
        }}>
        <IconSearch size={17} color={t.faint} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search notes"
          placeholderTextColor={t.faint}
          style={{ flex: 1, color: t.fg, fontSize: 15, paddingVertical: 0 }}
        />
      </View>
      <Chips value={tag} onChange={setTag} options={[{ value: 'all', label: 'All' }, ...tags.map((x) => ({ value: x, label: x }))]} />
      {list.length === 0 ? (
        <Empty text="No entries yet. Tap + to write your first one." />
      ) : (
        list.map((e) => <EntryCard key={e.id} e={e} onPress={() => router.push(`/journal/${e.id}`)} />)
      )}
    </Screen>
  )
}
