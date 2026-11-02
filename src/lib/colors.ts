import { mix, type Theme } from '@/theme'
import type { Difficulty, WorkStatus } from './types'

export function diffColor(t: Theme, d: Difficulty): string {
  return { easy: t.muted, medium: mix(t.accent, t.muted, 0.55), hard: t.accent, insane: t.danger }[d]
}
export function statusColor(t: Theme, s: WorkStatus): string {
  return { todo: t.faint, doing: t.warn, done: t.success }[s]
}
