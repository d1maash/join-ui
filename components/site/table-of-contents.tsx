"use client"

import * as React from "react"

import type { TocEntry } from "@/lib/mdx/source"
import { cn } from "@/lib/utils"

/**
 * On-page contents with scroll spy.
 *
 * A single `IntersectionObserver` watches every heading; the topmost visible
 * one wins. The `rootMargin` biases the active band toward the upper third of
 * the viewport, which matches where a reader's eye actually sits.
 */
export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [activeId, setActiveId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (entries.length === 0) return

    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((element): element is HTMLElement => element !== null)

    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (observed) => {
        const visible = observed
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: "-88px 0px -66% 0px", threshold: 0 }
    )

    for (const heading of headings) observer.observe(heading)
    return () => observer.disconnect()
  }, [entries])

  if (entries.length === 0) return null

  return (
    <nav aria-label="On this page" className="py-10">
      <p className="label-micro mb-3 text-muted-foreground">On this page</p>
      <ul className="flex flex-col">
        {entries.map((entry) => {
          const active = activeId === entry.id
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "block border-l-2 py-1.5 text-[0.8125rem] leading-snug transition-colors",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                  entry.level === 3 ? "pl-6" : "pl-3",
                  active
                    ? "border-foreground font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border-hover hover:text-foreground"
                )}
              >
                {entry.title}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
