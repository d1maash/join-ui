"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

type MagneticButtonVariant = "primary" | "secondary" | "outline" | "ghost"
type MagneticButtonSize = "sm" | "md" | "lg"

const VARIANTS: Record<MagneticButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:brightness-110",
  secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
  outline: "border border-border-strong bg-transparent text-foreground hover:bg-muted",
  ghost: "bg-transparent text-foreground hover:bg-muted",
}

const SIZES: Record<MagneticButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-[0.8125rem]",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2.5 px-6 text-[0.9375rem]",
}

export interface MagneticButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  /** Render the child element instead of a `button` (e.g. a Next.js `Link`). */
  asChild?: boolean
  variant?: MagneticButtonVariant
  size?: MagneticButtonSize
  /**
   * How far the button travels toward the pointer, as a fraction of the pointer
   * offset. `0` disables the effect, `1` pins the button to the cursor.
   */
  strength?: number
  /** Pointer distance in pixels at which the pull starts. */
  radius?: number
  /** Extra parallax applied to the label, relative to `strength`. */
  labelStrength?: number
  /** Class applied to the inline-flex wrapper that carries the transform. */
  wrapperClassName?: string
}

/**
 * A button that eases toward the pointer as it approaches and springs back on
 * exit. The transform lives on a wrapper element so `asChild` keeps working and
 * the interactive element itself is never re-parented.
 *
 * The pointer listener is only attached while the button is near the viewport,
 * is throttled to one frame, and is skipped entirely under
 * `prefers-reduced-motion: reduce`.
 */
export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  function MagneticButton(
    {
      asChild = false,
      variant = "primary",
      size = "md",
      strength = 0.32,
      radius = 120,
      labelStrength = 0.45,
      className,
      wrapperClassName,
      children,
      disabled,
      ...props
    },
    forwardedRef
  ) {
    const wrapperRef = React.useRef<HTMLSpanElement>(null)
    const reduceMotion = useReducedMotion()

    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const spring = { stiffness: 240, damping: 20, mass: 0.35 }
    const springX = useSpring(x, spring)
    const springY = useSpring(y, spring)
    const labelX = useTransform(springX, (value) => value * labelStrength)
    const labelY = useTransform(springY, (value) => value * labelStrength)

    const active = !reduceMotion && !disabled && strength > 0

    React.useEffect(() => {
      const node = wrapperRef.current
      if (!node || !active) {
        x.set(0)
        y.set(0)
        return
      }

      let nearViewport = false
      let frame = 0

      const reset = () => {
        x.set(0)
        y.set(0)
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          nearViewport = entry?.isIntersecting ?? false
          if (!nearViewport) reset()
        },
        { rootMargin: "160px" }
      )
      observer.observe(node)

      const handlePointerMove = (event: PointerEvent) => {
        if (!nearViewport || frame !== 0) return
        frame = window.requestAnimationFrame(() => {
          frame = 0
          const rect = node.getBoundingClientRect()
          // Subtract the live offset so the rest position stays the reference.
          const centerX = rect.left + rect.width / 2 - x.get()
          const centerY = rect.top + rect.height / 2 - y.get()
          const deltaX = event.clientX - centerX
          const deltaY = event.clientY - centerY
          const distance = Math.hypot(deltaX, deltaY)

          if (distance > radius) {
            reset()
            return
          }

          const falloff = 1 - distance / radius
          x.set(deltaX * strength * falloff)
          y.set(deltaY * strength * falloff)
        })
      }

      window.addEventListener("pointermove", handlePointerMove, { passive: true })
      window.addEventListener("blur", reset)
      document.addEventListener("pointerleave", reset)

      return () => {
        observer.disconnect()
        window.removeEventListener("pointermove", handlePointerMove)
        window.removeEventListener("blur", reset)
        document.removeEventListener("pointerleave", reset)
        if (frame !== 0) window.cancelAnimationFrame(frame)
      }
    }, [active, radius, strength, x, y])

    const Comp = asChild ? Slot : "button"

    return (
      <motion.span
        ref={wrapperRef}
        style={active ? { x: springX, y: springY } : undefined}
        className={cn("inline-flex", wrapperClassName)}
      >
        <Comp
          ref={forwardedRef}
          disabled={asChild ? undefined : disabled}
          data-disabled={disabled ? "" : undefined}
          className={cn(
            "relative inline-flex cursor-pointer items-center justify-center rounded-lg font-medium select-none",
            "transition-[background-color,color,filter] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "disabled:pointer-events-none disabled:opacity-50",
            "data-disabled:pointer-events-none data-disabled:opacity-50",
            "[&_svg]:size-4 [&_svg]:shrink-0",
            VARIANTS[variant],
            SIZES[size],
            className
          )}
          {...props}
        >
          <motion.span
            style={active ? { x: labelX, y: labelY } : undefined}
            className="pointer-events-none inline-flex items-center justify-center gap-[inherit]"
          >
            {children}
          </motion.span>
        </Comp>
      </motion.span>
    )
  }
)
