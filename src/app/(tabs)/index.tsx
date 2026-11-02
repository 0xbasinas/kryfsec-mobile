import { format, parseISO } from 'date-fns'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { View } from 'react-native'
import { Heatmap, StudyBars } from '@/components/charts'
import { Badge, Card, IconButton, IconTile, Progress, Row, Screen, SectionHeader, Txt } from '@/components/ui'
import { IconCertificate, IconChecks, IconClock, IconFlag3, IconFlame, IconPlus, IconTarget, type Icon } from '@/lib/icons'
import { heatmap, lastDays, streak, weekMinutes } from '@/lib/stats'
import { useStore } from '@/lib/store'
import { dueLabel, fmtHours, greeting } from '@/lib/utils'
import { mix, useTheme } from '@/theme'

function Stat({ icon, label, value, sub, children }: { icon: Icon; label: string; value: string; sub?: string; children?: React.ReactNode }) {
  const t = useTheme()
  return (
    <Card style={{ flex: 1, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt variant="small" muted>
          {label}
        </Txt>
        <IconTile icon={icon} color={t.accent} size={30} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
        <Txt variant="stat">{value}</Txt>
        {sub ? (
          <Txt variant="small" muted>
            {sub}
          </Txt>
        ) : null}
      </View>
      {children}
    </Card>
  )
}

export default function Dashboard() {
  const t = useTheme()
  const router = useRouter()
  const logs = useStore((s) => s.logs)
  const labs = useStore((s) => s.labs)
  const topics = useStore((s) => s.topics)
  const goals = useStore((s) => s.goals)
  const certs = useStore((s) => s.certs)
  const settings = useStore((s) => s.settings)

  const data = useMemo(() => ({ logs, labs }), [logs, labs])
  const st = useMemo(() => streak(data), [data])
  const week = useMemo(() => weekMinutes(data), [data])
  const bars = useMemo(() => lastDays(data, 14).map((d) => ({ label: format(parseISO(d.date), 'd'), hours: d.hours })), [data])
  const heat = useMemo(() => heatmap(data, 18), [data])
  const total14 = bars.reduce((a, d) => a + d.hours, 0)
  const topicsDone = topics.filter((x) => x.status === 'done').length
  const labsDone = labs.filter((x) => x.status === 'done').length
  const goalH = settings.weeklyGoalHours || 1
  const weekPct = Math.min(100, Math.round((week / 60 / goalH) * 100))

  const upcoming = [
    ...goals.filter((g) => !g.done && g.deadline).map((g) => ({ id: g.id, kind: 'goal' as const, title: g.title, date: g.deadline! })),
    ...certs.filter((c) => c.status !== 'passed' && c.targetDate).map((c) => ({ id: c.id, kind: 'cert' as const, title: c.name, date: c.targetDate! }))
  ]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, 4)

  const name = settings.name.trim()
  const toneColor = { danger: t.danger, warn: t.warn, muted: t.muted }

  return (
    <Screen tab>
      {/* Greeting */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 2 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: t.accent }} />
            <Txt variant="small" color={t.accent2} style={{ fontWeight: '500' }}>
              {format(new Date(), 'EEEE, d MMMM')}
            </Txt>
          </View>
          <Txt variant="title">
            {greeting()}
            {name ? `, ${name}` : ''}
          </Txt>
          <Txt variant="small" muted style={{ marginTop: 2 }}>
            {st.current > 0
              ? st.todayDone
                ? `You studied today. Your streak is ${st.current} day${st.current > 1 ? 's' : ''}. Nice!`
                : `Your streak is ${st.current} day${st.current > 1 ? 's' : ''}. Study a little today to keep it going.`
              : 'Start a streak today. Even 20 minutes counts.'}
          </Txt>
        </View>
        <IconButton icon={IconPlus} label="New entry" filled onPress={() => router.push('/journal/new')} />
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Stat icon={IconFlame} label="Streak" value={`${st.current}`} sub={`day${st.current === 1 ? '' : 's'}`}>
          <Txt variant="tiny" muted>
            Best {st.best} days
          </Txt>
        </Stat>
        <Stat icon={IconClock} label="This week" value={fmtHours(week)} sub={`of ${goalH}h`}>
          <Progress value={weekPct} />
        </Stat>
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Stat icon={IconChecks} label="Topics done" value={`${topicsDone}`} sub={`of ${topics.length}`}>
          <Progress value={topics.length ? (topicsDone / topics.length) * 100 : 0} color={mix(t.accent, t.muted, 0.6)} />
        </Stat>
        <Stat icon={IconFlag3} label="Labs solved" value={`${labsDone}`} sub={`of ${labs.length}`}>
          <Progress value={labs.length ? (labsDone / labs.length) * 100 : 0} color={mix(t.accent, t.muted, 0.6)} />
        </Stat>
      </View>

      {/* Study time */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <View style={{ gap: 2 }}>
            <Txt variant="h3">Study time</Txt>
            <Txt variant="small" muted>
              Last 14 days
            </Txt>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <Txt variant="h3">{total14.toFixed(1)}h</Txt>
            <Txt variant="small" muted>
              total
            </Txt>
          </View>
        </View>
        <StudyBars data={bars} />
      </Card>

      {/* Heatmap */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Txt variant="h3">Activity</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Txt variant="tiny" muted style={{ marginRight: 2 }}>
              Less
            </Txt>
            {[t.card2, mix(t.accent, t.card, 0.3), mix(t.accent, t.card, 0.52), mix(t.accent, t.card, 0.75), t.accent].map((c) => (
              <View key={c} style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: c }} />
            ))}
            <Txt variant="tiny" muted style={{ marginLeft: 2 }}>
              More
            </Txt>
          </View>
        </View>
        <Heatmap cols={heat} />
      </Card>

      {/* Coming up */}
      <Card padded={false} style={{ paddingTop: 16 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <SectionHeader title="Coming up" icon={IconTarget} action="All" onAction={() => router.push('/goals')} />
        </View>
        {upcoming.length === 0 ? (
          <Txt variant="small" muted style={{ padding: 16, textAlign: 'center' }}>
            No deadlines. Add a goal to stay on track.
          </Txt>
        ) : (
          upcoming.map((u, i) => {
            const due = dueLabel(u.date)
            return (
              <Row
                key={u.id}
                title={u.title}
                subtitle={u.kind === 'cert' ? 'Certification' : 'Goal'}
                left={<IconTile icon={u.kind === 'cert' ? IconCertificate : IconTarget} color={u.kind === 'cert' ? t.hues.sand : t.accent} size={34} />}
                right={<Badge label={due.text} color={toneColor[due.tone]} />}
                chevron={false}
                onPress={() => router.push(u.kind === 'cert' ? '/certs' : '/goals')}
                last={i === upcoming.length - 1}
              />
            )
          })
        )}
      </Card>
    </Screen>
  )
}
