// Copied from the desktop app (src/lib/stats.ts).
import { format, startOfWeek, subDays, parseISO, isAfter } from 'date-fns'
import type { AppData, Area, Topic } from './types'

/** Minutes studied per day (journal entries + finished/started labs with a date). */
export function minutesByDay(data: Pick<AppData, 'logs' | 'labs'>): Map<string, number> {
  const m = new Map<string, number>()
  for (const l of data.logs) m.set(l.date, (m.get(l.date) ?? 0) + (l.minutes || 0))
  return m
}

export function activeDays(data: Pick<AppData, 'logs' | 'labs'>): Set<string> {
  const s = new Set<string>(data.logs.map((l) => l.date))
  for (const l of data.labs) if (l.date && l.status === 'done') s.add(l.date)
  return s
}

export function streak(data: Pick<AppData, 'logs' | 'labs'>): { current: number; best: number; todayDone: boolean } {
  const days = activeDays(data)
  const key = (n: number): string => format(subDays(new Date(), n), 'yyyy-MM-dd')
  const todayDone = days.has(key(0))
  let current = 0
  for (let i = todayDone ? 0 : 1; days.has(key(i)); i++) current++
  // best streak
  const sorted = [...days].sort()
  let best = 0
  let run = 0
  let prev: Date | null = null
  for (const d of sorted) {
    const cur = parseISO(d)
    if (prev && format(subDays(cur, 1), 'yyyy-MM-dd') === format(prev, 'yyyy-MM-dd')) run++
    else run = 1
    best = Math.max(best, run)
    prev = cur
  }
  return { current, best: Math.max(best, current), todayDone }
}

export function weekMinutes(data: Pick<AppData, 'logs' | 'labs'>): number {
  const start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  return data.logs.filter((l) => l.date >= start).reduce((a, l) => a + (l.minutes || 0), 0)
}

export function lastDays(data: Pick<AppData, 'logs' | 'labs'>, n: number): { date: string; label: string; hours: number }[] {
  const m = minutesByDay(data)
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const dt = subDays(new Date(), i)
    const k = format(dt, 'yyyy-MM-dd')
    out.push({ date: k, label: format(dt, 'd MMM'), hours: +((m.get(k) ?? 0) / 60).toFixed(2) })
  }
  return out
}

export interface AreaProgress {
  area: Area
  total: number
  done: number
  learning: number
  pct: number
}

export function areaProgress(areas: Area[], topics: Topic[]): AreaProgress[] {
  return areas.map((area) => {
    const ts = topics.filter((t) => t.areaId === area.id)
    const done = ts.filter((t) => t.status === 'done').length
    const learning = ts.filter((t) => t.status === 'learning').length
    const pct = ts.length ? Math.round(((done + learning * 0.5) / ts.length) * 100) : 0
    return { area, total: ts.length, done, learning, pct }
  })
}

export interface Activity {
  id: string
  kind: 'log' | 'lab' | 'goal'
  title: string
  date: string
  meta: string
}

export function recentActivity(data: AppData, n = 6): Activity[] {
  const items: Activity[] = [
    ...data.logs.map((l) => ({ id: l.id, kind: 'log' as const, title: l.title || 'Untitled entry', date: l.date, meta: `${l.minutes} min` })),
    ...data.labs
      .filter((l) => l.status === 'done' && l.date)
      .map((l) => ({ id: l.id, kind: 'lab' as const, title: `Solved ${l.name}`, date: l.date!, meta: l.platform })),
    ...data.goals.filter((g) => g.done && g.doneAt).map((g) => ({ id: g.id, kind: 'goal' as const, title: `Goal done: ${g.title}`, date: g.doneAt!, meta: '' }))
  ]
  return items.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, n)
}

export function heatmap(data: Pick<AppData, 'logs' | 'labs'>, weeks = 20): { date: string; minutes: number; future: boolean }[][] {
  const m = minutesByDay(data)
  const end = new Date()
  const start = startOfWeek(subDays(end, (weeks - 1) * 7), { weekStartsOn: 1 })
  const cols: { date: string; minutes: number; future: boolean }[][] = []
  for (let w = 0; w < weeks; w++) {
    const col = []
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start)
      dt.setDate(start.getDate() + w * 7 + d)
      const k = format(dt, 'yyyy-MM-dd')
      col.push({ date: k, minutes: m.get(k) ?? 0, future: isAfter(dt, end) })
    }
    cols.push(col)
  }
  return cols
}

export function totalMinutes(data: Pick<AppData, 'logs'>): number {
  return data.logs.reduce((a, l) => a + (l.minutes || 0), 0)
}
