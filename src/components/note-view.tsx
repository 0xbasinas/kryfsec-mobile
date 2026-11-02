import { useMemo } from 'react'
import { Linking } from 'react-native'
import { EnrichedMarkdownText } from 'react-native-enriched-markdown'
import { toggleTask } from '@/lib/note-blocks'
import { useTheme } from '@/theme'
import { noteViewStyle } from './note-style'

/**
 * Shows a markdown note with react-native-enriched-markdown (native, GFM).
 * Checklist taps update the note when `onChange` is given.
 */
export function NoteView({ source, onChange }: { source: string; onChange?: (md: string) => void }) {
  const t = useTheme()
  const style = useMemo(() => noteViewStyle(t), [t])
  return (
    <EnrichedMarkdownText
      markdown={source}
      flavor="github"
      markdownStyle={style}
      selectable
      enableTaskListItemToggle={!!onChange}
      onTaskListItemPress={(e) => onChange?.(toggleTask(source, e.index, e.checked))}
      onLinkPress={(e) => {
        if (/^https?:\/\//i.test(e.url)) Linking.openURL(e.url).catch(() => {})
      }}
    />
  )
}
