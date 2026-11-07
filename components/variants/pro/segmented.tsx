"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

/*
 * The Apple segmented control: a dark track, one lifted thumb that slides to
 * the selection on a spring. Two semantics share the look — a radio group for
 * a filter or a setting, and a tab list that owns panels.
 */

const TRACK =
  "relative inline-flex max-w-full items-center rounded-full bg-white/[0.08] p-[3px] shadow-[inset_0_0_0_0.5px_rgb(255_255_255/0.06)]"

const SEGMENT = cn(
  "relative z-[1] flex cursor-pointer items-center justify-center gap-1.5 rounded-full whitespace-nowrap",
  "transition-colors duration-200",
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2997ff]"
)

const SIZES = {
  sm: "h-7 px-3 text-[12px] font-medium tracking-[-0.005em]",
  md: "h-9 px-4 text-[14px] font-medium tracking-[-0.01em]",
}

const SPRING = { type: "spring", stiffness: 520, damping: 42, mass: 0.9 } as const

function Thumb({ id }: { id: string }) {
  return (
    <motion.span
      layoutId={id}
      transition={SPRING}
      aria-hidden="true"
      className="absolute inset-0 -z-[1] rounded-full bg-[#636366]/70 shadow-[0_1px_4px_rgb(0_0_0/0.35),inset_0_0.5px_0_rgb(255_255_255/0.18)]"
    />
  )
}

/** Arrow-key movement shared by both semantics. */
function useRoving<T extends string>(
  values: T[],
  value: T,
  onChange: (next: T) => void,
  refs: React.RefObject<Array<HTMLButtonElement | null>>
) {
  return (event: React.KeyboardEvent) => {
    const index = values.indexOf(value)
    let next = index
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index + 1
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index - 1
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = values.length - 1
    else return
    event.preventDefault()
    const wrapped = (next + values.length) % values.length
    const target = values[wrapped]
    if (target === undefined) return
    onChange(target)
    refs.current?.[wrapped]?.focus()
  }
}

export interface SegmentOption<T extends string> {
  value: T
  label: React.ReactNode
  /** Accessible name when the label is not plain text. */
  ariaLabel?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
}: {
  options: SegmentOption<T>[]
  value: T
  onChange: (next: T) => void
  label: string
  size?: "sm" | "md"
  className?: string
}) {
  const id = React.useId()
  const refs = React.useRef<Array<HTMLButtonElement | null>>([])
  const onKeyDown = useRoving(
    options.map((option) => option.value),
    value,
    onChange,
    refs
  )

  return (
    <div role="radiogroup" aria-label={label} className={cn(TRACK, className)}>
      {options.map((option, index) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.ariaLabel}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={onKeyDown}
            className={cn(
              SEGMENT,
              SIZES[size],
              active ? "text-white" : "text-[#a1a1a6] hover:text-[#f5f5f7]"
            )}
          >
            {active ? <Thumb id={id} /> : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export interface SegmentTab {
  value: string
  label: React.ReactNode
  content: React.ReactNode
}

export function SegmentedTabs({
  items,
  label,
  size = "md",
  defaultValue,
  className,
  listClassName,
  panelClassName,
  align = "start",
}: {
  items: SegmentTab[]
  label: string
  size?: "sm" | "md"
  defaultValue?: string
  className?: string
  listClassName?: string
  panelClassName?: string
  align?: "start" | "center"
}) {
  const id = React.useId()
  const [value, setValue] = React.useState(defaultValue ?? items[0]?.value ?? "")
  const refs = React.useRef<Array<HTMLButtonElement | null>>([])
  const onKeyDown = useRoving(
    items.map((item) => item.value),
    value,
    setValue,
    refs
  )

  return (
    <div className={className}>
      <div
        className={cn(
          "pro-no-scrollbar flex overflow-x-auto",
          align === "center" && "justify-center",
          listClassName
        )}
      >
        <div role="tablist" aria-label={label} className={TRACK}>
          {items.map((item, index) => {
            const active = item.value === value
            return (
              <button
                key={item.value}
                ref={(node) => {
                  refs.current[index] = node
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${index}`}
                aria-selected={active}
                aria-controls={`${id}-panel-${index}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setValue(item.value)}
                onKeyDown={onKeyDown}
                className={cn(
                  SEGMENT,
                  SIZES[size],
                  active ? "text-white" : "text-[#a1a1a6] hover:text-[#f5f5f7]"
                )}
              >
                {active ? <Thumb id={id} /> : null}
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {items.map((item, index) => (
        <div
          key={item.value}
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={item.value !== value}
          tabIndex={0}
          className={cn("focus-visible:outline-offset-4", panelClassName)}
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
