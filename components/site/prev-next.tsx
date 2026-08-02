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
 * The two cells share a single rule between them (`-ml-px`), so the pair reads
 * as one divided block rather than two floating cards.
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
    <nav aria-label={label} className={cn("grid sm:grid-cols-2", className)}>
      {previous ? (
        <Link
          href={previous.href}
          rel="prev"
          className={cn(
            "group flex flex-col gap-1 border border-border p-4 transition-colors",
            "hover:border-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          )}
        >
          <span className="label-caps flex items-center gap-1.5 text-muted-foreground">
            <ArrowLeft aria-hidden="true" className="size-3" />
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
            "group flex flex-col items-end gap-1 border border-border p-4 text-right transition-colors",
            "hover:border-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
            "sm:-ml-px"
          )}
        >
          <span className="label-caps flex items-center gap-1.5 text-muted-foreground">
            Next
            <ArrowRight aria-hidden="true" className="size-3" />
          </span>
          <span className="text-sm font-medium">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  )
}
