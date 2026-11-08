"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/*
 * A horizontal shelf of cards with its own heading, "View all" and a pair of
 * arrows that page by the visible width. The arrows disable at either end;
 * the shelf itself is a plain scroll container with snap points, so touch,
 * trackpad and Shift+wheel all work without any of this script.
 */
export function RailRow({
  id,
  title,
  description,
  href,
  hrefLabel = "View all",
  children,
  itemClassName = "w-[min(78vw,20rem)] sm:w-[20.5rem]",
  className,
}: {
  id: string
  title: string
  description?: string
  href?: string
  hrefLabel?: string
  children: React.ReactNode
  itemClassName?: string
  className?: string
}) {
  const scroller = React.useRef<HTMLUListElement>(null)
  const [edges, setEdges] = React.useState({ start: true, end: false })

  const measure = React.useCallback(() => {
    const node = scroller.current
    if (!node) return
    const start = node.scrollLeft <= 4
    const end = node.scrollLeft + node.clientWidth >= node.scrollWidth - 4
    setEdges((previous) =>
      previous.start === start && previous.end === end ? previous : { start, end }
    )
  }, [])

  React.useEffect(() => {
    const node = scroller.current
    if (!node) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    node.addEventListener("scroll", measure, { passive: true })
    return () => {
      observer.disconnect()
      node.removeEventListener("scroll", measure)
    }
  }, [measure])

  function page(direction: 1 | -1) {
    const node = scroller.current
    if (!node) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    node.scrollBy({
      left: direction * Math.max(node.clientWidth * 0.86, 280),
      behavior: reduce ? "auto" : "smooth",
    })
  }

  const items = React.Children.toArray(children)

  return (
    <section aria-labelledby={id} className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0">
          <h2
            id={id}
            className="g-title text-[1.25rem] text-[var(--g-ink)] sm:text-[1.375rem]"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-[0.875rem] leading-snug text-[var(--g-ink-3)]">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {href ? (
            <Link
              href={href}
              className="mr-2 inline-flex items-center gap-0.5 rounded-md text-[0.8125rem] font-medium text-[var(--g-ink-2)] transition-colors hover:text-[var(--g-ink)]"
            >
              {hrefLabel}
              <ChevronRight aria-hidden="true" className="size-3.5" />
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={edges.start}
            aria-label={`Scroll ${title} back`}
            className="g-icon-btn hidden cursor-pointer border border-[var(--g-line)] sm:inline-flex"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            disabled={edges.end}
            aria-label={`Scroll ${title} forward`}
            className="g-icon-btn hidden cursor-pointer border border-[var(--g-line)] sm:inline-flex"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul
        ref={scroller}
        className={cn(
          "g-scroller -mx-[var(--g-bleed,0px)] flex gap-4 overflow-x-auto px-[var(--g-bleed,0px)] pb-1",
          "scroll-px-[var(--g-bleed,0px)]",
          !edges.end && "g-fade-x"
        )}
      >
        {items.map((child, index) => (
          <li
            key={React.isValidElement(child) && child.key != null ? child.key : index}
            className={cn("shrink-0", itemClassName)}
          >
            {child}
          </li>
        ))}
      </ul>
    </section>
  )
}
