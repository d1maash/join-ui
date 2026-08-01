"use client"

import * as React from "react"

/**
 * Cross-component store for a single `localStorage` key.
 *
 * `useSyncExternalStore` is the right primitive here: it reads the value during
 * render instead of assigning it from an effect, so there is no cascading
 * re-render on mount, and hydration stays clean because `getServerSnapshot`
 * returns the same fallback the server rendered.
 *
 * The extra in-memory listener set is what makes two switchers on the same page
 * agree — the native `storage` event only fires in *other* tabs.
 */
const listeners = new Set<() => void>()

function emitLocalChange(): void {
  for (const listener of listeners) listener()
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange)
  window.addEventListener("storage", onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onChange)
  }
}

export function useStoredPreference<T extends string>(
  key: string,
  fallback: T,
  isValid: (value: string) => value is T
): readonly [T, (next: T) => void] {
  const getSnapshot = React.useCallback((): T => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null && isValid(stored) ? stored : fallback
    } catch {
      // Storage can throw in private mode or when it is disabled entirely.
      return fallback
    }
  }, [key, fallback, isValid])

  const getServerSnapshot = React.useCallback(() => fallback, [fallback])

  const value = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setValue = React.useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, next)
      } catch {
        // A preference that cannot be persisted still applies for this session.
      }
      emitLocalChange()
    },
    [key]
  )

  return [value, setValue] as const
}

const noopSubscribe = () => () => {}
const getTrue = () => true
const getFalse = () => false

/**
 * `false` during SSR and the hydration render, `true` afterwards.
 *
 * Use it to defer rendering that depends on client-only state — it avoids a
 * hydration mismatch without the `useState` + `useEffect` dance, which React's
 * `set-state-in-effect` rule now (correctly) rejects.
 */
export function useIsHydrated(): boolean {
  return React.useSyncExternalStore(noopSubscribe, getTrue, getFalse)
}
