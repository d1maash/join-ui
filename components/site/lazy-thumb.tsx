"use client"

import * as React from "react"

import { renderThumbnail } from "@/components/previews/thumbnails/registry"
import { cn } from "@/lib/utils"

/*
 * A live miniature that only exists while it is near the screen.
 *
 * Two shared IntersectionObservers drive every thumbnail on the page — one
 * with a short margin that mounts, one with a long margin that unmounts — so
 * a card scrolled a screen away keeps running (no flicker on a small scroll
 * back) but a catalog of three hundred cards only ever has a screenful or two
 * of components alive. One observer pair for the page, not one per card.
 */

type Listener = (zone: "near" | "far", inside: boolean) => void

const listeners = new Map<Element, Listener>()
let nearObserver: IntersectionObserver | null = null
let farObserver: IntersectionObserver | null = null

function observers() {
  if (!nearObserver) {
    nearObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          listeners.get(entry.target)?.("near", entry.isIntersecting)
      },
      { rootMargin: "320px 240px" }
    )
    farObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          listeners.get(entry.target)?.("far", entry.isIntersecting)
      },
      { rootMargin: "1400px 1200px" }
    )
  }
  return [nearObserver, farObserver!] as const
}

export function useNearViewport(ref: React.RefObject<Element | null>, eager = false) {
  const [mounted, setMounted] = React.useState(eager)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const [near, far] = observers()
    listeners.set(node, (zone, inside) => {
      if (zone === "near" && inside) setMounted(true)
      if (zone === "far" && !inside) setMounted(false)
    })
    near.observe(node)
    far.observe(node)
    return () => {
      near.unobserve(node)
      far.unobserve(node)
      listeners.delete(node)
    }
  }, [ref])

  return mounted
}

export function LazyThumb({
  slug,
  eager = false,
  className,
}: {
  slug: string
  /** Mount on first render (above-the-fold hero frames). */
  eager?: boolean
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const mounted = useNearViewport(ref, eager)
  const thumb = mounted ? renderThumbnail(slug) : null

  return (
    <div
      ref={ref}
      inert
      aria-hidden="true"
      className={cn("absolute inset-0 select-none", className)}
    >
      {thumb ?? <span className="g-thumb-wait" />}
    </div>
  )
}
