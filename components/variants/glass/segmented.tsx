"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

import { LENS_SPRING } from "./ui"

export interface SegmentedOption<T extends string> {
  value: T
  label: React.ReactNode
}

/**
 * A segmented control whose selection is a lens of glass sliding along a
 * recessed track.
 *
 * Exposed as a radio group with a roving tab stop: Tab lands on the chosen
 * segment, the arrow keys move the choice, Home and End jump to the ends —
 * the pattern the APG gives for a single choice among a few.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  id,
  size = "md",
  wrap = false,
  className,
}: {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  /** Namespaces the lens, so two controls on one page never trade it. */
  id?: string
  size?: "sm" | "md"
  /** Lets the segments run onto a second row instead of overflowing. */
  wrap?: boolean
  className?: string
}) {
  const generated = React.useId()
  const lens = `${id ?? generated}-lens`
  const refs = React.useRef<Array<HTMLButtonElement | null>>([])

  function move(index: number) {
    const count = options.length
    const next = options[(index + count) % count]
    if (!next) return
    onChange(next.value)
    refs.current[(index + count) % count]?.focus()
  }

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault()
      move(index + 1)
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault()
      move(index - 1)
    } else if (event.key === "Home") {
      event.preventDefault()
      move(0)
    } else if (event.key === "End") {
      event.preventDefault()
      move(options.length - 1)
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "g-well max-w-full items-center p-[3px]",
        wrap ? "flex flex-wrap gap-y-0.5 rounded-[18px]" : "inline-flex rounded-full",
        className
      )}
    >
      {options.map((option, index) => {
        const checked = option.value === value
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "relative shrink-0 cursor-pointer rounded-full tracking-[-0.016em] whitespace-nowrap transition-colors duration-200",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3]",
              size === "sm" ? "h-7 px-3 text-[13px]" : "h-9 px-4 text-[14px]",
              checked
                ? "font-medium text-[#1d1d1f]"
                : "text-[#3a3a3e] hover:text-[#1d1d1f]"
            )}
          >
            {checked ? (
              <motion.span
                layoutId={lens}
                transition={LENS_SPRING}
                aria-hidden="true"
                className="g-lens absolute inset-0 rounded-full"
              />
            ) : null}
            <span className="relative">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
