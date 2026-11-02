// Shared data model, copied from the desktop app (src/lib/types.ts).
// Only change: the mobile app can also follow the system theme.

export type TopicStatus = 'todo' | 'learning' | 'done'
export type WorkStatus = 'todo' | 'doing' | 'done'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'insane'
export type CertStatus = 'planned' | 'studying' | 'booked' | 'passed'
export type ResourceKind = 'course' | 'book' | 'video' | 'platform' | 'article' | 'tool'
export type AreaIcon = 'network' | 'linux' | 'web' | 'crypto' | 'pentest' | 'blue' | 'cloud' | 'code' | 'shield'

export interface Area {
  id: string
  name: string
  icon: AreaIcon
  color: string
  description: string
  sample?: boolean
}

export interface Topic {
  id: string
  areaId: string
  title: string
  status: TopicStatus
  notes: string
  updatedAt: string
  sample?: boolean
}

export interface LogEntry {
  id: string
  date: string // YYYY-MM-DD
  title: string
  body: string
  tags: string[]
  minutes: number
  topicId?: string
  createdAt: string
  sample?: boolean
}

export interface Resource {
  id: string
  title: string
  kind: ResourceKind
  url: string
  status: WorkStatus
  areaId?: string
  notes: string
  free: boolean
  createdAt: string
  sample?: boolean
}

export interface Lab {
  id: string
  name: string
  platform: string
  difficulty: Difficulty
  status: WorkStatus
  url: string
  writeup: string
  tags: string[]
  areaId?: string
  minutes: number
  date?: string
  createdAt: string
  sample?: boolean
}

export interface Cert {
  id: string
  name: string
  provider: string
  targetDate?: string
  progress: number
  status: CertStatus
  notes: string
  url: string
  sample?: boolean
}

export interface Goal {
  id: string
  title: string
  deadline?: string
  done: boolean
  doneAt?: string
  areaId?: string
  createdAt: string
  sample?: boolean
}

export interface Settings {
  theme: 'system' | 'dark' | 'light'
  name: string
  weeklyGoalHours: number
  accent: 'periwinkle' | 'sage' | 'rose'
}

export interface AppData {
  version: 1
  settings: Settings
  areas: Area[]
  topics: Topic[]
  logs: LogEntry[]
  resources: Resource[]
  labs: Lab[]
  certs: Cert[]
  goals: Goal[]
}

export type Page = 'dashboard' | 'roadmap' | 'journal' | 'labs' | 'resources' | 'certs' | 'goals' | 'settings'
