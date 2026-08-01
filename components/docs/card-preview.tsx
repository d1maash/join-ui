"use client"

import * as React from "react"

import { getPreviewComponent } from "@/components/previews/registry"
import { cn } from "@/lib/utils"

export interface CardPreviewProps {
  slug: string
  className?: string
  /** Scale applied to the embedded demo. */
  scale?: number
}

/**
 * Miniature, non-interactive rendering of a component's real demo.
 *
 * The demo module is only imported once the card approaches the viewport, so a
 * catalog of a dozen components does not download a dozen demo bundles up
 * front. The wrapper is `inert` and `aria-hidden`, which keeps the embedded
 * controls out of the tab order and out of the accessibility tree — the card's
 * own link is the only thing users can reach.
 */
export function CardPreview({ slug, className, scale = 0.62 }: CardPreviewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = React.useState(false)

  React.useEffect(() => {
    const node = containerRef.current
    if (!node) return
    if (typeof IntersectionObserver === "undefined") {
      setShouldRender(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldRender(true)
          observer.disconnect()
        }
      },
      { rootMargin: "300px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const Preview = getPreviewComponent(slug)

  return (
    <div
      ref={containerRef}
      inert
      aria-hidden="true"
      className={cn(
        "backdrop-grid pointer-events-none relative flex h-40 items-center justify-center overflow-hidden border-b border-border bg-background",
        className
      )}
    >
      {shouldRender && Preview ? (
        <div
          style={{ transform: `scale(${scale})`, width: `${100 / scale}%` }}
          className="flex origin-center items-center justify-center px-6"
        >
          <Preview />
        </div>
      ) : (
        <div className="flex w-2/3 flex-col gap-2">
          <div className="h-3 w-1/2 rounded bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
        </div>
      )}

      {/* Softens the crop so scaled demos do not look cut off. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent"
      />
    </div>
  )
}
