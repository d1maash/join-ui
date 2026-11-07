"use client"

import * as React from "react"

/*
 * Reduced motion, read through `useSyncExternalStore` rather than Motion's
 * hook. The server has no media query to ask, so it answers "moving"; React
 * then hydrates against that answer and re-renders once if the reader asked
 * for stillness, instead of reporting a mismatch.
 */
const STILL = "(prefers-reduced-motion: reduce)"

function subscribeStill(onChange: () => void) {
  const query = window.matchMedia(STILL)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

export function useStill(): boolean {
  return React.useSyncExternalStore(
    subscribeStill,
    () => window.matchMedia(STILL).matches,
    () => false
  )
}

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true })
  return () => window.removeEventListener("scroll", onChange)
}

/** Whether the page has scrolled past `threshold` pixels. */
export function useScrolledPast(threshold: number): boolean {
  const read = React.useCallback(() => window.scrollY > threshold, [threshold])
  return React.useSyncExternalStore(subscribeScroll, read, () => false)
}

/**
 * Scroll spy: the id of the last heading whose top has crossed the band a
 * little below the floating chrome.
 */
export function useActiveSection(ids: string[], offset = 160): string | null {
  const [active, setActive] = React.useState<string | null>(null)
  const key = ids.join("|")

  React.useEffect(() => {
    const list = key.split("|").filter(Boolean)
    if (list.length === 0) return

    let frame = 0
    function measure() {
      frame = 0
      let current: string | null = null
      for (const id of list) {
        const element = document.getElementById(id)
        if (!element) continue
        if (element.getBoundingClientRect().top - offset <= 0) current = id
      }
      setActive(current)
    }
    function onScroll() {
      if (frame === 0) frame = window.requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [key, offset])

  return active
}

const noop = () => () => {}

/**
 * False on the server and through hydration, true from the first client
 * render after it. For live components whose markup depends on a media query
 * read during render — the registry pieces ask for reduced motion that way, so
 * rendering them on the server would hand a reader who asked for stillness a
 * tree that cannot hydrate.
 */
export function useHydrated(): boolean {
  return React.useSyncExternalStore(noop, () => true, () => false)
}
