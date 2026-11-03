import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { confirmDelete, Input } from '@/components/form'
import { Card, Empty, IconButton, IconTile, Progress, Screen, StackBar, Txt } from '@/components/ui'
import { IconCheck, IconCircleDashed, IconPencil, IconPlus, IconTrash } from '@/lib/icons'
import { AREA_ICONS, TOPIC_LABEL } from '@/lib/meta'
import { useStore } from '@/lib/store'
import type { TopicStatus } from '@/lib/types'
import { nowIso, uid } from '@/lib/utils'
import { useTheme } from '@/theme'

const NEXT: Record<TopicStatus, TopicStatus> = { todo: 'learning', learning: 'done', done: 'todo' }

export default function AreaDetail() {
  const t = useTheme()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const area = useStore((s) => s.areas.find((a) => a.id === id))
  const allTopics = useStore((s) => s.topics)
  const upsert = useStore((s) => s.upsert)
  const remove = useStore((s) => s.remove)
  const [newTopic, setNewTopic] = useState('')
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

  const addTopic = () => {
    if (!newTopic.trim()) return
    upsert('topics', { id: uid(), areaId: area.id, title: newTopic.trim(), status: 'todo', notes: '', updatedAt: nowIso() })
    setNewTopic('')
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StackBar
        title={area.name}
        right={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <IconButton icon={IconPencil} label="Edit area" onPress={() => router.push({ pathname: '/edit/area', params: { id: area.id } })} />
            <IconButton
              icon={IconTrash}
              label="Delete area"
              onPress={() =>
                confirmDelete('Delete skill area?', `"${area.name}" and its ${topics.length} topics will be deleted.`, () => {
                  remove('areas', area.id)
                  router.back()
                })
              }
            />
          </View>
        }
      />
      <Screen keyboardShouldPersistTaps="handled">
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
          Tap a circle to change the status. Tap a topic to rename it or add notes.
        </Txt>
        <Card padded={false}>
          {topics.map((tp) => {
            const on = tp.status === 'done'
            const mid = tp.status === 'learning'
            return (
              <Pressable
                key={tp.id}
                onPress={() => router.push({ pathname: '/edit/topic', params: { id: tp.id } })}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  backgroundColor: pressed ? t.card2 : 'transparent',
                  borderBottomWidth: 1,
                  borderBottomColor: t.border
                })}>
                <Pressable
                  onPress={() => upsert('topics', { ...tp, status: NEXT[tp.status], updatedAt: nowIso(), sample: false })}
                  hitSlop={10}
                  accessibilityLabel={`${TOPIC_LABEL[tp.status]}, change status`}
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
                </Pressable>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt variant="body" color={on ? t.muted : t.fg}>
                    {tp.title}
                  </Txt>
                  {tp.notes.trim() ? (
                    <Txt variant="small" muted numberOfLines={1}>
                      {tp.notes.trim()}
                    </Txt>
                  ) : null}
                </View>
                <Txt variant="tiny" color={mid ? c : t.faint} style={{ fontWeight: '500' }}>
                  {TOPIC_LABEL[tp.status]}
                </Txt>
              </Pressable>
            )
          })}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 }}>
            <Input
              value={newTopic}
              onChangeText={setNewTopic}
              onSubmitEditing={addTopic}
              returnKeyType="done"
              submitBehavior="submit"
              placeholder={`Add a topic to ${area.name}…`}
              style={{ flex: 1, backgroundColor: t.card2, borderWidth: 0 }}
            />
            <IconButton icon={IconPlus} label="Add topic" filled onPress={addTopic} />
          </View>
        </Card>
      </Screen>
    </View>
  )
}
