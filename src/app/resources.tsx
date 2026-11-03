import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { View } from 'react-native'
import { Badge, Card, Chips, Empty, IconButton, IconTile, Row, Screen, StackBar } from '@/components/ui'
import { statusColor } from '@/lib/colors'
import { IconPlus } from '@/lib/icons'
import { KIND_META, WORK_LABEL } from '@/lib/meta'
import { useStore } from '@/lib/store'
import type { ResourceKind } from '@/lib/types'
import { hostOf } from '@/lib/utils'
import { useTheme } from '@/theme'

export default function Resources() {
  const t = useTheme()
  const router = useRouter()
  const resources = useStore((s) => s.resources)
  const [kind, setKind] = useState<'all' | ResourceKind>('all')
  const kinds = useMemo(() => [...new Set(resources.map((r) => r.kind))], [resources])
  const list = resources.filter((r) => kind === 'all' || r.kind === kind)
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StackBar title="Resources" right={<IconButton icon={IconPlus} label="New resource" filled onPress={() => router.push('/edit/resource')} />} />
      <Screen refresh>
        {resources.length === 0 ? (
          <Empty text="No resources yet. Tap + to save a course, book, video or tool." />
        ) : (
          <>
            <Chips value={kind} onChange={setKind} options={[{ value: 'all', label: 'All' }, ...kinds.map((k) => ({ value: k, label: KIND_META[k].label }))]} />
            <Card padded={false}>
              {list.map((r, i) => {
                const m = KIND_META[r.kind]
                return (
                  <Row
                    key={r.id}
                    title={r.title}
                    subtitle={r.notes || hostOf(r.url)}
                    left={<IconTile icon={m.icon} color={t.color(m.color)} size={36} />}
                    right={<Badge label={WORK_LABEL[r.status]} color={statusColor(t, r.status)} />}
                    onPress={() => router.push({ pathname: '/edit/resource', params: { id: r.id } })}
                    last={i === list.length - 1}
                  />
                )
              })}
            </Card>
          </>
        )}
      </Screen>
    </View>
  )
}
