import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface NavTarget {
  title: string
  href: string
}

/**
 * Sequential navigation.
 *
 * Two raised cards with a gap between them; each lifts a little and picks up
 * the brand hue on hover, the same gesture the catalog cards use.
 */
export function PrevNextNavigation({
  previous,
  next,
  label,
  className,
}: {
  previous?: NavTarget
  next?: NavTarget
  label: string
  className?: string
}) {
  if (!previous && !next) return null

  return (
    <nav aria-label={label} className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {previous ? (
        <Link
          href={previous.href}
          rel="prev"
          className={cn(
            "group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-xs",
            "transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
            "hover:border-border-hover hover:shadow-sm",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          )}
        >
          <span className="label-caps flex items-center gap-1.5 text-muted-foreground transition-colors group-hover:text-foreground">
            <ArrowLeft
              aria-hidden="true"
              className="size-3 transition-transform group-hover:-translate-x-0.5"
            />
            Previous
          </span>
          <span className="text-sm font-medium">{previous.title}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={next.href}
          rel="next"
          className={cn(
            "group flex flex-col items-end gap-1 rounded-xl border border-border bg-card p-4 text-right shadow-xs",
            "transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
            "hover:border-border-hover hover:shadow-sm",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
            "sm:col-start-2"
          )}
        >
          <span className="label-caps flex items-center gap-1.5 text-muted-foreground transition-colors group-hover:text-foreground">
            Next
            <ArrowRight
              aria-hidden="true"
              className="size-3 transition-transform group-hover:translate-x-0.5"
            />
          </span>
          <span className="text-sm font-medium">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  )
}
