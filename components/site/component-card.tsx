import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { ComponentThumbnail } from "@/components/site/component-thumbnail"
import { StatusBadge, UpdatedBadge } from "@/components/ui/badge"
import type { CatalogItem } from "@/lib/registry/catalog"
import { cn } from "@/lib/utils"

export interface ComponentCardProps {
  item: CatalogItem
  /**
   * `grid` leads with a running thumbnail of the component; `list` is a title
   * and two lines of description for dense sections.
   */
  layout?: "grid" | "list"
  /** Index shown as an editorial numeral beside the title. */
  index?: number
  className?: string
}

/**
 * Catalog entry.
 *
 * The whole cell is clickable through an overlay on the title link rather than
 * by wrapping everything in an anchor — that leaves exactly one tab stop per
 * card and keeps the badges out of the link's content model.
 *
 * In the grid the card is mostly stage: the component itself where the
 * description used to be, still at rest and playing while the card is pointed
 * at. A sentence about a motion component asks the reader to imagine the one
 * thing the card could simply show them, so the words are left to the page
 * behind the click and the card keeps only what names it.
 */
export function ComponentCard({
  item,
  layout = "grid",
  index,
  className,
}: ComponentCardProps) {
  const shared = cn(
    "group relative isolate flex flex-col rounded-xl border border-border bg-card shadow-xs",
    "transition-[border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
    "hover:border-border-hover hover:shadow-sm",
    "focus-within:border-border-hover focus-within:shadow-sm",
    className
  )

  const title = (
    <h3 className="text-[0.9375rem] font-semibold">
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
      <article className={cn(shared, "gap-1.5 p-5")}>
        <div className="flex items-start justify-between gap-3">
          {title}
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
          />
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </article>
    )
  }

  return (
    <article className={cn(shared, "overflow-hidden")}>
      <div className="border-b border-border bg-background">
        {/*
          Fixed height rather than an aspect ratio: the thumbnails are real
          components at their real size, so they are drawn for one box and
          centred in it, and a stage that grew with the column would only add
          empty margin around them. What runs past the box fades at its edges.
        */}
        <ComponentThumbnail
          slug={item.slug}
          className={cn(
            "pointer-events-none flex h-72 items-center justify-center overflow-hidden p-5",
            "[mask-image:linear-gradient(to_bottom,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)]"
          )}
          fallback={
            <p className="text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          }
        />
      </div>

      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1.5">
          {title}
          <StatusBadge status={item.status} />
          {item.updated ? <UpdatedBadge /> : null}
        </div>
        {typeof index === "number" ? (
          <span className="numeral shrink-0 text-[0.6875rem] text-muted-foreground">
            {String(index).padStart(2, "0")}
          </span>
        ) : null}
      </div>
    </article>
  )
}
