import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Keyboard, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { EnrichedMarkdownTextInput, type EnrichedMarkdownTextInputInstance, type MarkdownTextInputStyle, type StyleState } from 'react-native-enriched-markdown'
import {
  IconBlockquote,
  IconBold,
  IconCheck,
  IconH2,
  IconH3,
  IconItalic,
  IconKeyboardHide,
  IconLink,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconStrikethrough,
  IconTerminal2,
  IconX,
  type Icon
} from '@/lib/icons'
import { bkey, blocksToMarkdown, escapeForInput, parseBlocks, withTrailingText, type Block, type TaskItem } from '@/lib/note-blocks'
import { useTheme, type Theme } from '@/theme'
import { codeBg, MONO } from './note-style'
import { Txt } from './ui'

/**
 * Mobile note editor.
 *
 * Normal text uses EnrichedMarkdownTextInput (react-native-enriched-markdown),
 * a native rich text input that reads and writes markdown. It covers headings,
 * bold, italic, strike, links and lists. Code blocks, checklists and quotes are
 * not supported by that input, so they are small blocks of their own here.
 * Everything is saved as plain markdown.
 */

const LANGS = ['bash', 'powershell', 'python', 'sql', 'http', 'javascript', 'json', 'html', 'yaml', 'c', 'go', '']

type Focus = { block: string; item?: string } | null
type Focusable = { focus: () => void }

export type NoteEditor = ReturnType<typeof useNoteEditor>

// On Android the library reads lineHeight as raw pixels, and its height
// measurement ignores line spacing, so a lineHeight there makes lines overlap
// or the last line get cut off. Use the natural line height on Android and
// add spacing between list items instead.
const INPUT_LINE_HEIGHT = Platform.OS === 'android' ? undefined : 23

export function useNoteEditor(initial: string, onChange: (md: string) => void) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseBlocks(initial))
  const [focus, setFocus] = useState<Focus>(null)
  const [style, setStyle] = useState<StyleState | null>(null)
  const inputs = useRef(new Map<string, Focusable>())
  const selections = useRef(new Map<string, { start: number; end: number }>())
  const pendingFocus = useRef<string | null>(null)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const commit = useCallback((next: Block[]) => {
    const fixed = withTrailingText(next)
    setBlocks(fixed)
    onChangeRef.current(blocksToMarkdown(fixed))
  }, [])

  const update = useCallback((key: string, patch: (b: Block) => Block) => {
    setBlocks((prev) => {
      const next = prev.map((b) => (b.key === key ? patch(b) : b))
      onChangeRef.current(blocksToMarkdown(next))
      return next
    })
  }, [])

  // Focus a block (or task item) right after it mounts.
  useEffect(() => {
    const k = pendingFocus.current
    if (!k) return
    const el = inputs.current.get(k)
    if (el) {
      pendingFocus.current = null
      setTimeout(() => el.focus(), 30)
    }
  })

  const onFocus = (block: string, item?: string) => {
    if (blurTimer.current) clearTimeout(blurTimer.current)
    setFocus({ block, item })
  }
  const onBlur = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current)
    blurTimer.current = setTimeout(() => setFocus(null), 150)
  }

  /** Puts a new block after the focused one (or in place of an empty text block). */
  const insert = (make: () => Block, focusKey?: (b: Block) => string, splitFrom?: { key: string; rest: string }) => {
    const nb = make()
    setBlocks((prev) => {
      const list = prev.map((b) => (splitFrom && b.key === splitFrom.key && b.type === 'text' ? { ...b, md: splitFrom.rest } : b))
      let at = focus ? list.findIndex((b) => b.key === focus.block) : -1
      if (splitFrom) at = list.findIndex((b) => b.key === splitFrom.key)
      if (at < 0) at = list.length - 1
      const cur = list[at]
      const replace = cur && cur.type === 'text' && !(splitFrom ? splitFrom.rest : cur.md).trim()
      const next = [...list]
      if (replace) next.splice(at, 1, nb)
      else next.splice(at + 1, 0, nb)
      const fixed = withTrailingText(next)
      onChangeRef.current(blocksToMarkdown(fixed))
      return fixed
    })
    pendingFocus.current = focusKey ? focusKey(nb) : nb.key
  }

  const removeBlock = (key: string) => {
    const i = blocks.findIndex((b) => b.key === key)
    const prev = blocks[i - 1]
    commit(blocks.filter((b) => b.key !== key))
    if (prev) pendingFocus.current = prev.type === 'tasks' ? (prev.items[prev.items.length - 1]?.key ?? prev.key) : prev.key
  }

  const rich = (): EnrichedMarkdownTextInputInstance | null => {
    if (!focus) return null
    const b = blocks.find((x) => x.key === focus.block)
    if (!b || b.type !== 'text') return null
    return inputs.current.get(b.key) as unknown as EnrichedMarkdownTextInputInstance | null
  }

  const newCode = (lang = 'bash'): Block => ({ key: bkey(), type: 'code', lang, code: '' })
  const newTasks = (): Block => ({ key: bkey(), type: 'tasks', items: [{ key: bkey(), done: false, text: '' }] })
  const newQuote = (): Block => ({ key: bkey(), type: 'quote', text: '' })
  const firstItem = (b: Block) => (b.type === 'tasks' ? b.items[0].key : b.key)

  const focusedBlock = focus ? blocks.find((b) => b.key === focus.block) : undefined

  const actions = {
    h2: () => rich()?.toggleHeading(2),
    h3: () => rich()?.toggleHeading(3),
    bold: () => rich()?.toggleBold(),
    italic: () => rich()?.toggleItalic(),
    strike: () => rich()?.toggleStrikethrough(),
    list: () => rich()?.toggleUnorderedList(),
    numbered: () => rich()?.toggleOrderedList(),
    checklist: () => {
      if (focusedBlock?.type === 'tasks') return addItem(focusedBlock.key, focus?.item)
      insert(newTasks, firstItem)
    },
    quote: () => insert(newQuote),
    code: () => insert(() => newCode()),
    link: (url: string) => {
      const el = rich()
      if (!el || !focus) return
      const sel = selections.current.get(focus.block)
      const clean = /^[a-z]+:/i.test(url) ? url : `https://${url}`
      if (sel && sel.end > sel.start) el.setLink(clean)
      else el.insertLink(url, clean)
    }
  }

  const addItem = (blockKey: string, afterItem?: string) => {
    const it: TaskItem = { key: bkey(), done: false, text: '' }
    update(blockKey, (b) => {
      if (b.type !== 'tasks') return b
      const i = afterItem ? b.items.findIndex((x) => x.key === afterItem) : b.items.length - 1
      const items = [...b.items]
      items.splice(i + 1, 0, it)
      return { ...b, items }
    })
    pendingFocus.current = it.key
  }

  const removeItem = (blockKey: string, itemKey: string) => {
    const b = blocks.find((x) => x.key === blockKey)
    if (!b || b.type !== 'tasks') return
    if (b.items.length <= 1) return removeBlock(blockKey)
    const i = b.items.findIndex((x) => x.key === itemKey)
    update(blockKey, (x) => (x.type === 'tasks' ? { ...x, items: x.items.filter((y) => y.key !== itemKey) } : x))
    pendingFocus.current = b.items[Math.max(0, i - 1)].key
  }

  /** Typing ``` or [] or > on a line of its own turns it into that block. */
  // Android measures the input's starting height from plain text, before
  // headings and list spacing are applied, so the last line can be cut off
  // until the first edit. Setting the same value once after mount makes it
  // measure again. The change event that this causes is ignored.
  const settling = useRef(new Set<string>())
  const settled = useRef(new Set<string>())
  const remeasure = useCallback((key: string, md: string) => {
    if (Platform.OS !== 'android' || !md || settled.current.has(key)) return
    settled.current.add(key)
    setTimeout(() => {
      const el = inputs.current.get(key) as unknown as EnrichedMarkdownTextInputInstance | undefined
      if (!el) return
      settling.current.add(key)
      el.setValue(escapeForInput(md))
      setTimeout(() => settling.current.delete(key), 400)
    }, 60)
  }, [])

  const onTextMarkdown = (key: string, md: string) => {
    if (settling.current.has(key)) {
      settling.current.delete(key)
      return
    }
    const m = /(^|\n)(```(\w*)|\[ ?\]|>)[ \t]*$/.exec(md)
    if (m) {
      const rest = md.slice(0, m.index).replace(/\s+$/, '')
      const el = inputs.current.get(key) as unknown as EnrichedMarkdownTextInputInstance | null
      el?.setValue(escapeForInput(rest))
      const kind = m[2]
      if (kind.startsWith('```')) insert(() => newCode(m[3] || 'bash'), undefined, { key, rest })
      else if (kind === '>') insert(newQuote, undefined, { key, rest })
      else insert(newTasks, firstItem, { key, rest })
      return
    }
    update(key, (b) => (b.type === 'text' ? { ...b, md } : b))
  }

  return {
    blocks,
    focus,
    focusedType: focusedBlock?.type ?? null,
    style,
    setStyle,
    inputs,
    selections,
    onFocus,
    onBlur,
    update,
    removeBlock,
    addItem,
    removeItem,
    onTextMarkdown,
    remeasure,
    actions
  }
}

/* ---------- Editor ---------- */

export function NoteEditorView({ editor, placeholder }: { editor: NoteEditor; placeholder?: string }) {
  const t = useTheme()
  const inputStyle = useMemo<MarkdownTextInputStyle>(
    () => ({
      strong: { color: t.fg },
      em: { color: t.fg },
      link: { color: t.accent, underline: true },
      h1: { fontSize: 22, fontWeight: '700', color: t.fg },
      h2: { fontSize: 18, fontWeight: '700', color: t.fg },
      h3: { fontSize: 16, fontWeight: '700', color: t.fg },
      h4: { fontSize: 15, fontWeight: '700', color: t.fg },
      h5: { fontSize: 14, fontWeight: '700', color: t.muted },
      h6: { fontSize: 13, fontWeight: '700', color: t.muted },
      list: { itemSpacing: 4 }
    }),
    [t]
  )
  const { blocks } = editor
  const onlyEmpty = blocks.length === 1 && blocks[0].type === 'text' && !blocks[0].md

  return (
    <View style={{ gap: 10 }}>
      {blocks.map((b) => {
        const setRef = (el: Focusable | null) => {
          if (el) {
            editor.inputs.current.set(b.key, el)
            if (b.type === 'text') editor.remeasure(b.key, b.md)
          } else editor.inputs.current.delete(b.key)
        }
        switch (b.type) {
          case 'text':
            return (
              <EnrichedMarkdownTextInput
                key={b.key}
                // useImperativeHandle inside the library accepts a callback ref too.
                ref={setRef as unknown as RefObject<EnrichedMarkdownTextInputInstance | null>}
                defaultValue={escapeForInput(b.md)}
                placeholder={onlyEmpty ? placeholder : undefined}
                placeholderTextColor={t.faint}
                cursorColor={t.accent}
                selectionColor={t.accentLine}
                multiline
                scrollEnabled={false}
                markdownShortcuts
                autoCapitalize="sentences"
                markdownStyle={inputStyle}
                selectionMenuConfig={{ copyAsMarkdown: { enabled: false } }}
                formatMenuConfig={{ underline: { enabled: false }, spoiler: { enabled: false } }}
                style={{ fontSize: 15, lineHeight: INPUT_LINE_HEIGHT, color: t.fg, minHeight: onlyEmpty ? 160 : 30, paddingVertical: 2 }}
                onFocus={() => editor.onFocus(b.key)}
                onBlur={editor.onBlur}
                onChangeState={editor.setStyle}
                onChangeSelection={(s) => editor.selections.current.set(b.key, s)}
                onChangeMarkdown={(md) => editor.onTextMarkdown(b.key, md)}
              />
            )
          case 'code':
            return (
              <View key={b.key} style={[box(t), { backgroundColor: codeBg(t), overflow: 'hidden' }]}>
                <View style={[head(t)]}>
                  <IconTerminal2 size={15} color={t.faint} />
                  <Pressable
                    hitSlop={8}
                    onPress={() => editor.update(b.key, (x) => (x.type === 'code' ? { ...x, lang: LANGS[(LANGS.indexOf(x.lang) + 1) % LANGS.length] } : x))}
                    accessibilityLabel="Change code language">
                    <Txt variant="tiny" muted style={{ fontSize: 12 }}>
                      {b.lang || 'plain text'}
                    </Txt>
                  </Pressable>
                  <View style={{ flex: 1 }} />
                  <RemoveButton t={t} label="Remove code block" onPress={() => editor.removeBlock(b.key)} />
                </View>
                <TextInput
                  ref={setRef}
                  value={b.code}
                  onChangeText={(code) => editor.update(b.key, (x) => (x.type === 'code' ? { ...x, code } : x))}
                  onFocus={() => editor.onFocus(b.key)}
                  onBlur={editor.onBlur}
                  placeholder="Paste a command or payload"
                  placeholderTextColor={t.faint}
                  multiline
                  scrollEnabled={false}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  cursorColor={t.accent}
                  selectionColor={t.accentLine}
                  style={{ fontFamily: MONO, fontSize: 13, lineHeight: 19, color: t.fg, padding: 12, paddingTop: 10, minHeight: 44 }}
                />
              </View>
            )
          case 'quote':
            return (
              <View key={b.key} style={{ flexDirection: 'row', gap: 12, alignItems: 'stretch' }}>
                <View style={{ width: 3, borderRadius: 2, backgroundColor: t.accentLine }} />
                <TextInput
                  ref={setRef}
                  value={b.text}
                  onChangeText={(text) => editor.update(b.key, (x) => (x.type === 'quote' ? { ...x, text } : x))}
                  onFocus={() => editor.onFocus(b.key)}
                  onBlur={editor.onBlur}
                  onKeyPress={(e) => e.nativeEvent.key === 'Backspace' && !b.text && editor.removeBlock(b.key)}
                  placeholder="Quote"
                  placeholderTextColor={t.faint}
                  multiline
                  scrollEnabled={false}
                  cursorColor={t.accent}
                  selectionColor={t.accentLine}
                  style={{ flex: 1, fontSize: 15, lineHeight: 23, color: t.muted, paddingVertical: 2 }}
                />
              </View>
            )
          case 'tasks':
            return (
              <View key={b.key} style={{ gap: 2 }}>
                {b.items.map((it) => (
                  <View key={it.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Pressable
                      hitSlop={8}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: it.done }}
                      onPress={() =>
                        editor.update(b.key, (x) =>
                          x.type === 'tasks' ? { ...x, items: x.items.map((y) => (y.key === it.key ? { ...y, done: !y.done } : y)) } : x
                        )
                      }
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        borderWidth: 1.5,
                        borderColor: it.done ? t.accent : t.borderStrong,
                        backgroundColor: it.done ? t.accent : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                      {it.done ? <IconCheck size={12} color={t.accentFg} strokeWidth={3} /> : null}
                    </Pressable>
                    <TextInput
                      ref={(el) => {
                        if (el) editor.inputs.current.set(it.key, el)
                        else editor.inputs.current.delete(it.key)
                      }}
                      value={it.text}
                      onChangeText={(text) =>
                        editor.update(b.key, (x) => (x.type === 'tasks' ? { ...x, items: x.items.map((y) => (y.key === it.key ? { ...y, text } : y)) } : x))
                      }
                      onFocus={() => editor.onFocus(b.key, it.key)}
                      onBlur={editor.onBlur}
                      onSubmitEditing={() => editor.addItem(b.key, it.key)}
                      submitBehavior="submit"
                      returnKeyType="next"
                      onKeyPress={(e) => e.nativeEvent.key === 'Backspace' && !it.text && editor.removeItem(b.key, it.key)}
                      placeholder="To do"
                      placeholderTextColor={t.faint}
                      cursorColor={t.accent}
                      selectionColor={t.accentLine}
                      style={{
                        flex: 1,
                        fontSize: 15,
                        color: it.done ? t.muted : t.fg,
                        textDecorationLine: it.done ? 'line-through' : 'none',
                        paddingVertical: 5
                      }}
                    />
                  </View>
                ))}
              </View>
            )
          case 'raw':
            return (
              <View key={b.key} style={[box(t), { backgroundColor: codeBg(t) }]}>
                <TextInput
                  ref={setRef}
                  value={b.md}
                  onChangeText={(md) => editor.update(b.key, (x) => (x.type === 'raw' ? { ...x, md } : x))}
                  onFocus={() => editor.onFocus(b.key)}
                  onBlur={editor.onBlur}
                  multiline
                  scrollEnabled={false}
                  autoCapitalize="none"
                  autoCorrect={false}
                  cursorColor={t.accent}
                  selectionColor={t.accentLine}
                  style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 19, color: t.fg, padding: 12 }}
                />
              </View>
            )
        }
      })}
    </View>
  )
}

function RemoveButton({ t, label, onPress }: { t: Theme; label: string; onPress: () => void }) {
  return (
    <Pressable hitSlop={10} onPress={onPress} accessibilityLabel={label}>
      <IconX size={15} color={t.faint} />
    </Pressable>
  )
}

const box = (t: Theme) => ({
  borderRadius: 12,
  borderWidth: StyleSheet.hairlineWidth * 2,
  borderColor: t.border
})

const head = (t: Theme) => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderBottomWidth: StyleSheet.hairlineWidth * 2,
  borderBottomColor: t.border
})

/* ---------- Toolbar ---------- */

/** A calm formatting bar. Put it right above the keyboard. */
export function NoteToolbar({ editor }: { editor: NoteEditor }) {
  const t = useTheme()
  const [linkOpen, setLinkOpen] = useState(false)
  const [url, setUrl] = useState('')
  const s = editor.style
  const richOn = editor.focusedType === 'text'
  const a = editor.actions

  const tools: ({ key: string; icon: Icon; label: string; on?: boolean; off?: boolean; run: () => void } | '|')[] = [
    { key: 'h2', icon: IconH2, label: 'Heading', on: richOn && s?.heading.isActive && s.heading.level === 2, off: !richOn, run: a.h2 },
    { key: 'h3', icon: IconH3, label: 'Small heading', on: richOn && s?.heading.isActive && s.heading.level === 3, off: !richOn, run: a.h3 },
    { key: 'b', icon: IconBold, label: 'Bold', on: richOn && s?.bold.isActive, off: !richOn, run: a.bold },
    { key: 'i', icon: IconItalic, label: 'Italic', on: richOn && s?.italic.isActive, off: !richOn, run: a.italic },
    { key: 's', icon: IconStrikethrough, label: 'Strikethrough', on: richOn && s?.strikethrough.isActive, off: !richOn, run: a.strike },
    '|',
    { key: 'ul', icon: IconList, label: 'List', on: richOn && s?.unorderedList.isActive, off: !richOn, run: a.list },
    { key: 'ol', icon: IconListNumbers, label: 'Numbered list', on: richOn && s?.orderedList.isActive, off: !richOn, run: a.numbered },
    { key: 'task', icon: IconListCheck, label: 'Checklist', on: editor.focusedType === 'tasks', run: a.checklist },
    '|',
    { key: 'q', icon: IconBlockquote, label: 'Quote', on: editor.focusedType === 'quote', run: a.quote },
    { key: 'code', icon: IconTerminal2, label: 'Code block', on: editor.focusedType === 'code', run: a.code },
    { key: 'link', icon: IconLink, label: 'Link', on: richOn && (s?.link.isActive || linkOpen), off: !richOn, run: () => setLinkOpen((v) => !v) }
  ]

  return (
    <View
      style={{
        backgroundColor: t.scheme === 'dark' ? t.panel : t.card,
        borderTopWidth: StyleSheet.hairlineWidth * 2,
        borderTopColor: t.border
      }}>
      {linkOpen && richOn ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8 }}>
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="Paste a link"
            placeholderTextColor={t.faint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            cursorColor={t.accent}
            selectionColor={t.accentLine}
            onSubmitEditing={() => {
              if (url.trim()) a.link(url.trim())
              setUrl('')
              setLinkOpen(false)
            }}
            style={{
              flex: 1,
              color: t.fg,
              fontSize: 14,
              backgroundColor: t.card2,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 7
            }}
          />
          <Pressable
            onPress={() => {
              if (url.trim()) a.link(url.trim())
              setUrl('')
              setLinkOpen(false)
            }}
            style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: t.accentSoft }}>
            <Txt variant="small" color={t.accent} style={{ fontWeight: '600' }}>
              Add
            </Txt>
          </Pressable>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ScrollView
          horizontal
          keyboardShouldPersistTaps="always"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, gap: 2 }}>
          {tools.map((x, i) =>
            x === '|' ? (
              <View key={`sep${i}`} style={{ width: 1, height: 18, marginHorizontal: 5, backgroundColor: t.border }} />
            ) : (
              <Tool key={x.key} t={t} icon={x.icon} label={x.label} on={!!x.on} off={!!x.off} onPress={x.run} />
            )
          )}
        </ScrollView>
        <View style={{ width: 1, height: 18, backgroundColor: t.border }} />
        <Tool t={t} icon={IconKeyboardHide} label="Hide keyboard" onPress={() => Keyboard.dismiss()} />
      </View>
    </View>
  )
}

function Tool({ t, icon: Ico, label, on, off, onPress }: { t: Theme; icon: Icon; label: string; on?: boolean; off?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={off ? undefined : onPress}
      accessibilityLabel={label}
      accessibilityState={{ selected: on, disabled: off }}
      style={({ pressed }) => ({
        width: 38,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: off ? 0.35 : 1,
        backgroundColor: on ? t.accentSoft : pressed ? t.card2 : 'transparent'
      })}>
      <Ico size={19} color={on ? t.accent : t.muted} strokeWidth={on ? 2 : 1.7} />
    </Pressable>
  )
}
