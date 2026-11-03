import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createRoadmap, createSampleData, DEFAULT_SETTINGS } from './seed'
import type { AppData, Settings } from './types'

type Collections = 'areas' | 'topics' | 'logs' | 'resources' | 'labs' | 'certs' | 'goals'
type ItemOf<K extends Collections> = AppData[K][number]

interface Actions {
  upsert: <K extends Collections>(key: K, item: ItemOf<K>) => void
  remove: <K extends Collections>(key: K, id: string) => void
  setSettings: (patch: Partial<Settings>) => void
  resetSample: () => void
  addStarterRoadmap: () => void
  resetEmpty: () => void
}

interface Meta {
  hydrated: boolean
}

const STORAGE_KEY = 'kryfsec-data'
// Data saved by the app under its old name. Read once if the new key is empty.
const OLD_STORAGE_KEY = 'cyber' + 'journey-data'
const storageWithOldKey = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await AsyncStorage.getItem(name)
    if (value !== null || name !== STORAGE_KEY) return value
    return AsyncStorage.getItem(OLD_STORAGE_KEY)
  },
  setItem: (name: string, value: string): Promise<void> => AsyncStorage.setItem(name, value),
  removeItem: (name: string): Promise<void> => AsyncStorage.removeItem(name)
}

export type Store = AppData & Actions & Meta

const EMPTY: AppData = {
  version: 1,
  settings: { ...DEFAULT_SETTINGS },
  areas: [],
  topics: [],
  logs: [],
  resources: [],
  labs: [],
  certs: [],
  goals: []
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // A first start begins with a clean slate: no roadmap, no entries.
      ...EMPTY,
      settings: { ...DEFAULT_SETTINGS },
      hydrated: false,
      upsert: (key, item) =>
        set((s) => {
          const list = s[key] as { id: string }[]
          const i = list.findIndex((x) => x.id === item.id)
          const next = i >= 0 ? list.map((x, j) => (j === i ? item : x)) : [item, ...list]
          return { [key]: next } as Partial<Store>
        }),
      remove: (key, id) =>
        set((s) => {
          const patch: Partial<AppData> = { [key]: (s[key] as { id: string }[]).filter((x) => x.id !== id) }
          // An area takes its topics with it (same as the desktop app).
          if (key === 'areas') patch.topics = s.topics.filter((x) => x.areaId !== id)
          return patch as Partial<Store>
        }),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      resetSample: () => set((s) => ({ ...createSampleData(), settings: s.settings })),
      // Picked on purpose, so not marked `sample` (sync would drop it on join).
      addStarterRoadmap: () =>
        set((s) => {
          const r = createRoadmap(false)
          return {
            areas: [...s.areas, ...r.areas.map((a) => ({ ...a, sample: false }))],
            topics: [...s.topics, ...r.topics.map((x) => ({ ...x, sample: false }))]
          }
        }),
      resetEmpty: () => set((s) => ({ ...EMPTY, settings: s.settings }))
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => storageWithOldKey),
      partialize: (s): AppData => ({
        version: 1,
        settings: s.settings,
        areas: s.areas,
        topics: s.topics,
        logs: s.logs,
        resources: s.resources,
        labs: s.labs,
        certs: s.certs,
        goals: s.goals
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppData>
        return { ...current, ...p, settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) } }
      },
      onRehydrateStorage: () => () => {
        useStore.setState({ hydrated: true })
      }
    }
  )
)
