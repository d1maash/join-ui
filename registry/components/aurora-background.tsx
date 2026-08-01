"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const AURORA_CSS = `
@keyframes joinway-aurora-a {
  0%   { transform: translate3d(-14%, -10%, 0) scale(1); }
  50%  { transform: translate3d(10%, 8%, 0) scale(1.22); }
  100% { transform: translate3d(-6%, 12%, 0) scale(1.06); }
}
@keyframes joinway-aurora-b {
  0%   { transform: translate3d(16%, 6%, 0) scale(1.1); }
  50%  { transform: translate3d(-12%, -8%, 0) scale(0.94); }
  100% { transform: translate3d(8%, -12%, 0) scale(1.16); }
}
@keyframes joinway-aurora-c {
  0%   { transform: translate3d(-4%, 14%, 0) scale(0.98); }
  50%  { transform: translate3d(14%, -6%, 0) scale(1.18); }
  100% { transform: translate3d(-10%, -4%, 0) scale(1.02); }
}
@media (prefers-reduced-motion: reduce) {
  [data-joinway-aurora-layer] { animation: none !important; }
}
`

export interface AuroraBackgroundProps extends React.ComponentPropsWithoutRef<"div"> {
  intensity?: "subtle" | "medium" | "vivid"
  /** Seconds for one full drift cycle. Higher is calmer. */
  speed?: number
  /** Blur radius of each light field, in pixels. */
  blur?: number
  /** Overlay a fine grain texture to kill gradient banding. */
  grain?: boolean
  /** Render the aurora only, without the positioned content wrapper. */
  asLayer?: boolean
}

const INTENSITY: Record<NonNullable<AuroraBackgroundProps["intensity"]>, number> = {
  subtle: 0.28,
  medium: 0.48,
  vivid: 0.72,
}

/**
 * A GPU-friendly animated backdrop built from three blurred colour fields.
 *
 * Only `transform` is animated, so the effect stays off the main thread. An
 * `IntersectionObserver` pauses the animation whenever the element leaves the
 * viewport, and `prefers-reduced-motion` freezes it into a static gradient.
 *
 * The element is `aria-hidden` and never receives pointer events.
 */
export function AuroraBackground({
  intensity = "medium",
  speed = 18,
  blur = 72,
  grain = true,
  asLayer = false,
  className,
  children,
  ...props
}: AuroraBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = React.useState(true)

  React.useEffect(() => {
    const node = containerRef.current
    if (!node || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      (entries) => setPlaying(entries[0]?.isIntersecting ?? true),
      { rootMargin: "80px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const opacity = INTENSITY[intensity]
  const playState = playing ? "running" : "paused"

  const layer = (name: string, color: string, extra: React.CSSProperties) => (
    <span
      data-joinway-aurora-layer=""
      style={{
        position: "absolute",
        borderRadius: "9999px",
        filter: `blur(${blur}px)`,
        background: color,
        opacity,
        willChange: "transform",
        animation: `${name} ${speed}s var(--ease-in-out-soft, cubic-bezier(0.65,0,0.35,1)) infinite alternate`,
        animationPlayState: playState,
        ...extra,
      }}
    />
  )

  const aurora = (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        asLayer && className
      )}
    >
      <style href="joinway-aurora" precedence="default">
        {AURORA_CSS}
      </style>
      {layer(
        "joinway-aurora-a",
        "radial-gradient(circle, var(--brand-from) 0%, transparent 70%)",
        {
          insetInlineStart: "-10%",
          insetBlockStart: "-25%",
          width: "70%",
          aspectRatio: "1",
        }
      )}
      {layer(
        "joinway-aurora-b",
        "radial-gradient(circle, var(--brand-via) 0%, transparent 70%)",
        {
          insetInlineEnd: "-15%",
          insetBlockStart: "-10%",
          width: "62%",
          aspectRatio: "1",
        }
      )}
      {layer(
        "joinway-aurora-c",
        "radial-gradient(circle, var(--brand-to) 0%, transparent 70%)",
        {
          insetInlineStart: "22%",
          insetBlockEnd: "-30%",
          width: "58%",
          aspectRatio: "1",
        }
      )}
      {grain ? (
        <span
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.22,
            mixBlendMode: "overlay",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
          }}
        />
      ) : null}
    </div>
  )

  if (asLayer) return aurora

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-background text-foreground",
        className
      )}
      {...props}
    >
      {aurora}
      <div className="relative">{children}</div>
    </div>
  )
}
