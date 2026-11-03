// Sync code (noble) needs crypto.getRandomValues. Hermes does not have it, so use expo-crypto.
import { getRandomValues } from 'expo-crypto'

const g = globalThis as { crypto?: { getRandomValues?: unknown } }
if (!g.crypto) g.crypto = {}
if (typeof g.crypto.getRandomValues !== 'function') g.crypto.getRandomValues = getRandomValues
