import * as React from "react"

import { cn } from "@/lib/utils"

const COL_SPAN = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
} as const

const ROW_SPAN = {
  1: "md:row-span-1",
  2: "md:row-span-2",
  3: "md:row-span-3",
} as const

export interface BentoGridProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Columns at the `md` breakpoint and up. Always one column on mobile. */
  columns?: 2 | 3 | 4
  /** Minimum height of a single-row tile. */
  rowHeight?: string
}

const COLUMNS = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
} as const

/**
 * A responsive bento layout: an auto-flowing dense grid that collapses to a
 * single readable column on small screens.
 *
 * This is a Server Component — it ships no JavaScript. Spans are looked up from
 * a static map rather than interpolated into class names, so Tailwind can see
 * every class at build time and nothing gets purged.
 */
export function BentoGrid({
  columns = 3,
  rowHeight = "11rem",
  className,
  style,
  children,
  ...props
}: BentoGridProps) {
  return (
    <div
      style={{ gridAutoRows: `minmax(${rowHeight}, auto)`, ...style }}
      className={cn(
        "grid grid-flow-dense grid-cols-1 gap-4",
        COLUMNS[columns],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface BentoGridItemProps extends React.ComponentPropsWithoutRef<"div"> {
  colSpan?: keyof typeof COL_SPAN
  rowSpan?: keyof typeof ROW_SPAN
  /** Renders a heading, body copy and icon in the house style. */
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  /** Decorative layer behind the content — an image, gradient or preview. */
  background?: React.ReactNode
  /** Turn the whole tile into a link target. Adds hover and focus affordances. */
  href?: string
}

export function BentoGridItem({
  colSpan = 1,
  rowSpan = 1,
  title,
  description,
  icon,
  background,
  href,
  className,
  children,
  ...props
}: BentoGridItemProps) {
  const body = (
    <>
      {background ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {background}
        </div>
      ) : null}

      {icon ? (
        <span
          aria-hidden="true"
          className={cn(
            "mb-3 flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground",
            "transition-colors duration-[var(--duration-base)] group-hover:text-foreground",
            "[&_svg]:size-4"
          )}
        >
          {icon}
        </span>
      ) : null}

      {title ? (
        <h3 className="text-[0.9375rem] font-semibold tracking-tight">{title}</h3>
      ) : null}

      {description ? (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}

      {children}
    </>
  )

  const shared = cn(
    "group relative isolate flex flex-col overflow-hidden rounded-xl border border-border bg-card p-5 text-card-foreground",
    "shadow-[var(--shadow-subtle)] transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
    COL_SPAN[colSpan],
    ROW_SPAN[rowSpan],
    className
  )

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          shared,
          "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-raised)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        )}
      >
        {body}
      </a>
    )
  }

  return (
    <div className={shared} {...props}>
      {body}
    </div>
  )
}
