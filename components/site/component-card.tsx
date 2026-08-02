import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { Badge, StatusBadge } from "@/components/ui/badge"
import type { CatalogItem } from "@/lib/registry/catalog"
import { cn } from "@/lib/utils"

export interface ComponentCardProps {
  item: CatalogItem
  /** `list` drops the description to a single line for dense sections. */
  layout?: "grid" | "list"
  /** Index shown as an editorial numeral in the corner. */
  index?: number
  className?: string
}

/**
 * Catalog entry.
 *
 * The whole cell is clickable through an overlay on the title link rather than
 * by wrapping everything in an anchor — that leaves exactly one tab stop per
 * card and keeps the badges out of the link's content model.
 */
export function ComponentCard({
  item,
  layout = "grid",
  index,
  className,
}: ComponentCardProps) {
  const shared = cn(
    "group relative isolate flex flex-col border border-border bg-background p-5",
    "transition-colors duration-[var(--duration-fast)]",
    "hover:border-foreground focus-within:border-foreground",
    className
  )

  const title = (
    <h3 className="text-[0.9375rem] font-semibold tracking-tight">
      <Link
        href={`/components/${item.slug}`}
        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {item.title}
      </Link>
    </h3>
  )

  if (layout === "list") {
    return (
      <article className={cn(shared, "gap-1.5")}>
        <div className="flex items-start justify-between gap-3">
          {title}
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </article>
    )
  }

  return (
    <article className={cn(shared, "gap-3")}>
      <div className="flex items-start justify-between gap-3">
        <span className="label-caps text-muted-foreground">{item.category}</span>
        {typeof index === "number" ? (
          <span className="numeral text-[0.6875rem] text-muted-foreground">
            {String(index).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {title}
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge status={item.status} />
        {item.traits.includes("zero-deps") ? (
          <Badge variant="muted">No dependencies</Badge>
        ) : (
          <Badge variant="muted">
            {item.dependencyCount} dep{item.dependencyCount === 1 ? "" : "s"}
          </Badge>
        )}
      </div>
    </article>
  )
}
