"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export interface MorphingTabItem {
  value: string
  label: React.ReactNode
  icon?: React.ReactNode
  /** Small trailing count or status pill. */
  badge?: React.ReactNode
  disabled?: boolean
  /** `id` of the panel this tab controls, wired to `aria-controls`. */
  panelId?: string
}

export interface MorphingTabsProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onChange" | "defaultValue"
> {
  items: MorphingTabItem[]
  /** Controlled selection. */
  value?: string
  /** Uncontrolled initial selection. Falls back to the first enabled tab. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  variant?: "pill" | "underline"
  size?: "sm" | "md"
  /** Stretch tabs to fill the container. */
  fullWidth?: boolean
  /** Accessible name for the tab list. */
  label?: string
  /** Unique id used for the shared layout animation. */
  layoutId?: string
}

const SIZES = {
  sm: { list: "gap-0.5 p-0.5", tab: "h-7 gap-1.5 px-2.5 text-[0.8125rem]" },
  md: { list: "gap-1 p-1", tab: "h-9 gap-2 px-3.5 text-sm" },
} as const

/**
 * An accessible tab list whose selection indicator morphs between tabs with a
 * shared-layout animation instead of fading in and out.
 *
 * Implements the WAI-ARIA tabs pattern with roving `tabindex`: arrow keys move
 * selection, `Home`/`End` jump to the ends, and disabled tabs are skipped.
 * Panels stay under the caller's control — pass `panelId` per item and render
 * your own `role="tabpanel"`.
 */
export function MorphingTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = "pill",
  size = "md",
  fullWidth = false,
  label = "Tabs",
  layoutId,
  className,
  ...props
}: MorphingTabsProps) {
  const reactId = React.useId()
  const indicatorId = layoutId ?? `morphing-tabs-${reactId}`
  const reduceMotion = useReducedMotion()

  const firstEnabled = items.find((item) => !item.disabled)?.value ?? ""
  const [internal, setInternal] = React.useState(defaultValue ?? firstEnabled)
  const selected = value ?? internal

  const listRef = React.useRef<HTMLDivElement>(null)

  const select = (next: string) => {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  const focusTab = (index: number) => {
    const node = listRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]:not([disabled])'
    )
    node?.[index]?.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const enabled = items.filter((item) => !item.disabled)
    if (enabled.length === 0) return
    const current = enabled.findIndex((item) => item.value === selected)
    let next = -1

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (current + 1) % enabled.length
        break
      case "ArrowLeft":
      case "ArrowUp":
        next = (current - 1 + enabled.length) % enabled.length
        break
      case "Home":
        next = 0
        break
      case "End":
        next = enabled.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    const target = enabled[next]
    if (!target) return
    select(target.value)
    focusTab(next)
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex items-center",
        variant === "pill" &&
          "rounded-xl border border-border bg-muted/60 shadow-[var(--shadow-subtle)]",
        variant === "underline" && "gap-1 border-b border-border pb-0",
        variant === "pill" && SIZES[size].list,
        fullWidth && "flex w-full",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const isSelected = item.value === selected
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            id={`${indicatorId}-tab-${item.value}`}
            aria-selected={isSelected}
            aria-controls={item.panelId}
            tabIndex={isSelected ? 0 : -1}
            disabled={item.disabled}
            onClick={() => select(item.value)}
            className={cn(
              "relative inline-flex cursor-pointer items-center justify-center rounded-lg font-medium whitespace-nowrap",
              "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              "disabled:pointer-events-none disabled:opacity-40",
              SIZES[size].tab,
              variant === "underline" && "rounded-none rounded-t-md pb-2.5",
              isSelected
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
              fullWidth && "flex-1"
            )}
          >
            {isSelected ? (
              <motion.span
                layoutId={indicatorId}
                aria-hidden="true"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34, mass: 0.7 }
                }
                className={cn(
                  "absolute inset-0 -z-10",
                  variant === "pill" &&
                    "rounded-lg border border-border bg-card shadow-[var(--shadow-subtle)]",
                  variant === "underline" &&
                    "rounded-none border-b-2 border-primary bg-transparent"
                )}
              />
            ) : null}
            {item.icon ? (
              <span aria-hidden="true" className="[&_svg]:size-4 [&_svg]:shrink-0">
                {item.icon}
              </span>
            ) : null}
            {item.label}
            {item.badge ? (
              <span className="ml-0.5 rounded-full bg-muted px-1.5 py-px text-[0.6875rem] font-medium text-muted-foreground tabular-nums">
                {item.badge}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

/** Native div props minus the handlers Motion redefines with its own signature. */
type MotionSafeDivProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragLeave"
  | "onDragOver"
  | "onDrop"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "style"
>

export interface MorphingTabsPanelProps extends MotionSafeDivProps {
  /** Panel is rendered only when this matches the active tab value. */
  value: string
  activeValue: string
  /** `id` of the tab that controls this panel. */
  tabId?: string
}

/** Optional animated panel. Mount your own if you need different transitions. */
export function MorphingTabsPanel({
  value,
  activeValue,
  tabId,
  className,
  children,
  ...props
}: MorphingTabsPanelProps) {
  const reduceMotion = useReducedMotion()
  const isActive = value === activeValue

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isActive ? (
        <motion.div
          key={value}
          role="tabpanel"
          aria-labelledby={tabId}
          tabIndex={0}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            className
          )}
          {...props}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
