"use client"

import * as React from "react"

import { renderThumb } from "@/components/previews/thumbs/registry"
import { cn } from "@/lib/utils"

/*
 * Live miniatures, mounted only near the viewport.
 * ---------------------------------------------------------------------------
 * Two shared IntersectionObservers serve every tile on the page, however many
 * there are: one with a short margin mounts a thumbnail as it approaches the
 * viewport, one with a long margin unmounts it once it is well out of sight.
 * The gap between the two margins is hysteresis — a tile scrolled a little
 * way past does not tear down and rebuild. A page of three hundred cards
 * therefore runs a dozen or so live components at a time, and each of those
 * pauses its own loop while it is off screen.
 */
type Listener = (near: boolean) => void

const MOUNT_MARGIN = "320px 0px"
const UNMOUNT_MARGIN = "1400px 0px"

const listeners = new Map<Element, Listener>()
let mountObserver: IntersectionObserver | null = null
let unmountObserver: IntersectionObserver | null = null

function observers() {
  if (!mountObserver || !unmountObserver) {
    mountObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) listeners.get(entry.target)?.(true)
      },
      { rootMargin: MOUNT_MARGIN }
    )
    unmountObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (!entry.isIntersecting) listeners.get(entry.target)?.(false)
      },
      { rootMargin: UNMOUNT_MARGIN }
    )
  }
  return [mountObserver, unmountObserver] as const
}

function watch(element: Element, listener: Listener) {
  const [mount, unmount] = observers()
  listeners.set(element, listener)
  mount.observe(element)
  unmount.observe(element)
  return () => {
    listeners.delete(element)
    mount.unobserve(element)
    unmount.unobserve(element)
  }
}

/**
 * Fills its parent. The parent owns the size — give it a fixed aspect or a
 * fixed height so the layout never moves when the component arrives.
 */
export function LazyThumb({ slug, className }: { slug: string; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [near, setNear] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return
    return watch(element, setNear)
  }, [])

  return (
    <div ref={ref} inert aria-hidden="true" className={cn("relative size-full select-none", className)}>
      {near ? (
        <div className="st-settle size-full">{renderThumb(slug)}</div>
      ) : (
        <ThumbPlaceholder />
      )}
    </div>
  )
}

/** A neutral silhouette of "a component goes here", so an empty tile still reads. */
function ThumbPlaceholder() {
  return (
    <div className="flex size-full items-center justify-center">
      <div className="flex w-[46%] max-w-56 flex-col gap-2 rounded-lg border border-border bg-background p-3 opacity-70">
        <div className="h-2 w-1/2 rounded-full bg-muted" />
        <div className="h-2 w-5/6 rounded-full bg-muted" />
        <div className="h-2 w-2/3 rounded-full bg-muted" />
      </div>
    </div>
  )
}
