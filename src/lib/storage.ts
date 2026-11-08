import { useEffect, useState } from 'react'

const PREFIX = 'fht:v1:'

/** Keep only finite numbers for known keys; fall back to defaults. */
export function sanitizeNumbers<T extends object>(raw: unknown, defaults: T): T {
  const out = { ...defaults } as Record<string, unknown>
  if (raw && typeof raw === 'object') {
    for (const k of Object.keys(defaults)) {
      const v = (raw as Record<string, unknown>)[k]
      if (typeof v === 'number' && Number.isFinite(v)) out[k] = v
    }
  }
  return out as T
}

/** useState that persists to localStorage (fails safely if storage is unavailable). */
export function usePersisted<T>(key: string, initial: T, sanitize: (raw: unknown) => T = (r) => (r as T) ?? initial) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? sanitize(JSON.parse(raw)) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      /* storage unavailable: ignore */
    }
  }, [key, value])
  return [value, setValue] as const
}
