import { format, formatDistanceToNowStrict, parseISO, differenceInCalendarDays } from 'date-fns'

// Adapted from the desktop app (src/lib/utils.ts), minus the Tailwind helpers.

let counter = 0
export function uid(): string {
  counter = (counter + 1) % 1e6
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + counter.toString(36)
}

export function today(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function fmtDate(d: string | undefined, pattern = 'd MMM yyyy'): string {
  if (!d) return ''
  try {
    return format(parseISO(d), pattern)
  } catch {
    return d
  }
}

export function fmtHours(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`
  const h = minutes / 60
  return `${h % 1 === 0 ? h : h.toFixed(1)}h`
}

export function relative(d: string): string {
  return formatDistanceToNowStrict(parseISO(d), { addSuffix: true })
}

export function daysUntil(d: string): number {
  return differenceInCalendarDays(parseISO(d), new Date())
}

export function dueLabel(d: string): { text: string; tone: 'danger' | 'warn' | 'muted' } {
  const n = daysUntil(d)
  if (n < 0) return { text: `${-n} day${n === -1 ? '' : 's'} late`, tone: 'danger' }
  if (n === 0) return { text: 'Today', tone: 'warn' }
  if (n === 1) return { text: 'Tomorrow', tone: 'warn' }
  if (n <= 7) return { text: `In ${n} days`, tone: 'warn' }
  return { text: fmtDate(d, 'd MMM'), tone: 'muted' }
}

export function hostOf(url: string): string {
  const m = /^[a-z]+:\/\/([^/?#]+)/i.exec(url)
  return m ? m[1].replace(/^www\./, '') : ''
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

/** Plain text preview of a markdown body. */
export function preview(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#+\s.*$/gm, ' ')
    .replace(/^\s*\|.*$/gm, ' ')
    .replace(/^\s*[-*]\s+(\[[ xX]\]\s+)?/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/-{3,}/g, ' ')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (/[.!?:;,]$/.test(l) ? l : l + '.'))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
