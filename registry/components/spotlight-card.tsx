"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SpotlightCardProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Diameter of the light pool, in pixels. */
  spotlightSize?: number
  /** Any CSS color. Defaults to a translucent tint of the primary token. */
  spotlightColor?: string
  /** Also trace the 1px border with the same light. */
  borderGlow?: boolean
  /** Opt out of the effect without changing the markup. */
  disabled?: boolean
}

/**
 * A surface that lights up under the pointer. Coordinates are written to CSS
 * custom properties inside a single `requestAnimationFrame`, so no React state
 * updates happen while the pointer moves.
 *
 * Keyboard users get the same affordance: focusing anything inside the card
 * reveals a centred spotlight, so the effect is never hover-only.
 */
export const SpotlightCard = React.forwardRef<HTMLDivElement, SpotlightCardProps>(
  function SpotlightCard(
    {
      spotlightSize = 340,
      spotlightColor = "color-mix(in oklab, var(--primary) 26%, transparent)",
      borderGlow = true,
      disabled = false,
      className,
      children,
      onPointerMove,
      onPointerLeave,
      onFocus,
      onBlur,
      ...props
    },
    forwardedRef
  ) {
    const innerRef = React.useRef<HTMLDivElement>(null)
    const frameRef = React.useRef(0)

    React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLDivElement)

    React.useEffect(() => {
      return () => {
        if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
      }
    }, [])

    const write = React.useCallback((x: string, y: string, opacity: string) => {
      const node = innerRef.current
      if (!node) return
      node.style.setProperty("--spotlight-x", x)
      node.style.setProperty("--spotlight-y", y)
      node.style.setProperty("--spotlight-opacity", opacity)
    }, [])

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event)
      if (disabled || frameRef.current !== 0) return
      const { clientX, clientY } = event
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0
        const node = innerRef.current
        if (!node) return
        const rect = node.getBoundingClientRect()
        write(`${clientX - rect.left}px`, `${clientY - rect.top}px`, "1")
      })
    }

    const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event)
      if (disabled) return
      write("50%", "50%", "0")
    }

    const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
      onFocus?.(event)
      if (disabled) return
      write("50%", "0%", "1")
    }

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
      onBlur?.(event)
      if (disabled) return
      write("50%", "50%", "0")
    }

    const layerStyle: React.CSSProperties = {
      background: `radial-gradient(${spotlightSize}px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), ${spotlightColor}, transparent 70%)`,
      opacity: "var(--spotlight-opacity, 0)",
    }

    return (
      <div
        ref={innerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "group relative isolate overflow-hidden rounded-xl border border-border bg-card text-card-foreground",
          "shadow-[var(--shadow-subtle)] transition-shadow duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
          "focus-within:shadow-[var(--shadow-raised)] hover:shadow-[var(--shadow-raised)]",
          className
        )}
        {...props}
      >
        {!disabled ? (
          <span
            aria-hidden="true"
            style={layerStyle}
            className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-[var(--duration-base)] ease-[var(--ease-out-soft)]"
          />
        ) : null}

        {!disabled && borderGlow ? (
          <span
            aria-hidden="true"
            style={{
              ...layerStyle,
              padding: 1,
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              maskComposite: "exclude",
            }}
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-[var(--duration-base)] ease-[var(--ease-out-soft)]"
          />
        ) : null}

        {children}
      </div>
    )
  }
)

/** Optional layout helpers so cards line up without extra utility soup. */
export function SpotlightCardHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex flex-col gap-1.5 p-6 pb-3", className)} {...props} />
}

export function SpotlightCardTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className={cn("text-base font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

export function SpotlightCardDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

export function SpotlightCardContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}
