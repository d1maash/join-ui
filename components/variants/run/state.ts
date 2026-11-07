"use client"

import * as React from "react"

/*
 * The run's state, readable from anywhere on the page.
 *
 * The story owns it; the top bar's status light and the stage's spill read it.
 * A tiny external store rather than context, because the reader that matters
 * most — the wordmark — lives in the layout, above the page that writes it.
 */
export type RunTone = "idle" | "running" | "waiting" | "shipped" | "denied" | "failed"

export const TONE_COLOR: Record<RunTone, string> = {
  idle: "rgb(255 255 255 / 0)",
  running: "#409cff",
  waiting: "#ffb340",
  shipped: "#30d158",
  denied: "#ff6961",
  failed: "#ff6961",
}

export const TONE_LABEL: Record<RunTone, string> = {
  idle: "Idle",
  running: "Running",
  waiting: "Waiting on you",
  shipped: "Shipped",
  denied: "Denied",
  failed: "Failed",
}

let tone: RunTone = "idle"
const listeners = new Set<() => void>()

export function setRunTone(next: RunTone) {
  if (next === tone) return
  tone = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useRunTone(): RunTone {
  return React.useSyncExternalStore(
    subscribe,
    () => tone,
    () => "idle"
  )
}

/** A media query, read without a hydration mismatch: the server answers `server`. */
export function useMedia(query: string, server: boolean): boolean {
  const subscribeQuery = React.useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener("change", onChange)
      return () => list.removeEventListener("change", onChange)
    },
    [query]
  )
  return React.useSyncExternalStore(
    subscribeQuery,
    () => window.matchMedia(query).matches,
    () => server
  )
}

export function useReducedMotionSafe(): boolean {
  return useMedia("(prefers-reduced-motion: reduce)", false)
}
