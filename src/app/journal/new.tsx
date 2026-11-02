import { format, subDays } from 'date-fns'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View, type TextInputProps } from 'react-native'
import { Button, Chips, Screen, StackBar, Txt } from '@/components/ui'
import { IconCheck } from '@/lib/icons'
import { useStore } from '@/lib/store'
import { nowIso, uid } from '@/lib/utils'
import { useTheme } from '@/theme'

const MINUTES = ['15', '30', '45', '60', '90', '120']

export default function NewEntry() {
  const t = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const upsert = useStore((s) => s.upsert)
  const [title, setTitle] = useState('')
  const [day, setDay] = useState<'0' | '1' | '2'>('0')
  const [minutes, setMinutes] = useState('45')
  const [tags, setTags] = useState('')
  const [body, setBody] = useState('')

  const save = () => {
    upsert('logs', {
      id: uid(),
      date: format(subDays(new Date(), Number(day)), 'yyyy-MM-dd'),
      title: title.trim() || 'Untitled entry',
      body,
      tags: tags
        .split(/[,\s]+/)
        .map((x) => x.replace(/^#/, '').trim().toLowerCase())
        .filter(Boolean),
      minutes: Number(minutes) || 0,
      createdAt: nowIso()
    })
    router.back()
  }

  const field = (props: TextInputProps) => (
    <TextInput
      placeholderTextColor={t.faint}
      {...props}
      style={[
        {
          color: t.fg,
          fontSize: 15,
          backgroundColor: t.card,
          borderRadius: 14,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: t.border,
          paddingHorizontal: 14,
          paddingVertical: 12
        },
        props.style
      ]}
    />
  )

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StackBar title="New entry" />
      <Screen keyboardShouldPersistTaps="handled">
        <Label text="Title" />
        {field({ value: title, onChangeText: setTitle, placeholder: 'What did you learn?', autoFocus: false })}

        <Label text="When" />
        <Chips
          value={day}
          onChange={setDay}
          options={[
            { value: '0', label: 'Today' },
            { value: '1', label: 'Yesterday' },
            { value: '2', label: format(subDays(new Date(), 2), 'EEE d MMM') }
          ]}
        />

        <Label text="Time spent" />
        <Chips value={minutes} onChange={setMinutes} options={MINUTES.map((m) => ({ value: m, label: Number(m) >= 60 ? `${Number(m) / 60}h` : `${m}m` }))} />

        <Label text="Tags" />
        {field({ value: tags, onChangeText: setTags, placeholder: 'web, sqli, portswigger', autoCapitalize: 'none' })}

        <Label text="Notes" hint="Markdown works: ## headings, - lists, `code`" />
        {field({
          value: body,
          onChangeText: setBody,
          placeholder: '## What I did\n- \n\n## Next\n- [ ] ',
          multiline: true,
          textAlignVertical: 'top',
          style: { minHeight: 150, fontFamily: 'monospace', fontSize: 13.5, lineHeight: 20 }
        })}
      </Screen>
      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 10,
          paddingBottom: insets.bottom + 12,
          backgroundColor: t.bg,
          borderTopWidth: StyleSheet.hairlineWidth * 2,
          borderTopColor: t.border
        }}>
        <Button label="Save entry" icon={IconCheck} onPress={save} />
      </View>
    </KeyboardAvoidingView>
  )
}

function Label({ text, hint }: { text: string; hint?: string }) {
  return (
    <View style={{ marginBottom: -6, marginTop: 2, gap: 2 }}>
      <Txt variant="small" style={{ fontWeight: '600' }}>
        {text}
      </Txt>
      {hint ? (
        <Txt variant="tiny" muted>
          {hint}
        </Txt>
      ) : null}
    </View>
  )
}
