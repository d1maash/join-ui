import Link from "next/link"
import { Package } from "lucide-react"

import { CardPreview } from "@/components/docs/card-preview"
import { Badge, StatusBadge } from "@/components/ui/badge"
import type { CatalogItem } from "@/lib/registry/catalog"
import { cn } from "@/lib/utils"

export interface ComponentCardProps {
  item: CatalogItem
  /** `list` renders a compact horizontal row without the preview. */
  layout?: "grid" | "list"
  className?: string
}

/**
 * Catalog card.
 *
 * The whole card is clickable through an overlay on the title link rather than
 * by wrapping everything in an anchor — that keeps the embedded demo's buttons
 * out of the link's content model and leaves exactly one tab stop per card.
 */
export function ComponentCard({
  item,
  layout = "grid",
  className,
}: ComponentCardProps) {
  const shared = cn(
    "group relative isolate flex overflow-hidden rounded-xl border border-border bg-card",
    "transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
    "hover:border-border-strong hover:shadow-[var(--shadow-raised)]",
    "focus-within:border-border-strong focus-within:shadow-[var(--shadow-raised)]",
    className
  )

  const meta = (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant="outline">{item.category}</Badge>
      <StatusBadge status={item.status} />
      {item.traits.includes("zero-deps") ? (
        <Badge variant="success">No dependencies</Badge>
      ) : (
        <Badge variant="neutral">
          <Package aria-hidden="true" className="size-2.5" />
          {item.dependencyCount} dep{item.dependencyCount === 1 ? "" : "s"}
        </Badge>
      )}
    </div>
  )

  const title = (
    <h3 className="text-[0.9375rem] font-semibold tracking-tight">
      <Link
        href={`/components/${item.slug}`}
        className="rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {item.title}
      </Link>
    </h3>
  )

  if (layout === "list") {
    return (
      <article className={cn(shared, "flex-col gap-3 p-4 sm:flex-row sm:items-center")}>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {title}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        </div>
        <div className="shrink-0">{meta}</div>
      </article>
    )
  }

  return (
    <article className={cn(shared, "flex-col")}>
      <CardPreview slug={item.slug} />
      <div className="flex flex-1 flex-col gap-2 p-4">
        {title}
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
        {meta}
      </div>
    </article>
  )
}
