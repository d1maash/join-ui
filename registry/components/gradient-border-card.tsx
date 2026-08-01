"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const BORDER_CSS = `
@keyframes joinway-border-spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  [data-joinway-border-ring] { animation: none !important; }
}
`

export interface GradientBorderCardProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Border thickness in pixels. */
  borderWidth?: number
  /** Seconds per rotation. */
  duration?: number
  /** Freeze the gradient in place. */
  animate?: boolean
  /** Ambient bloom behind the card. */
  glow?: boolean
  /**
   * Colour stops for the conic sweep. Defaults to the brand ramp; any CSS
   * colour works, including `var(--…)` tokens.
   */
  colors?: string[]
  /** Class applied to the inner content surface. */
  innerClassName?: string
}

/**
 * A card wrapped in a conic gradient that rotates around its edge.
 *
 * The sweep is a rotating pseudo-layer clipped by the parent rather than an
 * animated `@property` angle, so it needs no custom property registration and
 * works in every browser that supports `conic-gradient`. Only `transform` is
 * animated, and the rotation pauses off-screen.
 */
export function GradientBorderCard({
  borderWidth = 1,
  duration = 6,
  animate = true,
  glow = true,
  colors,
  className,
  innerClassName,
  children,
  ...props
}: GradientBorderCardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    const node = containerRef.current
    if (!node || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries[0]?.isIntersecting ?? true),
      { rootMargin: "80px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const stops = colors ?? [
    "var(--brand-from)",
    "var(--brand-via)",
    "var(--brand-to)",
    "transparent",
    "transparent",
    "var(--brand-from)",
  ]
  const gradient = `conic-gradient(from 0deg, ${stops.join(", ")})`

  return (
    <div
      ref={containerRef}
      className={cn("relative isolate rounded-xl", className)}
      style={{ padding: borderWidth }}
      {...props}
    >
      <style href="joinway-gradient-border" precedence="default">
        {BORDER_CSS}
      </style>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        <span
          data-joinway-border-ring=""
          style={{
            position: "absolute",
            insetInlineStart: "50%",
            insetBlockStart: "50%",
            width: "180%",
            aspectRatio: "1",
            transform: "translate(-50%, -50%)",
            backgroundImage: gradient,
            animation: `joinway-border-spin ${duration}s linear infinite`,
            animationPlayState: animate && visible ? "running" : "paused",
            willChange: "transform",
          }}
        />
      </span>

      {glow ? (
        <span
          aria-hidden="true"
          style={{ backgroundImage: gradient }}
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-25 blur-xl"
        />
      ) : null}

      <div
        className={cn(
          "relative h-full rounded-[calc(var(--radius-xl)-1px)] bg-card text-card-foreground",
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}
