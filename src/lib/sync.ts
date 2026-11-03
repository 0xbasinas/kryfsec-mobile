import './polyfills'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fetch as expoFetch } from 'expo/fetch'
import { File, Paths } from 'expo-file-system'
import * as SecureStore from 'expo-secure-store'
import { AppState, Platform } from 'react-native'
import { create } from 'zustand'
import { appToSnapshot, dropSamples, fetchHttp, KRYFSEC_SCHEMA, snapshotToApp, SyncController, type KryfsecData, type SyncState, type SyncStatus } from '@/sync-core'
import { useStore, type Store } from './store'
import type { AppData } from './types'

const KEY_NAME = 'kryfsec-sync-key'
const STATE_NAME = 'kryfsec-sync-state'

// SecureStore keeps the key in the Android Keystore / iOS Keychain. The web build has no
// SecureStore, so it falls back to local storage there (web is only for testing).
const keyStore = {
  get: (): Promise<string | null> => (Platform.OS === 'web' ? AsyncStorage.getItem(KEY_NAME) : SecureStore.getItemAsync(KEY_NAME)),
  set: (v: string | null): Promise<void> =>
    Platform.OS === 'web'
      ? v === null
        ? AsyncStorage.removeItem(KEY_NAME)
        : AsyncStorage.setItem(KEY_NAME, v)
      : v === null
        ? SecureStore.deleteItemAsync(KEY_NAME)
        : SecureStore.setItemAsync(KEY_NAME, v)
}

// The sync state holds a copy of the last synced data, so on the phone it goes in a file
// (AsyncStorage on Android has a small size limit per item). The web build keeps local storage.
// Older versions kept it in AsyncStorage; it is moved over on first load.
const stateFile = (): File => new File(Paths.document, 'kryfsec-sync-state.json')
const stateStore = {
  load: async (): Promise<SyncState | null> => {
    let raw: string | null = null
    if (Platform.OS !== 'web') {
      const f = stateFile()
      if (f.exists) raw = await f.text()
    }
    if (raw === null) raw = await AsyncStorage.getItem(STATE_NAME)
    if (!raw) return null
    try {
      return JSON.parse(raw) as SyncState
    } catch {
      return null // a broken copy: the next sync rebuilds it from the server
    }
  },
  save: async (s: SyncState | null): Promise<void> => {
    if (Platform.OS === 'web') {
      await (s ? AsyncStorage.setItem(STATE_NAME, JSON.stringify(s)) : AsyncStorage.removeItem(STATE_NAME))
      return
    }
    const f = stateFile()
    if (s) await f.write(JSON.stringify(s))
    else if (f.exists) f.delete()
    await AsyncStorage.removeItem(STATE_NAME)
  }
}

/** fetch with a 60 second time limit (uploads go in batches of up to 4 MB). */
const timedFetch = ((url: string, init?: RequestInit) => {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 60_000)
  return expoFetch(url, { ...(init as object), signal: ctrl.signal } as never).finally(() => clearTimeout(timer))
}) as unknown as typeof fetch

const pick = (s: Store): AppData => ({
  version: 1,
  settings: s.settings,
  areas: s.areas,
  topics: s.topics,
  logs: s.logs,
  resources: s.resources,
  labs: s.labs,
  certs: s.certs,
  goals: s.goals
})
const current = (): AppData => pick(useStore.getState())
let applying = false

export const sync = new SyncController({
  http: fetchHttp(timedFetch),
  storage: {
    loadKey: keyStore.get,
    saveKey: keyStore.set,
    loadState: stateStore.load,
    saveState: stateStore.save
  },
  schema: KRYFSEC_SCHEMA,
  read: () => appToSnapshot(current() as unknown as KryfsecData),
  write: (snap) => {
    const next = snapshotToApp(snap, current() as unknown as KryfsecData) as unknown as AppData
    applying = true
    try {
      useStore.setState({ ...next, settings: { ...current().settings, ...next.settings } })
    } finally {
      applying = false
    }
  },
  onJoin: dropSamples
})

export const useSync = create<SyncStatus>(() => sync.status)
sync.subscribe((s) => useSync.setState(s, true))

let started = false
/** Call once after the saved data is loaded. */
export async function startSync(): Promise<void> {
  if (started) return
  started = true
  const st = await sync.init()
  if (st.paired) void sync.syncNow()

  // Sync a few seconds after edits (not after changes that came from sync).
  let last = current()
  useStore.subscribe((s) => {
    const now = pick(s)
    const changed = (Object.keys(now) as (keyof AppData)[]).some((k) => now[k] !== last[k])
    last = now
    if (changed && !applying) sync.noteEdit()
  })

  // Also when the app comes back to the front, and every 5 minutes while open.
  AppState.addEventListener('change', (state) => {
    if (state !== 'active') return
    const s = sync.status
    if (s.paired && !s.busy && (!s.lastSync || Date.now() - s.lastSync > 30_000)) void sync.syncNow()
  })
  setInterval(() => {
    if (sync.status.paired && AppState.currentState === 'active') void sync.syncNow()
  }, 5 * 60_000)
}

/** For pull to refresh: sync if paired. */
export async function refreshSync(): Promise<void> {
  if (sync.status.paired) await sync.syncNow()
}
