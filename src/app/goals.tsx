import { useRouter } from 'expo-router'
import { Pressable, View } from 'react-native'
import { Badge, Card, Empty, IconButton, Screen, StackBar, Txt } from '@/components/ui'
import { IconCheck, IconPlus } from '@/lib/icons'
import { useStore } from '@/lib/store'
import { dueLabel, today } from '@/lib/utils'
import { useTheme } from '@/theme'

export default function Goals() {
  const t = useTheme()
  const router = useRouter()
  const goals = useStore((s) => s.goals)
  const areas = useStore((s) => s.areas)
  const upsert = useStore((s) => s.upsert)
  const open = goals.filter((g) => !g.done).sort((a, b) => (a.deadline ?? '9').localeCompare(b.deadline ?? '9'))
  const done = goals.filter((g) => g.done)
  const tone = { danger: t.danger, warn: t.warn, muted: t.muted }

  const list = (items: typeof goals) => (
    <Card padded={false}>
      {items.map((g, i) => {
        const area = areas.find((a) => a.id === g.areaId)
        const due = g.deadline && !g.done ? dueLabel(g.deadline) : null
        return (
          <Pressable
            key={g.id}
            onPress={() => router.push({ pathname: '/edit/goal', params: { id: g.id } })}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              backgroundColor: pressed ? t.card2 : 'transparent',
              borderBottomWidth: i === items.length - 1 ? 0 : 1,
              borderBottomColor: t.border
            })}>
            <Pressable
              onPress={() => upsert('goals', { ...g, done: !g.done, doneAt: g.done ? undefined : today() })}
              hitSlop={10}
              accessibilityLabel={g.done ? 'Mark as open' : 'Mark as done'}
              style={{
                width: 22,
                height: 22,
                borderRadius: 7,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: g.done ? t.accent : 'transparent',
                borderWidth: g.done ? 0 : 1.5,
                borderColor: t.borderStrong
              }}>
              {g.done ? <IconCheck size={14} color={t.accentFg} strokeWidth={2.8} /> : null}
            </Pressable>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="body" color={g.done ? t.muted : t.fg} style={g.done ? { textDecorationLine: 'line-through' } : undefined}>
                {g.title}
              </Txt>
              {area ? (
                <Txt variant="small" muted>
                  {area.name}
                </Txt>
              ) : null}
            </View>
            {due ? <Badge label={due.text} color={tone[due.tone]} /> : null}
          </Pressable>
        )
      })}
    </Card>
  )

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StackBar title="Goals" right={<IconButton icon={IconPlus} label="New goal" filled onPress={() => router.push('/edit/goal')} />} />
      <Screen refresh>
        {goals.length === 0 ? (
          <Empty text="No goals yet. Tap + to set one." />
        ) : (
          <>
            <Txt variant="small" muted style={{ paddingHorizontal: 4 }}>
              Open · {open.length} — tap the box to tick it off, tap the goal to edit it
            </Txt>
            {open.length > 0 && list(open)}
          </>
        )}
        {done.length > 0 && (
          <>
            <Txt variant="small" muted style={{ paddingHorizontal: 4, marginTop: 6 }}>
              Done · {done.length}
            </Txt>
            {list(done)}
          </>
        )}
      </Screen>
    </View>
  )
}
