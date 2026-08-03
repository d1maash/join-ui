import type * as React from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Grid of links used inside MDX.
 *
 * Separate raised cards with a gap between them, matching the catalog: the
 * lift and the brand hue on hover are the same gesture in both places.
 */
export function CardGroup({
  children,
  columns = 2,
  className,
}: {
  children: React.ReactNode
  columns?: 2 | 3
  className?: string
}) {
  return (
    <div
      className={cn(
        "my-6 grid gap-3",
        columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
        className
      )}
    >
      {children}
    </div>
  )
}

export function DocsCard({
  title,
  href,
  children,
}: {
  title: string
  href: string
  children?: React.ReactNode
}) {
  const external = href.startsWith("http")

  const body = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium">{title}</span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        />
      </span>
      {children ? (
        <span className="text-sm leading-relaxed text-muted-foreground">{children}</span>
      ) : null}
    </>
  )

  const styles = cn(
    "group flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4 shadow-xs",
    "transition-[border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
    "hover:border-border-hover hover:shadow-sm",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={styles}>
        {body}
      </a>
    )
  }

  return (
    <Link href={href} className={styles}>
      {body}
    </Link>
  )
}
