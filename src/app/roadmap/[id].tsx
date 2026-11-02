import { useLocalSearchParams } from 'expo-router'
import { Pressable, View } from 'react-native'
import { Card, Empty, IconTile, Progress, Screen, StackBar, Txt } from '@/components/ui'
import { IconCheck, IconCircleDashed } from '@/lib/icons'
import { AREA_ICONS, TOPIC_LABEL } from '@/lib/meta'
import { useStore } from '@/lib/store'
import type { TopicStatus } from '@/lib/types'
import { nowIso } from '@/lib/utils'
import { useTheme } from '@/theme'

const NEXT: Record<TopicStatus, TopicStatus> = { todo: 'learning', learning: 'done', done: 'todo' }

export default function AreaDetail() {
  const t = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const area = useStore((s) => s.areas.find((a) => a.id === id))
  const allTopics = useStore((s) => s.topics)
  const upsert = useStore((s) => s.upsert)
  const topics = allTopics.filter((x) => x.areaId === id)
  if (!area)
    return (
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <StackBar title="Area" />
        <Empty text="This area was not found." />
      </View>
    )
  const c = t.color(area.color)
  const done = topics.filter((x) => x.status === 'done').length
  const learning = topics.filter((x) => x.status === 'learning').length
  const pct = topics.length ? Math.round(((done + learning * 0.5) / topics.length) * 100) : 0

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StackBar title={area.name} />
      <Screen>
        <Card style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <IconTile icon={AREA_ICONS[area.icon]} color={c} size={44} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="h3">{area.name}</Txt>
              <Txt variant="small" muted>
                {area.description}
              </Txt>
            </View>
          </View>
          <Progress value={pct} color={c} />
          <Txt variant="small" muted>
            {done} done · {learning} learning · {topics.length - done - learning} to do
          </Txt>
        </Card>
        <Txt variant="small" muted style={{ paddingHorizontal: 4 }}>
          Tap a topic to change its status.
        </Txt>
        <Card padded={false}>
          {topics.map((tp, i) => {
            const on = tp.status === 'done'
            const mid = tp.status === 'learning'
            return (
              <Pressable
                key={tp.id}
                onPress={() => upsert('topics', { ...tp, status: NEXT[tp.status], updatedAt: nowIso() })}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  backgroundColor: pressed ? t.card2 : 'transparent',
                  borderBottomWidth: i === topics.length - 1 ? 0 : 1,
                  borderBottomColor: t.border
                })}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: on ? c : 'transparent',
                    borderWidth: on ? 0 : 1.5,
                    borderColor: mid ? c : t.borderStrong
                  }}>
                  {on ? <IconCheck size={14} color={t.bg} strokeWidth={2.8} /> : mid ? <IconCircleDashed size={14} color={c} strokeWidth={2.2} /> : null}
                </View>
                <Txt variant="body" style={{ flex: 1 }} color={on ? t.muted : t.fg}>
                  {tp.title}
                </Txt>
                <Txt variant="tiny" color={mid ? c : t.faint} style={{ fontWeight: '500' }}>
                  {TOPIC_LABEL[tp.status]}
                </Txt>
              </Pressable>
            )
          })}
        </Card>
      </Screen>
    </View>
  )
}
