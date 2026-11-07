import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

import { FlagBadge } from "./badges"
import type { WallTile } from "./data"
import { sh } from "./href"
import { LazyThumb } from "./lazy-thumb"
import type { CategoryCount } from "./types"

const LG_SPAN: Record<number, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
}

/**
 * The wall of live components. Tile sizes come from `getWallTiles`, which
 * derives them from the registry (featured and new spans two columns), so
 * nothing here knows which component is which.
 */
export function Wall({
  tiles,
  total,
  categories,
}: {
  tiles: WallTile[]
  total: number
  categories: CategoryCount[]
}) {
  return (
    <ul className="grid auto-rows-[19rem] grid-cols-1 gap-3 md:grid-flow-dense md:grid-cols-2 lg:auto-rows-[20rem] lg:grid-flow-row lg:grid-cols-4">
      {tiles.map((tile) =>
        tile.kind === "component" ? (
          <li key={tile.item.key} className={cn(tile.span === 2 && "md:col-span-2", LG_SPAN[tile.span])}>
            <article
              className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background",
                "transition-[border-color,box-shadow] duration-200 hover:border-border-hover hover:shadow-sm",
                "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring"
              )}
            >
              <div className="relative min-h-0 flex-1 bg-[var(--st-stage)]">
                <LazyThumb slug={tile.item.slug} />
              </div>
              <div className="flex h-11 shrink-0 items-center gap-2 border-t border-border px-4">
                <h3 className="min-w-0 truncate text-[13px] font-medium">
                  <Link
                    href={tile.item.href}
                    className="outline-none after:absolute after:inset-0 after:content-['']"
                  >
                    {tile.item.title}
                  </Link>
                </h3>
                <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                  {tile.item.category}
                </span>
                <FlagBadge flag={tile.item.flag} size="xs" className="ml-auto" />
                <ArrowUpRight
                  aria-hidden="true"
                  className={cn(
                    "size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                    !tile.item.flag && "ml-auto"
                  )}
                />
              </div>
            </article>
          </li>
        ) : (
          <li key="more" className={cn(tile.span >= 2 && "md:col-span-2", LG_SPAN[tile.span])}>
            <Link
              href={sh("/components")}
              className={cn(
                "group flex h-full flex-col justify-between rounded-xl border border-dashed border-border-hover p-5",
                "transition-colors duration-200 hover:border-border-strong hover:bg-subtle",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              )}
            >
              <ul className="flex flex-col gap-2 text-[13px] text-muted-foreground">
                {categories.slice(0, 6).map((category) => (
                  <li key={category.slug} className="flex items-center justify-between gap-4">
                    <span className="truncate">{category.name}</span>
                    <span className="tabular-nums">{category.count}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[15px] font-semibold tracking-[-0.015em]">All components</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">
                    {total} across {categories.length}{" "}
                    {categories.length === 1 ? "category" : "categories"}
                  </p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowRight aria-hidden="true" className="size-4" />
                </span>
              </div>
            </Link>
          </li>
        )
      )}
    </ul>
  )
}
