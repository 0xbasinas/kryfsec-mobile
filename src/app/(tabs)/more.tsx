import { useRouter, type Href } from 'expo-router'
import { View } from 'react-native'
import { Card, IconTile, PageTitle, Row, Screen, Txt } from '@/components/ui'
import { IconBookmarks, IconCertificate, IconSettings, IconTarget, type Icon } from '@/lib/icons'
import { totalMinutes } from '@/lib/stats'
import { useStore } from '@/lib/store'
import { fmtHours } from '@/lib/utils'
import { useTheme } from '@/theme'

export default function More() {
  const t = useTheme()
  const router = useRouter()
  const resources = useStore((s) => s.resources)
  const certs = useStore((s) => s.certs)
  const goals = useStore((s) => s.goals)
  const logs = useStore((s) => s.logs)
  const labs = useStore((s) => s.labs)

  const items: { title: string; sub: string; icon: Icon; color: string; href: Href }[] = [
    {
      title: 'Resources',
      sub: `${resources.filter((r) => r.status === 'doing').length} in progress · ${resources.length} saved`,
      icon: IconBookmarks,
      color: t.hues.teal,
      href: '/resources'
    },
    {
      title: 'Certifications',
      sub: `${certs.filter((c) => c.status === 'passed').length} passed · ${certs.filter((c) => c.status !== 'passed').length} planned`,
      icon: IconCertificate,
      color: t.hues.sand,
      href: '/certs'
    },
    {
      title: 'Goals',
      sub: `${goals.filter((g) => !g.done).length} open · ${goals.filter((g) => g.done).length} done`,
      icon: IconTarget,
      color: t.accent,
      href: '/goals'
    }
  ]

  return (
    <Screen tab refresh>
      <PageTitle title="More" />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Mini label="Total time" value={fmtHours(totalMinutes({ logs }))} />
        <Mini label="Entries" value={`${logs.length}`} />
        <Mini label="Labs" value={`${labs.length}`} />
      </View>
      <Card padded={false}>
        {items.map((it, i) => (
          <Row
            key={it.title}
            title={it.title}
            subtitle={it.sub}
            left={<IconTile icon={it.icon} color={it.color} />}
            onPress={() => router.push(it.href)}
            last={i === items.length - 1}
          />
        ))}
      </Card>
      <Card padded={false}>
        <Row
          title="Settings"
          subtitle="Theme, weekly goal and data"
          left={<IconTile icon={IconSettings} color={t.muted} />}
          onPress={() => router.push('/settings')}
          last
        />
      </Card>
      <Txt variant="tiny" muted style={{ textAlign: 'center', marginTop: 6 }}>
        Your data stays on this phone.
      </Txt>
    </Screen>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ flex: 1, gap: 4, paddingVertical: 14 }}>
      <Txt variant="h2">{value}</Txt>
      <Txt variant="small" muted>
        {label}
      </Txt>
    </Card>
  )
}
