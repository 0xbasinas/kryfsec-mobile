/**
 * Splits a markdown note into blocks for the mobile editor.
 *
 * The rich text input (react-native-enriched-markdown) handles headings,
 * bold, italic, strike, links and lists. It does not handle code blocks,
 * quotes, checklists or tables, so those get their own simple blocks.
 * Joining the blocks again gives back plain markdown, which is what we store.
 */

export type TaskItem = { key: string; done: boolean; text: string }

export type Block =
  | { key: string; type: 'text'; md: string }
  | { key: string; type: 'code'; lang: string; code: string }
  | { key: string; type: 'tasks'; items: TaskItem[] }
  | { key: string; type: 'quote'; text: string }
  | { key: string; type: 'raw'; md: string }

let n = 0
export const bkey = (): string => `b${Date.now().toString(36)}${(n++).toString(36)}`

const FENCE = /^(\s{0,3})(`{3,}|~{3,})\s*([\w+#.-]*)/
const TASK = /^\s*[-*+]\s+\[( |x|X)\]\s?(.*)$/
const QUOTE = /^\s{0,3}>\s?(.*)$/
const TABLE = /^\s*\|/

export function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, '\n').split('\n')
  const out: Block[] = []
  let text: string[] = []

  const flushText = () => {
    const s = text.join('\n').replace(/^\n+|\n+$/g, '')
    if (s.trim()) out.push({ key: bkey(), type: 'text', md: s })
    text = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const f = FENCE.exec(line)
    if (f) {
      flushText()
      const mark = f[2]
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith(mark)) body.push(lines[i++])
      out.push({ key: bkey(), type: 'code', lang: f[3] || '', code: body.join('\n') })
      continue
    }
    if (TASK.test(line)) {
      flushText()
      const items: TaskItem[] = []
      while (i < lines.length && TASK.test(lines[i])) {
        const m = TASK.exec(lines[i])!
        items.push({ key: bkey(), done: m[1] !== ' ', text: m[2] })
        i++
      }
      i--
      out.push({ key: bkey(), type: 'tasks', items })
      continue
    }
    if (QUOTE.test(line)) {
      flushText()
      const body: string[] = []
      while (i < lines.length && QUOTE.test(lines[i])) body.push(QUOTE.exec(lines[i++])![1])
      i--
      out.push({ key: bkey(), type: 'quote', text: body.join('\n') })
      continue
    }
    if (TABLE.test(line)) {
      flushText()
      const body: string[] = []
      while (i < lines.length && TABLE.test(lines[i])) body.push(lines[i++])
      i--
      out.push({ key: bkey(), type: 'raw', md: body.join('\n') })
      continue
    }
    text.push(line)
  }
  flushText()
  return withTrailingText(out)
}

/** Keeps an empty text block at the end so there is always a place to type. */
export function withTrailingText(blocks: Block[]): Block[] {
  const last = blocks[blocks.length - 1]
  if (!last || last.type !== 'text') return [...blocks, { key: bkey(), type: 'text', md: '' }]
  return blocks
}

export function blockToMarkdown(b: Block): string {
  switch (b.type) {
    case 'text':
      return b.md.replace(/^\n+|\s+$/g, '')
    case 'raw':
      return b.md.replace(/\s+$/g, '')
    case 'code': {
      const fence = b.code.includes('```') ? '~~~' : '```'
      return `${fence}${b.lang}\n${b.code.replace(/\n+$/, '')}\n${fence}`
    }
    case 'tasks':
      return b.items.map((it) => `- [${it.done ? 'x' : ' '}] ${it.text}`.trimEnd()).join('\n')
    case 'quote':
      return b.text
        .replace(/\n+$/, '')
        .split('\n')
        .map((l) => (l ? `> ${l}` : '>'))
        .join('\n')
  }
}

export function blocksToMarkdown(blocks: Block[]): string {
  return blocks
    .map(blockToMarkdown)
    .filter((s) => s.trim() && s !== '>' && !/^- \[ \]$/.test(s))
    .join('\n\n')
}

/**
 * The rich input drops backticks around inline code (it keeps only the text).
 * Escaping them first makes the input keep them as plain characters, so
 * `code` survives a round trip and still renders as code in the viewer.
 */
export function escapeForInput(md: string): string {
  return md.replace(/(^|[^\\])`/g, '$1\\`').replace(/(^|[^\\])`/g, '$1\\`')
}

/** Toggles the nth task (0-based, in document order) in a markdown string. */
export function toggleTask(md: string, index: number, checked: boolean): string {
  let seen = -1
  let inFence = false
  return md
    .split('\n')
    .map((line) => {
      if (FENCE.test(line)) inFence = !inFence
      if (inFence) return line
      const m = /^(\s*[-*+]\s+\[)( |x|X)(\].*)$/.exec(line)
      if (!m) return line
      seen++
      return seen === index ? `${m[1]}${checked ? 'x' : ' '}${m[3]}` : line
    })
    .join('\n')
}
