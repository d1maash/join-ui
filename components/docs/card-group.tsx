import * as React from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CardGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  columns?: 1 | 2 | 3
}

const COLUMNS = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
} as const

export function CardGroup({
  columns = 2,
  className,
  children,
  ...props
}: CardGroupProps) {
  return (
    <div
      className={cn("my-5 grid grid-cols-1 gap-3", COLUMNS[columns], className)}
      {...props}
    >
      {children}
    </div>
  )
}

export interface DocsCardProps {
  title: string
  description?: string
  href?: string
  icon?: React.ReactNode
  external?: boolean
  className?: string
  children?: React.ReactNode
}

/** Linkable card used inside MDX. Falls back to a static panel without `href`. */
export function DocsCard({
  title,
  description,
  href,
  icon,
  external = false,
  className,
  children,
}: DocsCardProps) {
  const body = (
    <>
      <div className="flex items-center gap-2">
        {icon ? (
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground [&_svg]:size-3.5"
          >
            {icon}
          </span>
        ) : null}
        <span className="text-sm font-semibold tracking-tight">{title}</span>
        {href ? (
          <ArrowUpRight
            aria-hidden="true"
            className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--duration-base)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        ) : null}
      </div>
      {description ? (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children ? (
        <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      ) : null}
    </>
  )

  const shared = cn(
    "group block rounded-xl border border-border bg-card p-4",
    "transition-[border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
    className
  )

  if (!href) return <div className={shared}>{body}</div>

  const interactive = cn(
    shared,
    "hover:border-border-strong hover:shadow-[var(--shadow-subtle)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={interactive}>
        {body}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    )
  }

  return (
    <Link href={href} className={interactive}>
      {body}
    </Link>
  )
}
