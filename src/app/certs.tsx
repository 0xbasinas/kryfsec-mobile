import { View } from 'react-native'
import { Badge, Card, Empty, IconTile, Progress, Screen, StackBar, Txt } from '@/components/ui'
import { IconCertificate } from '@/lib/icons'
import { CERT_LABEL } from '@/lib/meta'
import { useStore } from '@/lib/store'
import type { CertStatus } from '@/lib/types'
import { dueLabel, fmtDate } from '@/lib/utils'
import { useTheme } from '@/theme'

export default function Certs() {
  const t = useTheme()
  const certs = useStore((s) => s.certs)
  const color = (s: CertStatus) => ({ planned: t.faint, studying: t.accent, booked: t.warn, passed: t.success })[s]
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StackBar title="Certifications" />
      <Screen refresh>
        {certs.length === 0 && <Empty text="No certifications yet." />}
        {certs.map((c) => (
          <Card key={c.id} style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconTile icon={IconCertificate} color={t.hues.sand} />
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="h3">{c.name}</Txt>
                <Txt variant="small" muted>
                  {c.provider}
                </Txt>
              </View>
              <Badge label={CERT_LABEL[c.status]} color={color(c.status)} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Progress value={c.progress} />
              </View>
              <Txt variant="small" muted>
                {c.progress}%
              </Txt>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Txt variant="small" muted style={{ flex: 1 }} numberOfLines={2}>
                {c.notes}
              </Txt>
              {c.targetDate ? (
                <Txt variant="small" color={dueLabel(c.targetDate).tone === 'muted' ? t.muted : t.warn}>
                  Target {fmtDate(c.targetDate, 'd MMM yyyy')}
                </Txt>
              ) : null}
            </View>
          </Card>
        ))}
      </Screen>
    </View>
  )
}
