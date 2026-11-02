import { useLocalSearchParams } from 'expo-router'
import { Linking, View } from 'react-native'
import { Markdown } from '@/components/markdown'
import { Badge, Button, Card, Dot, Empty, Screen, Segmented, StackBar, Txt } from '@/components/ui'
import { diffColor } from '@/lib/colors'
import { IconExternalLink } from '@/lib/icons'
import { DIFF_LABEL } from '@/lib/meta'
import { platformColor } from '@/lib/platforms'
import { useStore } from '@/lib/store'
import type { WorkStatus } from '@/lib/types'
import { fmtDate, fmtHours, hostOf, today } from '@/lib/utils'
import { useTheme } from '@/theme'

export default function LabDetail() {
  const t = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const lab = useStore((s) => s.labs.find((l) => l.id === id))
  const upsert = useStore((s) => s.upsert)
  if (!lab)
    return (
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <StackBar title="Lab" />
        <Empty text="This lab was not found." />
      </View>
    )
  const setStatus = (status: WorkStatus) => upsert('labs', { ...lab, status, date: status === 'done' ? (lab.date ?? today()) : lab.date })

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StackBar title="Lab" />
      <Screen>
        <View style={{ gap: 10, paddingHorizontal: 2, marginTop: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Dot color={t.color(platformColor(lab.platform))} />
            <Txt variant="small" muted>
              {lab.platform}
            </Txt>
          </View>
          <Txt variant="h2" style={{ fontSize: 24, lineHeight: 30 }}>
            {lab.name}
          </Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <Badge label={DIFF_LABEL[lab.difficulty]} color={diffColor(t, lab.difficulty)} soft={false} />
            {lab.minutes > 0 && <Badge label={fmtHours(lab.minutes)} />}
            {lab.date ? <Badge label={fmtDate(lab.date, 'd MMM yyyy')} /> : null}
            {lab.tags.map((x) => (
              <Badge key={x} label={`#${x}`} color={t.accent2} />
            ))}
          </View>
        </View>
        <Segmented
          value={lab.status}
          onChange={setStatus}
          options={[
            { value: 'todo', label: 'To do' },
            { value: 'doing', label: 'In progress' },
            { value: 'done', label: 'Done' }
          ]}
        />
        <Card style={{ gap: 12 }}>
          <Txt variant="h3">Writeup</Txt>
          {lab.writeup.trim() ? (
            <Markdown source={lab.writeup} />
          ) : (
            <Txt variant="small" muted>
              No writeup yet. Write down the steps while they are fresh.
            </Txt>
          )}
        </Card>
        {lab.url ? (
          <Button label={`Open ${hostOf(lab.url) || 'link'}`} icon={IconExternalLink} variant="ghost" onPress={() => Linking.openURL(lab.url)} />
        ) : null}
      </Screen>
    </View>
  )
}
