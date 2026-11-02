import { Fragment, type ReactNode } from 'react'
import { Linking, StyleSheet, Text, View } from 'react-native'
import { IconCheck } from '@/lib/icons'
import { useTheme, type Theme } from '@/theme'

/**
 * A small Markdown renderer written for CyberJourney (no third-party code).
 * Supports headings, paragraphs, lists, task lists, quotes, code blocks,
 * tables, rules, and inline bold / italic / code / links.
 */

type Block =
  | { type: 'h'; level: number; text: string }
  | { type: 'p'; text: string }
  | { type: 'code'; text: string; lang: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; ordered: boolean; items: { text: string; task?: boolean; checked?: boolean }[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'hr' }

function parse(src: string): Block[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const out: Block[] = []
  let i = 0
  const cells = (l: string) =>
    l
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((c) => c.trim())
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }
    const fence = /^```(\w*)/.exec(line)
    if (fence) {
      const buf: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++])
      i++
      out.push({ type: 'code', text: buf.join('\n'), lang: fence[1] })
      continue
    }
    const h = /^(#{1,4})\s+(.*)/.exec(line)
    if (h) {
      out.push({ type: 'h', level: h[1].length, text: h[2] })
      i++
      continue
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      out.push({ type: 'hr' })
      i++
      continue
    }
    if (line.startsWith('>')) {
      const buf: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) buf.push(lines[i++].replace(/^>\s?/, ''))
      out.push({ type: 'quote', text: buf.join(' ') })
      continue
    }
    if (line.trim().startsWith('|') && i + 1 < lines.length && /^\s*\|?[\s:-]+\|/.test(lines[i + 1])) {
      const head = cells(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(cells(lines[i++]))
      out.push({ type: 'table', head, rows })
      continue
    }
    const li = /^\s*([-*+]|\d+\.)\s+/
    if (li.test(line)) {
      const ordered = /^\s*\d+\./.test(line)
      const items: { text: string; task?: boolean; checked?: boolean }[] = []
      while (i < lines.length && li.test(lines[i])) {
        const text = lines[i++].replace(li, '')
        const task = /^\[( |x|X)\]\s+/.exec(text)
        items.push(task ? { text: text.slice(task[0].length), task: true, checked: task[1] !== ' ' } : { text })
      }
      out.push({ type: 'list', ordered, items })
      continue
    }
    const buf: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|>|\s*([-*+]|\d+\.)\s)/.test(lines[i])) buf.push(lines[i++].trim())
    out.push({ type: 'p', text: buf.join(' ') })
  }
  return out
}

function inline(text: string, t: Theme, base: object): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*|_[^_]+_)|(\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const s = m[0]
    if (m[1])
      nodes.push(
        <Text key={k++} style={{ fontFamily: 'monospace', fontSize: 13, color: t.accent2, backgroundColor: t.card2 }}>
          {` ${s.slice(1, -1)} `}
        </Text>
      )
    else if (m[2])
      nodes.push(
        <Text key={k++} style={[base, { fontWeight: '700' }]}>
          {s.slice(2, -2)}
        </Text>
      )
    else if (m[3])
      nodes.push(
        <Text key={k++} style={[base, { fontStyle: 'italic' }]}>
          {s.slice(1, -1)}
        </Text>
      )
    else {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(s)!
      nodes.push(
        <Text key={k++} style={{ color: t.accent, textDecorationLine: 'underline' }} onPress={() => Linking.openURL(lm[2])}>
          {lm[1]}
        </Text>
      )
    }
    last = m.index + s.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function Markdown({ source }: { source: string }) {
  const t = useTheme()
  const body = { color: t.fg, fontSize: 15, lineHeight: 23 }
  const blocks = parse(source)
  const hair = StyleSheet.hairlineWidth * 2
  return (
    <View style={{ gap: 12 }}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h':
            return (
              <Text
                key={i}
                style={{ color: t.fg, fontWeight: '700', fontSize: b.level === 1 ? 22 : b.level === 2 ? 18 : 16, marginTop: i ? 6 : 0, letterSpacing: -0.2 }}>
                {inline(b.text, t, {})}
              </Text>
            )
          case 'p':
            return (
              <Text key={i} style={body}>
                {inline(b.text, t, body)}
              </Text>
            )
          case 'hr':
            return <View key={i} style={{ height: hair, backgroundColor: t.border }} />
          case 'quote':
            return (
              <View key={i} style={{ borderLeftWidth: 3, borderLeftColor: t.accentLine, paddingLeft: 12, paddingVertical: 2 }}>
                <Text style={[body, { color: t.muted }]}>{inline(b.text, t, body)}</Text>
              </View>
            )
          case 'code':
            return (
              <View key={i} style={{ backgroundColor: t.chrome, borderRadius: 12, borderWidth: hair, borderColor: t.border, padding: 12 }}>
                <Text style={{ fontFamily: 'monospace', fontSize: 12.5, lineHeight: 19, color: t.fg }}>{b.text}</Text>
              </View>
            )
          case 'list':
            return (
              <View key={i} style={{ gap: 6 }}>
                {b.items.map((it, j) => (
                  <View key={j} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                    {it.task ? (
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          marginTop: 2.5,
                          borderRadius: 6,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: it.checked ? t.accent : 'transparent',
                          borderWidth: it.checked ? 0 : 1.5,
                          borderColor: t.borderStrong
                        }}>
                        {it.checked ? <IconCheck size={13} color={t.accentFg} strokeWidth={2.6} /> : null}
                      </View>
                    ) : (
                      <Text style={[body, { color: t.faint, width: 18, textAlign: 'center' }]}>{b.ordered ? `${j + 1}.` : '•'}</Text>
                    )}
                    <Text style={[body, { flex: 1 }, it.checked && { color: t.muted, textDecorationLine: 'line-through' }]}>{inline(it.text, t, body)}</Text>
                  </View>
                ))}
              </View>
            )
          case 'table':
            return (
              <View key={i} style={{ borderWidth: hair, borderColor: t.border, borderRadius: 12, overflow: 'hidden' }}>
                {[b.head, ...b.rows].map((r, ri) => (
                  <View
                    key={ri}
                    style={{
                      flexDirection: 'row',
                      backgroundColor: ri === 0 ? t.card2 : 'transparent',
                      borderTopWidth: ri ? hair : 0,
                      borderTopColor: t.border
                    }}>
                    {r.map((c, ci) => (
                      <Fragment key={ci}>
                        <Text style={{ flex: 1, padding: 10, color: ri === 0 ? t.muted : t.fg, fontSize: 13.5, fontWeight: ri === 0 ? '600' : '400' }}>
                          {inline(c, t, {})}
                        </Text>
                      </Fragment>
                    ))}
                  </View>
                ))}
              </View>
            )
        }
      })}
    </View>
  )
}
