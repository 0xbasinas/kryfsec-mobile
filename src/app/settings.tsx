import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native'
import { SyncSection } from '@/components/sync-section'
import { Button, Card, Screen, Segmented, StackBar, Txt } from '@/components/ui'
import { IconDeviceMobile, IconMoon, IconRefresh, IconSun, IconTrash } from '@/lib/icons'
import { useStore } from '@/lib/store'
import { useSync } from '@/lib/sync'
import type { Settings } from '@/lib/types'
import { makeTheme, useTheme } from '@/theme'

export default function SettingsScreen() {
  const t = useTheme()
  const settings = useStore((s) => s.settings)
  const setSettings = useStore((s) => s.setSettings)
  const resetSample = useStore((s) => s.resetSample)
  const resetEmpty = useStore((s) => s.resetEmpty)
  const paired = useSync((s) => s.paired)
  const accents: Settings['accent'][] = ['periwinkle', 'sage', 'rose']

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StackBar title="Settings" />
      <Screen keyboardShouldPersistTaps="handled">
        <Group title="Look">
          <Txt variant="small" muted>
            Theme
          </Txt>
          <Segmented
            value={settings.theme}
            onChange={(theme) => setSettings({ theme })}
            options={[
              { value: 'system', label: 'System', icon: IconDeviceMobile },
              { value: 'light', label: 'Light', icon: IconSun },
              { value: 'dark', label: 'Dark', icon: IconMoon }
            ]}
          />
          <Txt variant="small" muted style={{ marginTop: 6 }}>
            Accent
          </Txt>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {accents.map((a) => {
              const c = makeTheme(t.scheme, a).accent
              const on = settings.accent === a
              return (
                <Pressable
                  key={a}
                  onPress={() => setSettings({ accent: a })}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: on ? t.card2 : 'transparent',
                    borderWidth: StyleSheet.hairlineWidth * 2,
                    borderColor: on ? t.borderStrong : t.border
                  }}>
                  <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c }} />
                  <Txt variant="small" color={on ? t.fg : t.muted} style={{ fontWeight: on ? '600' : '500', textTransform: 'capitalize' }}>
                    {a}
                  </Txt>
                </Pressable>
              )
            })}
          </View>
        </Group>

        <Group title="Sync">
          <SyncSection />
        </Group>

        <Group title="You">
          <Txt variant="small" muted>
            Your name
          </Txt>
          <TextInput
            value={settings.name}
            onChangeText={(name) => setSettings({ name })}
            placeholder="Shown in the greeting"
            placeholderTextColor={t.faint}
            style={{ color: t.fg, fontSize: 15, backgroundColor: t.card2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11 }}
          />
          <Txt variant="small" muted style={{ marginTop: 6 }}>
            Weekly goal
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Step label="−" onPress={() => setSettings({ weeklyGoalHours: Math.max(1, settings.weeklyGoalHours - 1) })} />
            <Txt variant="h2" style={{ minWidth: 70, textAlign: 'center' }}>
              {settings.weeklyGoalHours}h
            </Txt>
            <Step label="+" onPress={() => setSettings({ weeklyGoalHours: Math.min(80, settings.weeklyGoalHours + 1) })} />
            <Txt variant="small" muted style={{ flex: 1 }}>
              of study each week
            </Txt>
          </View>
        </Group>

        <Group title="Data">
          <Txt variant="small" muted>
            {paired
              ? 'Your data is saved on this phone. Sync sends an encrypted copy that only your devices can open.'
              : 'Your data is saved on this phone.'}
          </Txt>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <Button
              label="Sample data"
              icon={IconRefresh}
              variant="ghost"
              style={{ flex: 1 }}
              onPress={() =>
                Alert.alert('Load sample data?', 'This replaces your data with the examples.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Load', onPress: resetSample }
                ])
              }
            />
            <Button
              label="Start fresh"
              icon={IconTrash}
              variant="danger"
              style={{ flex: 1 }}
              onPress={() =>
                Alert.alert('Start fresh?', 'This deletes all entries, labs and goals on this phone.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete all', style: 'destructive', onPress: resetEmpty }
                ])
              }
            />
          </View>
        </Group>

        <Txt variant="tiny" muted style={{ textAlign: 'center', marginTop: 4 }}>
          Version 0.1.0
        </Txt>
      </Screen>
    </View>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Txt variant="h3" style={{ paddingHorizontal: 4 }}>
        {title}
      </Txt>
      <Card style={{ gap: 10 }}>{children}</Card>
    </View>
  )
}

function Step({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? t.borderStrong : t.card2
      })}>
      <Txt variant="h2">{label}</Txt>
    </Pressable>
  )
}
