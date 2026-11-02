import * as I from './icons'
import type { AreaIcon, CertStatus, Difficulty, ResourceKind, TopicStatus, WorkStatus } from './types'

// Same mappings as the desktop app (src/lib/icons.tsx, src/lib/platforms.ts).
export const AREA_ICONS: Record<AreaIcon, I.Icon> = {
  network: I.IconNetwork,
  linux: I.IconTerminal2,
  web: I.IconWorldWww,
  crypto: I.IconKey,
  pentest: I.IconSword,
  blue: I.IconShieldHalf,
  cloud: I.IconCloudLock,
  code: I.IconCode,
  shield: I.IconShield
}

export const KIND_META: Record<ResourceKind, { label: string; icon: I.Icon; color: string }> = {
  course: { label: 'Course', icon: I.IconSchool, color: 'var(--c-jade)' },
  book: { label: 'Book', icon: I.IconBook, color: 'var(--c-amber)' },
  video: { label: 'Video', icon: I.IconVideo, color: 'var(--c-red)' },
  platform: { label: 'Platform', icon: I.IconDeviceGamepad2, color: 'var(--c-cyan)' },
  article: { label: 'Article', icon: I.IconArticle, color: 'var(--c-violet)' },
  tool: { label: 'Tool', icon: I.IconTool, color: 'var(--c-orange)' }
}

export const DIFF_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard', insane: 'Insane' }
export const WORK_LABEL: Record<WorkStatus, string> = { todo: 'To do', doing: 'In progress', done: 'Done' }
export const TOPIC_LABEL: Record<TopicStatus, string> = { todo: 'To do', learning: 'Learning', done: 'Done' }
export const CERT_LABEL: Record<CertStatus, string> = { planned: 'Planned', studying: 'Studying', booked: 'Booked', passed: 'Passed' }
