import type * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/** Previous / next, as two panes of glass. */
export function SiblingNav({
  label,
  previous,
  next,
  className,
}: {
  label: string
  previous?: { title: string; href: string }
  next?: { title: string; href: string }
  className?: string
}) {
  if (!previous && !next) return null
  return (
    <nav aria-label={label} className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {previous ? (
        <Sibling {...previous} direction="previous" />
      ) : (
        <span aria-hidden="true" className="hidden sm:block" />
      )}
      {next ? <Sibling {...next} direction="next" /> : null}
    </nav>
  )
}

function Sibling({
  href,
  title,
  direction,
}: {
  href: string
  title: string
  direction: "previous" | "next"
}) {
  const next = direction === "next"
  return (
    <Link
      href={href}
      rel={next ? "next" : "prev"}
      className={cn(
        "group g-glass g-flat flex items-center gap-4 rounded-[28px] px-6 py-5 transition-[--g-fill] duration-300 [--g-fill:0.62] hover:[--g-fill:0.82]",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3]",
        next && "flex-row-reverse text-right"
      )}
    >
      {next ? (
        <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-[#0066cc]" />
      ) : (
        <ChevronLeft aria-hidden="true" className="size-5 shrink-0 text-[#0066cc]" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] text-[#56565b]">{next ? "Next" : "Previous"}</span>
        <span className="block truncate text-[19px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
          {title}
        </span>
      </span>
    </Link>
  )
}

/**
 * Registry prose quotes identifiers in backticks. Rendered as text they read
 * as stray punctuation, so the quoted runs are set as inline code.
 */
export function Prose({ text }: { text: string }): React.ReactNode {
  const parts = text.split(/(`[^`]+`)/g)
  return parts.map((part, index) =>
    part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
      <code
        key={index}
        className="rounded-[5px] bg-black/[0.05] px-1 py-px font-mono text-[0.86em] text-[#1d1d1f]"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    )
  )
}
