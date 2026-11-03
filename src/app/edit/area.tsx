import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { EditScreen, Input, Label, need, useClose } from '@/components/form'
import { IconTile, Txt } from '@/components/ui'
import { AREA_COLORS, AREA_ICONS } from '@/lib/meta'
import { useStore } from '@/lib/store'
import type { AreaIcon } from '@/lib/types'
import { uid } from '@/lib/utils'
import { useTheme } from '@/theme'

/** New skill area, or edit one with `?id=`. */
export default function AreaEditor() {
  const t = useTheme()
  const close = useClose()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const existing = useStore((s) => (id ? s.areas.find((a) => a.id === id) : undefined))
  const upsert = useStore((s) => s.upsert)
  const [name, setName] = useState(existing?.name ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [icon, setIcon] = useState<AreaIcon>(existing?.icon ?? 'shield')
  const [color, setColor] = useState(existing?.color ?? AREA_COLORS[0])

  const save = () => {
    if (!name.trim()) return need('a name')
    upsert('areas', { ...existing, id: existing?.id ?? uid(), name: name.trim(), description: description.trim(), icon, color })
    close()
  }

  return (
    <EditScreen title={existing ? 'Edit area' : 'New area'} onSave={save}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 2 }}>
        <IconTile icon={AREA_ICONS[icon]} color={t.color(color)} size={44} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="h3">{name || 'Area name'}</Txt>
          <Txt variant="small" muted numberOfLines={1}>
            {description || 'Short description'}
          </Txt>
        </View>
      </View>

      <Label text="Name" />
      <Input value={name} onChangeText={setName} placeholder="e.g. Digital forensics" autoFocus={!existing} />

      <Label text="Description" />
      <Input value={description} onChangeText={setDescription} placeholder="What is this area about?" />

      <Label text="Icon" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(Object.keys(AREA_ICONS) as AreaIcon[]).map((k) => {
          const Ico = AREA_ICONS[k]
          const on = icon === k
          return (
            <Pressable
              key={k}
              onPress={() => setIcon(k)}
              accessibilityLabel={k}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: on ? t.accentSoft : t.card,
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderColor: on ? t.accentLine : t.border
              }}>
              <Ico size={20} color={on ? t.accent : t.muted} strokeWidth={1.8} />
            </Pressable>
          )
        })}
      </View>

      <Label text="Color" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {AREA_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            accessibilityLabel={c}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: t.color(c),
              borderWidth: color === c ? 3 : 0,
              borderColor: t.fg
            }}
          />
        ))}
      </View>
    </EditScreen>
  )
}
