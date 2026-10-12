"use client"

import * as React from "react"
import { useInView } from "motion/react"

import { ThumbnailProvider } from "@/components/previews/thumbnails/clock"
import { renderThumbnail } from "@/components/previews/thumbnails/registry"
import { cn } from "@/lib/utils"

const STILL = "(prefers-reduced-motion: reduce)"

/*
 * Read through a store with a server snapshot of "no", so the first client
 * render agrees with the server's and the thumbnail parks on its poster frame
 * only after hydration.
 */
function subscribeStill(onChange: () => void) {
  const query = window.matchMedia(STILL)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

const readStill = () => window.matchMedia(STILL).matches
const stillOnServer = () => false

/**
 * The stage on a catalog card.
 *
 * The component inside is the real one, running a short script, but it is
 * scenery here: the stage is `inert`, so nothing in it can be focused, clicked
 * or read out, and a click anywhere on it falls through to the card's link.
 * That also keeps a component that pauses for the pointer — the gate's clock,
 * the stack's timer — from stopping just because a cursor is passing over the
 * card on its way to it.
 *
 * Its script runs only while the card is on screen, and not at all under
 * reduced motion, where each thumbnail holds a single frame instead.
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
  const inView = useInView(ref, { amount: 0.3 })
  const still = React.useSyncExternalStore(subscribeStill, readStill, stillOnServer)
  const demo = renderThumbnail(slug)

  if (!demo) return <div className={className}>{fallback}</div>

  return (
    <div ref={ref} inert className={cn("select-none", className)}>
      <ThumbnailProvider value={{ live: inView && !still, still }}>{demo}</ThumbnailProvider>
    </div>
  )
}
