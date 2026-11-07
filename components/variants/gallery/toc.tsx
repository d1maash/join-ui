"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * On-page contents with a scroll spy: the last heading that has crossed the
 * upper third of the viewport is the current one. A single observer for the
 * whole list.
 */
export function Toc({
  entries,
  title = "On this page",
  className,
  footer,
}: {
  entries: Array<{ id: string; title: string; level: 2 | 3 }>
  title?: string
  className?: string
  footer?: React.ReactNode
}) {
  const [active, setActive] = React.useState<string | null>(entries[0]?.id ?? null)

  React.useEffect(() => {
    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((node): node is HTMLElement => node !== null)
    if (headings.length === 0) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) visible.add(record.target.id)
          else visible.delete(record.target.id)
        }
        const first = headings.find((heading) => visible.has(heading.id))
        if (first) setActive(first.id)
      },
      { rootMargin: "-72px 0px -62% 0px" }
    )
    for (const heading of headings) observer.observe(heading)
    return () => observer.disconnect()
  }, [entries])

  if (entries.length === 0) return null

  return (
    <nav aria-label={title} className={cn("text-[0.8125rem]", className)}>
      <p className="mb-3 text-[0.75rem] font-medium text-[var(--g-ink-4)]">{title}</p>
      <ul className="flex flex-col border-l border-[var(--g-line)]">
        {entries.map((entry) => {
          const current = entry.id === active
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-1 leading-snug transition-colors",
                  entry.level === 3 ? "pl-6" : "pl-3",
                  current
                    ? "border-[var(--g-accent)] text-[var(--g-ink)]"
                    : "border-transparent text-[var(--g-ink-3)] hover:text-[var(--g-ink)]"
                )}
              >
                {entry.title}
              </a>
            </li>
          )
        })}
      </ul>
      {footer}
    </nav>
  )
}
