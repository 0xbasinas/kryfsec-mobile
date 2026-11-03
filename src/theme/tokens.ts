/**
 * kryfsec design tokens for React Native.
 * Same values as the desktop app (src/index.css): calm warm neutral grays
 * (in the spirit of Linear / Vercel Geist) with one muted accent.
 */
export type Scheme = 'dark' | 'light'
export type AccentName = 'periwinkle' | 'sage' | 'rose'

const HUES = {
  light: {
    periwinkle: '#55609f',
    sage: '#4c6f58',
    rose: '#9a5650',
    sand: '#7d6439',
    slate: '#4b6680',
    mauve: '#765d86',
    clay: '#8a5a3b',
    teal: '#446e6b',
    olive: '#646b3f'
  },
  dark: {
    periwinkle: '#9aa3d9',
    sage: '#93b09c',
    rose: '#cf9e9a',
    sand: '#c8b28c',
    slate: '#8fa8bf',
    mauve: '#b59cc4',
    clay: '#c9a084',
    teal: '#8db3b0',
    olive: '#a9b08a'
  }
} as const

// Old color names kept so saved data keeps working (same as desktop).
const ALIASES: Record<string, keyof (typeof HUES)['dark']> = {
  jade: 'sage',
  cyan: 'teal',
  blue: 'slate',
  iris: 'periwinkle',
  violet: 'mauve',
  pink: 'rose',
  red: 'rose',
  orange: 'clay',
  amber: 'sand',
  grass: 'olive',
  sky: 'slate',
  plum: 'mauve'
}

const BASE = {
  light: {
    bg: '#f7f7f5',
    chrome: '#efefec',
    panel: '#fafaf9',
    card: '#ffffff',
    card2: '#f0f0ee',
    border: '#e9e9e6',
    borderStrong: '#dcdcd8',
    fg: '#1f1f1e',
    muted: '#5f5e59',
    faint: '#6d6c67',
    accentFg: '#ffffff',
    success: '#3f7350',
    danger: '#a5524a',
    warn: '#83652e',
    info: '#4f6690'
  },
  dark: {
    bg: '#161615',
    chrome: '#111110',
    panel: '#181817',
    card: '#1c1c1b',
    card2: '#242423',
    border: '#2a2a28',
    borderStrong: '#363634',
    fg: '#ececea',
    muted: '#a8a7a1',
    faint: '#8d8c87',
    accentFg: '#161615',
    success: '#8fb59a',
    danger: '#d49a94',
    warn: '#c9ad7d',
    info: '#94a8c8'
  }
} as const

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Same idea as CSS color-mix(in srgb, a p%, b). */
export function mix(a: string, b: string, p: number): string {
  const x = hexToRgb(a)
  const y = hexToRgb(b)
  const c = x.map((v, i) => Math.round(v * p + y[i] * (1 - p)))
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('')
}

export function alpha(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function makeTheme(scheme: Scheme, accentName: AccentName = 'periwinkle') {
  const base = BASE[scheme]
  const hues = HUES[scheme]
  const accent = hues[accentName]
  return {
    scheme,
    ...base,
    hues,
    accent,
    accent2: mix(accent, base.fg, scheme === 'dark' ? 0.72 : 0.7),
    accentSoft: alpha(accent, scheme === 'dark' ? 0.12 : 0.09),
    accentLine: alpha(accent, 0.28),
    /** Resolves desktop color strings like `var(--c-slate)` to a hex value. */
    color(value: string | undefined): string {
      if (!value) return base.muted
      const m = /--c-([a-z]+)/.exec(value)
      if (m) {
        const name = (m[1] in hues ? m[1] : ALIASES[m[1]]) as keyof typeof hues | undefined
        if (name) return hues[name]
      }
      if (value.startsWith('#')) return value
      return accent
    }
  }
}

export type Theme = ReturnType<typeof makeTheme>

export const radius = { sm: 8, md: 12, lg: 16, xl: 18, pill: 999 }
export const space = (n: number): number => n * 4
