"use client"

import * as React from "react"
import { motion, useReducedMotion, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

export interface CursorHighlightProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /**
   * `snap` locks the highlight onto the nearest `[data-highlight]` descendant.
   * `follow` trails a soft circle under the pointer.
   */
  mode?: "snap" | "follow"
  /** Extra pixels around a snapped target. */
  padding?: number
  /** Corner radius of the highlight, in pixels. */
  radius?: number
  /** Diameter of the follow-mode circle, in pixels. */
  size?: number
  /** Class applied to the highlight itself — restyle it freely. */
  highlightClassName?: string
}

const HIDDEN = { x: 0, y: 0, width: 0, height: 0, opacity: 0 }

/**
 * Paints a soft highlight behind whatever the user is pointing at — or tabbing
 * to.
 *
 * The highlight is driven by springs on a handful of motion values, so moving
 * between targets morphs rather than jumps, and no React state changes during
 * pointer movement. Because it tracks `focusin` as well as `pointermove`, the
 * affordance is never hover-only; under reduced motion it snaps without easing.
 * The layer is `aria-hidden` and non-interactive.
 */
export function CursorHighlight({
  mode = "snap",
  padding = 8,
  radius = 12,
  size = 220,
  className,
  highlightClassName,
  children,
  ...props
}: CursorHighlightProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const config = reduceMotion
    ? { stiffness: 1000, damping: 100, mass: 0.1 }
    : { stiffness: 320, damping: 34, mass: 0.6 }

  const x = useSpring(HIDDEN.x, config)
  const y = useSpring(HIDDEN.y, config)
  const width = useSpring(HIDDEN.width, config)
  const height = useSpring(HIDDEN.height, config)
  const opacity = useSpring(HIDDEN.opacity, { stiffness: 400, damping: 40 })

  const place = React.useCallback(
    (target: Element | null, pointer?: { clientX: number; clientY: number }) => {
      const container = containerRef.current
      if (!container) return
      const bounds = container.getBoundingClientRect()

      if (mode === "snap" && target) {
        const rect = target.getBoundingClientRect()
        x.set(rect.left - bounds.left - padding)
        y.set(rect.top - bounds.top - padding)
        width.set(rect.width + padding * 2)
        height.set(rect.height + padding * 2)
        opacity.set(1)
        return
      }

      if (mode === "follow" && pointer) {
        x.set(pointer.clientX - bounds.left - size / 2)
        y.set(pointer.clientY - bounds.top - size / 2)
        width.set(size)
        height.set(size)
        opacity.set(1)
        return
      }

      opacity.set(0)
    },
    [mode, padding, size, x, y, width, height, opacity]
  )

  const frameRef = React.useRef(0)
  React.useEffect(
    () => () => {
      if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
    },
    []
  )

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    props.onPointerMove?.(event)
    if (frameRef.current !== 0) return
    const { clientX, clientY } = event
    const target =
      event.target instanceof Element
        ? event.target.closest("[data-highlight]")
        : null
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0
      place(target, { clientX, clientY })
    })
  }

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    props.onPointerLeave?.(event)
    opacity.set(0)
  }

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    props.onFocus?.(event)
    if (mode !== "snap") return
    const target = event.target.closest("[data-highlight]")
    if (target) place(target)
  }

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    props.onBlur?.(event)
    if (!event.currentTarget.contains(event.relatedTarget)) opacity.set(0)
  }

  return (
    <div
      {...props}
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn("relative isolate", className)}
    >
      <motion.span
        aria-hidden="true"
        style={{
          x,
          y,
          width,
          height,
          opacity,
          borderRadius: mode === "follow" ? "9999px" : radius,
          filter: mode === "follow" ? `blur(${Math.round(size / 6)}px)` : undefined,
        }}
        className={cn(
          "pointer-events-none absolute left-0 top-0 -z-10",
          mode === "snap"
            ? "border border-primary/25 bg-primary-soft"
            : "bg-primary/25",
          highlightClassName
        )}
      />
      {children}
    </div>
  )
}
