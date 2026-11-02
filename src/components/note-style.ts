import type { MarkdownStyle } from 'react-native-enriched-markdown'
import { alpha, mix, type Theme } from '@/theme'

/**
 * Note styles built from the app theme, so the enriched-markdown viewer and
 * editor use our calm palette instead of the library defaults.
 */
export const MONO = 'monospace'

export function noteViewStyle(t: Theme): MarkdownStyle {
  const dark = t.scheme === 'dark'
  const codeBg = dark ? t.chrome : t.card2
  const head = { color: t.fg, fontWeight: '700', marginTop: 10, marginBottom: 6 } as const
  return {
    paragraph: { fontSize: 15, lineHeight: 23, color: t.fg, marginTop: 0, marginBottom: 10 },
    h1: { ...head, fontSize: 22, lineHeight: 28 },
    h2: { ...head, fontSize: 18, lineHeight: 25 },
    h3: { ...head, fontSize: 16, lineHeight: 23 },
    h4: { ...head, fontSize: 15, lineHeight: 22 },
    h5: { ...head, fontSize: 14, lineHeight: 21, color: t.muted },
    h6: { ...head, fontSize: 13, lineHeight: 20, color: t.muted },
    strong: { color: t.fg },
    em: { color: t.fg },
    strikethrough: { color: t.faint },
    link: { color: t.accent, underline: true },
    code: { color: t.accent2, backgroundColor: codeBg, borderColor: t.border, fontSize: 13.5 },
    codeBlock: {
      fontFamily: MONO,
      fontSize: 12.5,
      lineHeight: 19,
      color: t.fg,
      backgroundColor: codeBg,
      borderColor: t.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      marginTop: 4,
      marginBottom: 12,
      syntaxColors: {
        keyword: t.hues.periwinkle,
        string: t.hues.sage,
        number: t.hues.sand,
        constant: t.hues.sand,
        comment: t.faint,
        function: t.hues.slate,
        type: t.hues.teal,
        property: t.hues.mauve,
        tag: t.hues.periwinkle,
        attribute: t.hues.clay,
        operator: t.muted,
        punctuation: t.muted,
        variable: t.fg,
        embedded: t.fg
      }
    },
    blockquote: {
      fontSize: 15,
      lineHeight: 23,
      color: t.muted,
      borderColor: t.accentLine,
      borderWidth: 3,
      gapWidth: 12,
      backgroundColor: 'transparent',
      marginBottom: 10
    },
    list: {
      fontSize: 15,
      lineHeight: 23,
      color: t.fg,
      bulletColor: t.faint,
      bulletSize: 5,
      markerColor: t.faint,
      gapWidth: 8,
      marginLeft: 18,
      itemSpacing: 2,
      marginBottom: 10
    },
    taskList: {
      checkedColor: t.accent,
      borderColor: t.borderStrong,
      checkmarkColor: t.accentFg,
      checkboxSize: 16,
      checkboxBorderRadius: 5,
      checkedTextColor: t.muted,
      checkedStrikethrough: true
    },
    thematicBreak: { color: t.border, height: 1, marginTop: 8, marginBottom: 14 },
    table: {
      fontSize: 13.5,
      color: t.fg,
      headerBackgroundColor: t.card2,
      headerTextColor: t.muted,
      rowEvenBackgroundColor: 'transparent',
      rowOddBackgroundColor: alpha(t.card2, 0.5),
      borderColor: t.border,
      borderWidth: 1,
      borderRadius: 10,
      cellPaddingHorizontal: 10,
      cellPaddingVertical: 8,
      marginBottom: 12
    },
    highlight: { backgroundColor: t.accentSoft, color: t.fg },
    spoiler: { color: t.muted }
  }
}

export function codeBg(t: Theme): string {
  return t.scheme === 'dark' ? t.chrome : t.card2
}

export function softBorder(t: Theme): string {
  return mix(t.border, t.bg, 0.8)
}
