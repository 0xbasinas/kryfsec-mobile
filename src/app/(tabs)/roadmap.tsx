import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Pressable, View } from 'react-native'
import { Ring } from '@/components/charts'
import { Button, Card, Empty, IconTile, PageTitle, Progress, Screen, Txt } from '@/components/ui'
import { IconChevronRight, IconPlus } from '@/lib/icons'
import { AREA_ICONS } from '@/lib/meta'
import { areaProgress } from '@/lib/stats'
import { useStore } from '@/lib/store'
import { useTheme } from '@/theme'

export default function Roadmap() {
  const t = useTheme()
  const router = useRouter()
  const areas = useStore((s) => s.areas)
  const topics = useStore((s) => s.topics)
  const addStarterRoadmap = useStore((s) => s.addStarterRoadmap)
  const progress = useMemo(() => areaProgress(areas, topics), [areas, topics])
  const done = topics.filter((x) => x.status === 'done').length
  const learning = topics.filter((x) => x.status === 'learning').length
  const pct = topics.length ? Math.round(((done + learning * 0.5) / topics.length) * 100) : 0

  return (
    <Screen tab refresh>
      <PageTitle title="Roadmap" subtitle="Your path, one topic at a time" />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }}>
          <Ring value={pct / 100} size={72} stroke={7} />
          <View style={{ position: 'absolute' }}>
            <Txt variant="h3">{pct}%</Txt>
          </View>
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <Txt variant="h3">Overall progress</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 4 }}>
            <Legend color={t.accent} text={`${done} done`} />
            <Legend color={t.hues.sand} text={`${learning} learning`} />
            <Legend color={t.borderStrong} text={`${topics.length - done - learning} to do`} />
          </View>
        </View>
      </Card>
      {areas.length === 0 && (
        <View style={{ gap: 4 }}>
          <Empty text="No skill areas yet. Add them in the desktop app and sync, or start from a ready-made roadmap." />
          <Button label="Use starter roadmap" icon={IconPlus} variant="ghost" onPress={addStarterRoadmap} />
        </View>
      )}
      {progress.map(({ area, total, done: d, pct: p }) => {
        const c = t.color(area.color)
        return (
          <Pressable key={area.id} onPress={() => router.push(`/roadmap/${area.id}`)} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
            <Card style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <IconTile icon={AREA_ICONS[area.icon]} color={c} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt variant="h3">{area.name}</Txt>
                  <Txt variant="small" muted numberOfLines={1}>
                    {area.description}
                  </Txt>
                </View>
                <IconChevronRight size={16} color={t.faint} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Progress value={p} color={c} />
                </View>
                <Txt variant="tiny" muted style={{ minWidth: 54, textAlign: 'right' }}>
                  {d}/{total} done
                </Txt>
              </View>
            </Card>
          </Pressable>
        )
      })}
    </Screen>
  )
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Txt variant="small" muted>
        {text}
      </Txt>
    </View>
  )
}
