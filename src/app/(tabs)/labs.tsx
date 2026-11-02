import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Badge, Card, Chips, Dot, Empty, PageTitle, Screen, Txt } from '@/components/ui'
import { IconClock } from '@/lib/icons'
import { DIFF_LABEL, WORK_LABEL } from '@/lib/meta'
import { platformColor } from '@/lib/platforms'
import { useStore } from '@/lib/store'
import type { WorkStatus } from '@/lib/types'
import { fmtDate, fmtHours } from '@/lib/utils'
import { useTheme } from '@/theme'
import { diffColor, statusColor } from '@/lib/colors'

type Filter = 'all' | WorkStatus

export default function Labs() {
  const t = useTheme()
  const router = useRouter()
  const labs = useStore((s) => s.labs)
  const [filter, setFilter] = useState<Filter>('all')
  const list = useMemo(() => {
    const order: Record<WorkStatus, number> = { doing: 0, todo: 1, done: 2 }
    return labs
      .filter((l) => filter === 'all' || l.status === filter)
      .sort((a, b) => order[a.status] - order[b.status] || (b.date ?? '').localeCompare(a.date ?? ''))
  }, [labs, filter])
  const solved = labs.filter((l) => l.status === 'done').length
  const count = (s: WorkStatus) => labs.filter((l) => l.status === s).length

  return (
    <Screen tab>
      <PageTitle title="Labs & CTFs" subtitle={`${solved} solved · ${count('doing')} in progress`} />
      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: `All ${labs.length}` },
          { value: 'doing', label: `In progress ${count('doing')}` },
          { value: 'todo', label: `To do ${count('todo')}` },
          { value: 'done', label: `Done ${solved}` }
        ]}
      />
      {list.length === 0 ? (
        <Empty text="No labs here yet." />
      ) : (
        list.map((l) => (
          <Pressable key={l.id} onPress={() => router.push(`/labs/${l.id}`)} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
            <Card style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Dot color={t.color(platformColor(l.platform))} />
                <Txt variant="small" muted style={{ flex: 1 }}>
                  {l.platform}
                </Txt>
                <Badge label={WORK_LABEL[l.status]} color={statusColor(t, l.status)} />
              </View>
              <Txt variant="h3" numberOfLines={2}>
                {l.name}
              </Txt>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Badge label={DIFF_LABEL[l.difficulty]} color={diffColor(t, l.difficulty)} soft={false} />
                {l.minutes > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <IconClock size={14} color={t.faint} />
                    <Txt variant="small" muted>
                      {fmtHours(l.minutes)}
                    </Txt>
                  </View>
                )}
                {l.date ? (
                  <Txt variant="small" muted>
                    {fmtDate(l.date, 'd MMM')}
                  </Txt>
                ) : null}
                <View style={{ flex: 1 }} />
                <Txt variant="tiny" color={t.faint} numberOfLines={1}>
                  {l.tags.map((x) => `#${x}`).join(' ')}
                </Txt>
              </View>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  )
}
