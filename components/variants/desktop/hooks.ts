"use client"

import * as React from "react"

function mediaStore(query: string) {
  return {
    subscribe(callback: () => void) {
      const list = window.matchMedia(query)
      list.addEventListener("change", callback)
      return () => list.removeEventListener("change", callback)
    },
    read() {
      return window.matchMedia(query).matches
    },
  }
}

const desktopQuery = mediaStore("(min-width: 768px)")
const stillQuery = mediaStore("(prefers-reduced-motion: reduce)")

/**
 * Which OS the page is being: the Mac at 768px and up, the phone below.
 * `null` on the server and during hydration, so nothing whose markup depends
 * on it is rendered until the client knows — the static shells for both are
 * in the HTML, and CSS shows the right one before a byte of script runs.
 */
export function useOsMode(): "desktop" | "mobile" | null {
  const desktop = React.useSyncExternalStore(
    desktopQuery.subscribe,
    () => (desktopQuery.read() ? 1 : 0),
    () => -1
  )
  return desktop === -1 ? null : desktop === 1 ? "desktop" : "mobile"
}

/** `prefers-reduced-motion`, read without a hydration mismatch (false on the server). */
export function useStill(): boolean {
  return React.useSyncExternalStore(stillQuery.subscribe, stillQuery.read, () => false)
}

/** A tick on the minute, for the clocks. Empty on the server. */
function subscribeMinute(callback: () => void) {
  let timer = 0
  const arm = () => {
    const now = new Date()
    const wait = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 20
    timer = window.setTimeout(() => {
      callback()
      arm()
    }, wait)
  }
  arm()
  return () => window.clearTimeout(timer)
}

function minuteStamp() {
  return Math.floor(Date.now() / 60000)
}

export function useNow(): Date | null {
  const stamp = React.useSyncExternalStore(subscribeMinute, minuteStamp, () => -1)
  return React.useMemo(() => (stamp === -1 ? null : new Date(stamp * 60000)), [stamp])
}

const FLAG_EVENT = "joinui-desktop-flag"
const sessionFlags = new Set<string>()

/**
 * A per-viewer flag in localStorage, read as an external store: a
 * convenience that survives blocked storage by simply being unset. `true` on
 * the server, so nothing a flag would hide is ever rendered there.
 */
export function useStoredFlag(key: string): [boolean, () => void] {
  const flag = React.useSyncExternalStore(
    (callback) => {
      window.addEventListener(FLAG_EVENT, callback)
      window.addEventListener("storage", callback)
      return () => {
        window.removeEventListener(FLAG_EVENT, callback)
        window.removeEventListener("storage", callback)
      }
    },
    () => {
      try {
        return window.localStorage.getItem(key) === "1"
      } catch {
        return false
      }
    },
    () => true
  )
  const set = React.useCallback(() => {
    try {
      window.localStorage.setItem(key, "1")
    } catch {
      /* storage blocked — the flag lasts as long as this page does */
      sessionFlags.add(key)
    }
    window.dispatchEvent(new Event(FLAG_EVENT))
  }, [key])
  return [flag || sessionFlags.has(key), set]
}

