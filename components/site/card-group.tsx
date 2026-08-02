import type * as React from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Grid of links used inside MDX.
 *
 * Cells overlap their rules (`-ml-px -mt-px`) so the group reads as one
 * subdivided rectangle instead of a row of detached boxes.
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
        "my-6 grid",
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
          className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </span>
      {children ? (
        <span className="text-sm leading-relaxed text-muted-foreground">{children}</span>
      ) : null}
    </>
  )

  const styles = cn(
    "group -mt-px -ml-px flex flex-col gap-1.5 border border-border p-4 transition-colors",
    "hover:border-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
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
