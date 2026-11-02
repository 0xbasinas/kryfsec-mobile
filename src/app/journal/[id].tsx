import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Alert, View } from 'react-native'
import { Markdown } from '@/components/markdown'
import { Badge, Card, Empty, IconButton, Screen, StackBar, Txt } from '@/components/ui'
import { IconCalendar, IconClock, IconMap2, IconTrash } from '@/lib/icons'
import { useStore } from '@/lib/store'
import { fmtDate, fmtHours } from '@/lib/utils'
import { useTheme } from '@/theme'

export default function JournalEntry() {
  const t = useTheme()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const entry = useStore((s) => s.logs.find((l) => l.id === id))
  const topic = useStore((s) => (entry?.topicId ? s.topics.find((x) => x.id === entry.topicId) : undefined))
  const remove = useStore((s) => s.remove)

  const onDelete = () =>
    Alert.alert('Delete entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          remove('logs', id)
          router.back()
        }
      }
    ])

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ title: entry?.title ?? 'Entry' }} />
      <StackBar title="Entry" right={entry ? <IconButton icon={IconTrash} label="Delete entry" onPress={onDelete} /> : null} />
      {!entry ? (
        <Empty text="This entry was not found." />
      ) : (
        <Screen>
          <View style={{ gap: 10, paddingHorizontal: 2, marginTop: 4 }}>
            <Txt variant="h2" style={{ fontSize: 24, lineHeight: 30 }}>
              {entry.title || 'Untitled entry'}
            </Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
              <Meta icon={<IconCalendar size={15} color={t.faint} />} text={fmtDate(entry.date, 'EEEE, d MMM yyyy')} />
              <Meta icon={<IconClock size={15} color={t.faint} />} text={fmtHours(entry.minutes)} />
              {topic ? <Meta icon={<IconMap2 size={15} color={t.faint} />} text={topic.title} /> : null}
            </View>
            {entry.tags.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {entry.tags.map((tag) => (
                  <Badge key={tag} label={`#${tag}`} color={t.accent2} />
                ))}
              </View>
            )}
          </View>
          <Card style={{ paddingVertical: 18 }}>{entry.body.trim() ? <Markdown source={entry.body} /> : <Txt muted>No notes yet.</Txt>}</Card>
        </Screen>
      )}
    </View>
  )
}

function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '100%' }}>
      {icon}
      <Txt variant="small" muted numberOfLines={1}>
        {text}
      </Txt>
    </View>
  )
}
