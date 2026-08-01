"use client"

import * as React from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"

import { cn } from "@/lib/utils"

export interface FloatingDockItem {
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  active?: boolean
}

export interface FloatingDockProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "onChange"> {
  items: FloatingDockItem[]
  /** Base icon size in pixels. */
  baseSize?: number
  /** Icon size at the pointer, in pixels. */
  magnifiedSize?: number
  /** How far the magnification reaches, in pixels. */
  falloff?: number
  /** Accessible name for the navigation landmark. */
  label?: string
}

/**
 * A dock whose icons swell as the pointer sweeps across them and settle back
 * with a spring.
 *
 * Magnification is decorative: it is derived from a single shared motion value
 * (one listener for the whole dock, not one per item), disabled under
 * `prefers-reduced-motion`, and dropped entirely on coarse-pointer viewports
 * where the dock renders as a plain, comfortably sized row. Labels appear on
 * both hover and keyboard focus.
 */
export function FloatingDock({
  items,
  baseSize = 40,
  magnifiedSize = 68,
  falloff = 140,
  label = "Quick navigation",
  className,
  ...props
}: FloatingDockProps) {
  const pointerX = useMotionValue(Number.POSITIVE_INFINITY)
  const reduceMotion = useReducedMotion()
  const [finePointer, setFinePointer] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(pointer: fine)")
    const update = () => setFinePointer(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  const magnify = finePointer && !reduceMotion

  return (
    <nav
      aria-label={label}
      onPointerMove={(event) => {
        if (magnify) pointerX.set(event.clientX)
      }}
      onPointerLeave={() => pointerX.set(Number.POSITIVE_INFINITY)}
      className={cn(
        "mx-auto flex w-max items-end gap-1.5 rounded-2xl border border-border bg-card/85 p-2 shadow-[var(--shadow-floating)] backdrop-blur-md",
        className
      )}
      {...props}
    >
      <ul className="flex items-end gap-1.5">
        {items.map((item) => (
          <DockIcon
            key={item.label}
            item={item}
            pointerX={pointerX}
            baseSize={baseSize}
            magnifiedSize={magnify ? magnifiedSize : baseSize}
            falloff={falloff}
            magnify={magnify}
          />
        ))}
      </ul>
    </nav>
  )
}

interface DockIconProps {
  item: FloatingDockItem
  pointerX: MotionValue<number>
  baseSize: number
  magnifiedSize: number
  falloff: number
  magnify: boolean
}

function DockIcon({
  item,
  pointerX,
  baseSize,
  magnifiedSize,
  falloff,
  magnify,
}: DockIconProps) {
  const ref = React.useRef<HTMLLIElement>(null)

  const distance = useTransform(pointerX, (value) => {
    const bounds = ref.current?.getBoundingClientRect()
    if (!bounds) return Number.POSITIVE_INFINITY
    return value - bounds.left - bounds.width / 2
  })

  const targetSize = useTransform(
    distance,
    [-falloff, 0, falloff],
    [baseSize, magnifiedSize, baseSize],
    { clamp: true }
  )
  const size = useSpring(targetSize, {
    stiffness: 320,
    damping: 26,
    mass: 0.4,
  })

  const triggerClassName = cn(
    "flex size-full cursor-pointer items-center justify-center rounded-xl border border-transparent bg-muted text-muted-foreground",
    "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
    "hover:border-border hover:bg-card hover:text-foreground",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    item.active && "border-border bg-card text-primary"
  )
  const triggerStyle = magnify ? undefined : { width: baseSize, height: baseSize }
  const glyph = (
    <span aria-hidden="true" className="[&_svg]:size-[45%]">
      {item.icon}
    </span>
  )

  return (
    <li ref={ref} className="group relative flex flex-col items-center">
      {/*
        Purely visual: the accessible name already lives on the trigger's
        `aria-label`, so exposing this twice would be noise for screen readers.
      */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-9 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-[var(--shadow-raised)]",
          "opacity-0 transition-opacity duration-[var(--duration-fast)]",
          "group-hover:opacity-100 group-focus-within:opacity-100"
        )}
      >
        {item.label}
      </span>

      <motion.div
        style={magnify ? { width: size, height: size } : undefined}
        className={magnify ? undefined : "size-10"}
      >
        {item.href ? (
          <a
            href={item.href}
            aria-label={item.label}
            aria-current={item.active ? "page" : undefined}
            className={triggerClassName}
            style={triggerStyle}
          >
            {glyph}
          </a>
        ) : (
          <button
            type="button"
            onClick={item.onClick}
            aria-label={item.label}
            aria-current={item.active ? "page" : undefined}
            className={triggerClassName}
            style={triggerStyle}
          >
            {glyph}
          </button>
        )}
      </motion.div>
    </li>
  )
}
