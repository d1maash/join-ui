"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/*
 * The Apple Store shelf: a row of tall cards that runs off the right edge of
 * the window, starts flush with the page's text column on the left, and is
 * paged by two round paddles under its far end. Touch and trackpads scroll it
 * natively; the paddles are for everyone else, and disable themselves at
 * either end.
 */
export function Shelf({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  const track = React.useRef<HTMLUListElement>(null)
  const [edges, setEdges] = React.useState({ start: true, end: false })

  const measure = React.useCallback(() => {
    const element = track.current
    if (!element) return
    const max = element.scrollWidth - element.clientWidth
    setEdges({ start: element.scrollLeft <= 4, end: element.scrollLeft >= max - 4 })
  }, [])

  React.useEffect(() => {
    measure()
    const element = track.current
    if (!element) return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [measure])

  function page(direction: 1 | -1) {
    const element = track.current
    if (!element) return
    const first = element.querySelector<HTMLElement>(":scope > li")
    const step = first ? first.offsetWidth + 20 : element.clientWidth * 0.8
    const visible = Math.max(1, Math.floor(element.clientWidth / step))
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    element.scrollBy({ left: direction * step * visible, behavior: reduce ? "auto" : "smooth" })
  }

  return (
    <div className={cn("relative", className)}>
      <ul
        ref={track}
        onScroll={measure}
        aria-label={label}
        className="air-shelf flex gap-5 overflow-x-auto px-[max(1.25rem,calc((100%-75rem)/2))] pt-2 pb-10 [--air-gutter:max(1.25rem,calc((100%-75rem)/2))]"
      >
        {children}
      </ul>
      <div className="mx-auto flex max-w-[75rem] justify-end gap-3 px-5">
        <Paddle
          label="Previous"
          disabled={edges.start}
          onClick={() => page(-1)}
          icon={<ChevronLeft aria-hidden="true" strokeWidth={2.2} className="size-5" />}
        />
        <Paddle
          label="Next"
          disabled={edges.end}
          onClick={() => page(1)}
          icon={<ChevronRight aria-hidden="true" strokeWidth={2.2} className="size-5" />}
        />
      </div>
    </div>
  )
}

function Paddle({
  label,
  disabled,
  onClick,
  icon,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex size-9 cursor-pointer items-center justify-center rounded-full bg-[rgb(210_210_215/0.64)] text-[#1d1d1f]/80 transition-[background-color,opacity] duration-200",
        "hover:bg-[rgb(223_223_227/0.85)] hover:text-[#1d1d1f]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]",
        "disabled:cursor-default disabled:opacity-40"
      )}
    >
      {icon}
    </button>
  )
}
