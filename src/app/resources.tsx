import { useMemo, useState } from 'react'
import { Linking, View } from 'react-native'
import { Badge, Card, Chips, IconTile, Row, Screen, StackBar } from '@/components/ui'
import { statusColor } from '@/lib/colors'
import { KIND_META, WORK_LABEL } from '@/lib/meta'
import { useStore } from '@/lib/store'
import type { ResourceKind } from '@/lib/types'
import { hostOf } from '@/lib/utils'
import { useTheme } from '@/theme'

export default function Resources() {
  const t = useTheme()
  const resources = useStore((s) => s.resources)
  const [kind, setKind] = useState<'all' | ResourceKind>('all')
  const kinds = useMemo(() => [...new Set(resources.map((r) => r.kind))], [resources])
  const list = resources.filter((r) => kind === 'all' || r.kind === kind)
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StackBar title="Resources" />
      <Screen refresh>
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
                chevron={false}
                onPress={r.url ? () => Linking.openURL(r.url) : undefined}
                last={i === list.length - 1}
              />
            )
          })}
        </Card>
      </Screen>
    </View>
  )
}
