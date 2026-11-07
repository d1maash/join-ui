"use client"

import * as React from "react"
import { MotionConfig, useInView } from "motion/react"

import { ThumbnailProvider } from "@/components/previews/thumbnails/clock"
import { renderThumbnail } from "@/components/previews/thumbnails/registry"
import { cn } from "@/lib/utils"

/**
 * A media query read through a store with a server snapshot of "no", so the
 * first client render agrees with the server's and the answer arrives after
 * hydration.
 */
function useMedia(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener("change", onChange)
      return () => list.removeEventListener("change", onChange)
    },
    [query]
  )
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  )
}

/**
 * The stage on a catalog card.
 *
 * The component inside is the real one, but it is scenery here: the stage is
 * `inert`, so nothing in it can be focused, clicked or read out, and a click
 * anywhere on it falls through to the card's link.
 *
 * At rest it is a still drawing. Point at the card, or tab to it, and the
 * component plays a short script on a loop; let go and it settles back. On a
 * screen with no hover it plays while the card is in view instead, since
 * there would otherwise be no way to see it move, and under reduced motion it
 * never plays at all.
 *
 * The first frame is drawn with motion's animations skipped, so a component
 * that assembles itself on mount is simply there when the page loads. The
 * stage wakes the first time it plays — remounting the component with its
 * animations back on — and stays awake, so what follows is the component
 * animating between states rather than being rebuilt on every hover.
 */
export function ComponentThumbnail({
  slug,
  fallback,
  className,
}: {
  slug: string
  /** Shown, and left readable, when no thumbnail is registered for the slug. */
  fallback: React.ReactNode
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const still = useMedia("(prefers-reduced-motion: reduce)")
  const canHover = useMedia("(hover: hover)")
  const inView = useInView(ref, { amount: 0.6 })

  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)

  /*
   * The stage cannot see the pointer — it is inert — so it listens on the card
   * it sits in. Focus counts as hover, which is what makes the thumbnail play
   * for someone reaching the card from the keyboard.
   */
  React.useEffect(() => {
    const card = ref.current?.closest("article")
    if (!card) return

    const enter = () => setHovered(true)
    const leave = () => setHovered(false)
    const focusIn = () => setFocused(true)
    const focusOut = (event: FocusEvent) => {
      if (!card.contains(event.relatedTarget as Node | null)) setFocused(false)
    }

    card.addEventListener("pointerenter", enter)
    card.addEventListener("pointerleave", leave)
    card.addEventListener("focusin", focusIn)
    card.addEventListener("focusout", focusOut)
    return () => {
      card.removeEventListener("pointerenter", enter)
      card.removeEventListener("pointerleave", leave)
      card.removeEventListener("focusin", focusIn)
      card.removeEventListener("focusout", focusOut)
    }
  }, [])

  const playing = !still && (canHover ? hovered || focused : inView)

  /* A new session each time it starts playing, counted from the render that sees it start. */
  const [session, setSession] = React.useState(0)
  const [wasPlaying, setWasPlaying] = React.useState(playing)
  if (playing !== wasPlaying) {
    setWasPlaying(playing)
    if (playing) setSession((count) => count + 1)
  }
  const awake = session > 0

  const demo = renderThumbnail(slug)
  if (!demo) return <div className={className}>{fallback}</div>

  return (
    <div ref={ref} inert className={cn("select-none", className)}>
      <MotionConfig key={awake ? "awake" : "asleep"} skipAnimations={!awake}>
        <ThumbnailProvider value={{ playing, session }}>{demo}</ThumbnailProvider>
      </MotionConfig>
    </div>
  )
}
