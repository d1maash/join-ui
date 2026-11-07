import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

import { FlagBadge } from "./badges"
import { LazyThumb } from "./lazy-thumb"
import type { StudioItem } from "./types"

function dependencyLabel(count: number): string {
  if (count === 0) return "No dependencies"
  return count === 1 ? "1 dependency" : `${count} dependencies`
}

/**
 * The catalog card: a live miniature in a fixed 16:10 stage, then the name,
 * its flag, one line of description and two quiet facts. The title link is
 * stretched over the whole card, so the card is one tab stop with one
 * accessible name.
 */
export function ComponentCard({
  item,
  className,
  compact = false,
}: {
  item: StudioItem
  className?: string
  compact?: boolean
}) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-background",
        "transition-[border-color,box-shadow] duration-200 hover:border-border-hover hover:shadow-sm",
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-[var(--st-stage)]">
        <LazyThumb slug={item.slug} />
      </div>
      <div className={cn("flex flex-1 flex-col", compact ? "gap-1 p-3.5" : "gap-1.5 p-4")}>
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="min-w-0 truncate text-sm font-semibold tracking-[-0.01em]">
            <Link
              href={item.href}
              className="outline-none after:absolute after:inset-0 after:content-['']"
            >
              {item.title}
            </Link>
          </h3>
          <FlagBadge flag={item.flag} size="xs" />
          <ArrowUpRight
            aria-hidden="true"
            className="ml-auto size-3.5 shrink-0 -translate-x-0.5 text-muted-foreground opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100"
          />
        </div>
        <p
          className={cn(
            "text-[13px] leading-[1.5] text-pretty text-muted-foreground",
            compact ? "line-clamp-1" : "line-clamp-2"
          )}
        >
          {item.description}
        </p>
        {compact ? null : (
          <p className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
            <span>{item.category}</span>
            <span aria-hidden="true" className="text-border-strong">
              ·
            </span>
            <span>{dependencyLabel(item.dependencies.length)}</span>
          </p>
        )}
      </div>
    </article>
  )
}
