"use client"

import Link from "next/link"
import { Maximize2 } from "lucide-react"

import { CopyPromptIcon } from "@/components/site/copy-prompt-icon"
import { LazyThumb } from "@/components/site/lazy-thumb"
import { formatDate } from "@/components/site/links"
import { cn } from "@/lib/utils"

import type { GalleryItem } from "@/components/site/data"

/*
 * The one card. Rails, the catalog grid, related rows and the 404 all render
 * this, at different widths; the thumbnail area holds a fixed aspect so a
 * page of them never reflows when the miniatures mount.
 */

export function StatusPill({
  item,
  className,
}: {
  item: Pick<GalleryItem, "status"> & { updated?: string }
  className?: string
}) {
  if (item.status === "new")
    return <span className={cn("g-pill g-pill-new", className)}>New</span>
  if (item.updated || item.status === "updated")
    return <span className={cn("g-pill g-pill-updated", className)}>Updated</span>
  if (item.status === "experimental")
    return <span className={cn("g-pill", className)}>Experimental</span>
  return null
}

export function GalleryCard({
  item,
  aspect = "4/3",
  description = false,
  dated = false,
  eager = false,
  className,
}: {
  item: GalleryItem
  aspect?: "4/3" | "16/10" | "16/9"
  description?: boolean
  /** Adds when it landed, or when it was last reworked, under the title. */
  dated?: boolean
  eager?: boolean
  className?: string
}) {
  const slug = item.slug
  const href = `/components/${slug}`

  return (
    <article
      className={cn(
        "g-card group/card relative flex min-w-0 flex-col gap-3",
        className
      )}
    >
      <div className="g-card-thumb" style={{ aspectRatio: aspect.replace("/", " / ") }}>
        <LazyThumb slug={slug} eager={eager} />
        <div className="g-card-actions absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          <CopyPromptIcon slug={slug} title={item.title} />
          <Link
            href={`/preview/${slug}`}
            aria-label={`Open ${item.title} full-screen`}
            className="relative z-10 inline-flex size-7 items-center justify-center rounded-lg border border-white/10 bg-black/55 text-white/85 shadow-[0_2px_10px_rgb(0_0_0/0.4)] backdrop-blur-md transition-colors hover:bg-black/75 hover:text-white"
          >
            <Maximize2 aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[0.875rem] leading-5 font-medium tracking-[-0.012em] text-[var(--g-ink)]">
            <Link
              href={href}
              className="g-card-title g-card-link outline-none after:absolute after:inset-0 after:z-[1] after:content-['']"
            >
              {item.title}
            </Link>
          </h3>
          {description ? (
            <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-[1.45] text-[var(--g-ink-3)]">
              {item.description}
            </p>
          ) : (
            <p className="truncate text-[0.8125rem] leading-5 text-[var(--g-ink-3)]">
              {item.category}
              {dated ? (
                <span className="text-[var(--g-ink-4)]">
                  {" · "}
                  {item.updated ? "Updated" : "Added"}{" "}
                  {formatDate(item.touched).split(",")[0]}
                </span>
              ) : null}
            </p>
          )}
        </div>
        <StatusPill item={item} className="mt-0.5" />
      </div>
    </article>
  )
}
