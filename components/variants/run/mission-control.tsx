"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import { Search, X } from "lucide-react"

import { renderThumb } from "@/components/previews/thumbs/registry"
import type { CatalogItem } from "@/lib/registry/catalog"
import { variantHref } from "@/lib/variants"

import { MiniWindow } from "./window"

const href = (path: string) => variantHref("run", path)
const ALL = "All"
const EASE = [0.32, 0.72, 0, 1] as const
const TILE = { type: "spring", visualDuration: 0.5, bounce: 0.12 } as const
const BAR = 28
const GAP_X = 28
const GAP_Y = 44

/*
 * How Mission Control would tile this many windows across this much room: one
 * big window alone, two side by side, a row of three, a two-by-two, and past
 * that rows of three or four with the last row centred. Fewer windows get
 * bigger, the way they do when you swipe up on a Mac.
 */
function tiling(count: number, width: number) {
  let cols: number
  if (width < 560) cols = 1
  else if (width < 900) cols = Math.min(2, count)
  else if (count <= 3) cols = Math.max(1, count)
  else if (count === 4) cols = 2
  else if (count <= 6) cols = 3
  else cols = 4
  const cap = count === 1 ? 760 : count === 2 || count === 4 ? 600 : 520
  const w = Math.min(cap, (width - GAP_X * (cols - 1)) / cols)
  return { w: Math.floor(w), h: Math.floor(w / 1.5) }
}

/** The catalog, reading its category from the query string. Needs a Suspense boundary. */
export function MissionControlRoute({ items }: { items: CatalogItem[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const onCategory = (next: string) => {
    const params = new URLSearchParams(searchParams)
    if (next === ALL) params.delete("category")
    else params.set("category", next)
    const search = params.toString()
    router.replace(search ?  : pathname, { scroll: false })
  }
  return (
    <MissionControl
      items={items}
      requested={searchParams.get("category") ?? ALL}
      onCategory={onCategory}
    />
  )
}

/*
 * Every component as a live window on the black stage, its name under it, the
 * way Mission Control spreads out what is open. The category control re-tiles
 * the windows rather than hiding cards: the ones that stay slide and grow into
 * the room the others leave.
 */
export function MissionControl({
  items,
  requested = ALL,
  onCategory,
}: {
  items: CatalogItem[]
  requested?: string
  onCategory?: (category: string) => void
}) {
  const [query, setQuery] = React.useState("")
  const stage = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(1280)

  React.useLayoutEffect(() => {
    const node = stage.current
    if (!node) return
    const read = () => setWidth(node.clientWidth)
    read()
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const categories = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
    return [
      { name: ALL, count: items.length },
      ...[...counts.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, count]) => ({ name, count })),
    ]
  }, [items])
  const category = categories.some((entry) => entry.name === requested) ? requested : ALL

  const setCategory = (next: string) => {
    const params = new URLSearchParams(searchParams)
    if (next === ALL) params.delete("category")
    else params.set("category", next)
    const search = params.toString()
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
  }

  const shown = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return items.filter((item) => {
      if (category !== ALL && item.category !== category) return false
      if (!needle) return true
      return (
        item.title.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle) ||
        item.category.toLowerCase().includes(needle) ||
        item.tags.some((tag) => tag.toLowerCase().includes(needle))
      )
    })
  }, [items, category, query])

  const tile = tiling(Math.max(1, shown.length), width)

  return (
    <LayoutGroup>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div
          role="group"
          aria-label="Category"
          className="run-seg -mx-1 max-w-full overflow-x-auto [scrollbar-width:none]"
        >
          {categories.map((entry) => (
            <button
              key={entry.name}
              type="button"
              aria-pressed={category === entry.name}
              onClick={() => setCategory(entry.name)}
              className="shrink-0 whitespace-nowrap"
            >
              {category === entry.name ? (
                <motion.span
                  layoutId="run-category-thumb"
                  className="run-seg-thumb"
                  transition={{ type: "spring", visualDuration: 0.3, bounce: 0.12 }}
                />
              ) : null}
              {entry.name}
              <span className="ml-1.5 text-[11px] text-[#77777c] tabular-nums">{entry.count}</span>
            </button>
          ))}
        </div>

        <label className="relative flex h-9 w-full items-center md:w-[17rem]">
          <span className="sr-only">Search components</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 size-3.5 text-[#77777c]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the seven"
            className="h-full w-full rounded-[9px] bg-white/[0.04] pr-9 pl-9 text-[14px] text-[#f5f5f7] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] transition-shadow outline-none placeholder:text-[#77777c] focus:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.3)] [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-md text-[#8b8b90] hover:bg-white/[0.08] hover:text-white"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          ) : null}
        </label>
      </div>

      <div ref={stage} className="relative mt-12 min-h-[28rem] md:mt-16">
        <p className="sr-only" aria-live="polite">
          {shown.length === 1 ? "1 component" : `${shown.length} components`}
        </p>
        <motion.ul
          layout
          className="flex flex-wrap justify-center"
          style={{ columnGap: GAP_X, rowGap: GAP_Y }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((item) => (
              <motion.li
                key={item.slug}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.22, ease: EASE } }}
                transition={TILE}
                style={{ width: tile.w }}
              >
                <Link href={href(`/components/${item.slug}`)} className="group block rounded-[12px]">
                  <MiniWindow title={item.title}>
                    <div
                      className="run-thumb-frame dark bg-background"
                      style={
                        {
                          height: tile.h - BAR,
                          "--run-thumb-scale": Math.min(tile.w / 480, (tile.h - BAR) / 320),
                        } as React.CSSProperties
                      }
                      inert
                      aria-hidden="true"
                    >
                      <div>{renderThumb(item.slug)}</div>
                    </div>
                  </MiniWindow>
                  <span className="mt-3.5 flex items-baseline justify-center gap-2 text-center">
                    <span className="text-[15px] font-medium text-[#f5f5f7] group-hover:underline group-hover:underline-offset-4">
                      {item.title}
                    </span>
                    <span className="text-[13px] text-[#77777c]">{item.category}</span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        {shown.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-[17px] text-[#8b8b90]">
              No window matches <span className="text-[#f5f5f7]">“{query}”</span>.
            </p>
            <button
              type="button"
              className="run-btn run-btn--quiet run-btn--sm"
              onClick={() => {
                setQuery("")
                setCategory(ALL)
              }}
            >
              Show all seven
            </button>
          </div>
        ) : null}
      </div>
    </LayoutGroup>
  )
}
