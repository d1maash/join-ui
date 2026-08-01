"use client"

import * as React from "react"

import type { TocEntry } from "@/lib/mdx/source"
import { cn } from "@/lib/utils"

export interface TableOfContentsProps {
  entries: TocEntry[]
  className?: string
  title?: string
}

/**
 * On-page navigation with scroll spy.
 *
 * A single `IntersectionObserver` watches every heading; the topmost heading
 * currently in the upper band of the viewport wins. `aria-current="location"`
 * marks the active link, so the state is exposed rather than being colour-only.
 */
export function TableOfContents({
  entries,
  className,
  title = "On this page",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (entries.length === 0) return

    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((node): node is HTMLElement => node !== null)

    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((record) => record.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
          return
        }

        // Nothing in the band: fall back to the last heading scrolled past.
        const passed = headings.filter(
          (heading) => heading.getBoundingClientRect().top < 120
        )
        const last = passed[passed.length - 1]
        if (last) setActiveId(last.id)
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: [0, 1] }
    )

    for (const heading of headings) observer.observe(heading)
    return () => observer.disconnect()
  }, [entries])

  if (entries.length === 0) return null

  return (
    <nav aria-label={title} className={cn("text-sm", className)}>
      <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <ul className="flex flex-col gap-0.5 border-l border-border">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={activeId === entry.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1 pr-2 text-[0.8125rem] leading-snug transition-colors duration-[var(--duration-fast)]",
                entry.level === 2 ? "pl-3" : "pl-6",
                activeId === entry.id
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {entry.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
