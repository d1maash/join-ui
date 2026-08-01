import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface PrevNextLink {
  title: string
  href: string
}

export interface PreviousNextNavigationProps {
  previous?: PrevNextLink | undefined
  next?: PrevNextLink | undefined
  className?: string
  label?: string
}

/**
 * Sequential navigation between sibling pages. Rendered as a `nav` landmark so
 * it can be skipped, with directional labels that read correctly out of context.
 */
export function PreviousNextNavigation({
  previous,
  next,
  className,
  label = "Page navigation",
}: PreviousNextNavigationProps) {
  if (!previous && !next) return null

  return (
    <nav
      aria-label={label}
      className={cn("grid gap-3 sm:grid-cols-2", className)}
    >
      {previous ? (
        <Link
          href={previous.href}
          rel="prev"
          className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-[border-color,box-shadow] duration-[var(--duration-base)] hover:border-border-strong hover:shadow-[var(--shadow-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeft
              aria-hidden="true"
              className="size-3.5 transition-transform duration-[var(--duration-base)] group-hover:-translate-x-0.5"
            />
            Previous
          </span>
          <span className="text-sm font-medium">{previous.title}</span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={next.href}
          rel="next"
          className="group flex flex-col items-end gap-1 rounded-xl border border-border bg-card p-4 text-right transition-[border-color,box-shadow] duration-[var(--duration-base)] hover:border-border-strong hover:shadow-[var(--shadow-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Next
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-[var(--duration-base)] group-hover:translate-x-0.5"
            />
          </span>
          <span className="text-sm font-medium">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  )
}
