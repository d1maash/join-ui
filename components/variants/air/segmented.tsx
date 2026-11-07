"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

/*
 * Apple's segmented control: a grey track with a white thumb that slides to
 * the chosen segment. One component for two jobs — a radio group when the
 * choice is a setting (package manager), a tab list when it switches a panel
 * (source files). Arrow keys move the choice; only the chosen segment is in
 * the tab order, as both patterns require.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  mode = "radio",
  idPrefix,
  size = "sm",
  className,
}: {
  options: ReadonlyArray<{ value: T; label: React.ReactNode }>
  value: T
  onChange: (value: T) => void
  label: string
  mode?: "radio" | "tabs"
  /** Required for tabs: segment `i` controls `${idPrefix}-panel-${value}`. */
  idPrefix?: string
  size?: "sm" | "md"
  className?: string
}) {
  const layoutId = React.useId()
  const still = useReducedMotion()
  const refs = React.useRef<Array<HTMLButtonElement | null>>([])

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"]
    if (!keys.includes(event.key)) return
    event.preventDefault()
    const last = options.length - 1
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? last
          : event.key === "ArrowRight" || event.key === "ArrowDown"
            ? index === last
              ? 0
              : index + 1
            : index === 0
              ? last
              : index - 1
    const option = options[next]
    if (!option) return
    onChange(option.value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role={mode === "radio" ? "radiogroup" : "tablist"}
      aria-label={label}
      className={cn(
        "relative inline-flex max-w-full items-center overflow-x-auto rounded-full bg-[rgb(118_118_128/0.12)] p-[3px] [scrollbar-width:none]",
        className
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role={mode === "radio" ? "radio" : "tab"}
            aria-checked={mode === "radio" ? selected : undefined}
            aria-selected={mode === "tabs" ? selected : undefined}
            aria-controls={
              mode === "tabs" && idPrefix ? `${idPrefix}-panel-${option.value}` : undefined
            }
            id={mode === "tabs" && idPrefix ? `${idPrefix}-tab-${option.value}` : undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "relative isolate shrink-0 cursor-pointer rounded-full whitespace-nowrap transition-colors duration-200",
              "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#0071e3]",
              size === "sm" ? "h-7 px-3 text-[12px]" : "h-8 px-4 text-[14px]",
              selected ? "font-semibold text-[#1d1d1f]" : "text-[#1d1d1f]/70 hover:text-[#1d1d1f]"
            )}
          >
            {selected ? (
              <motion.span
                layoutId={layoutId}
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.12),0_3px_1px_rgb(0_0_0/0.04)]"
                transition={
                  still ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }
                }
              />
            ) : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
