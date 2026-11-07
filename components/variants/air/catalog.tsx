"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Search, X } from "lucide-react"

import type { CatalogItem } from "@/lib/registry/catalog"
import { cn } from "@/lib/utils"
import { COMPONENT_CATEGORIES, type ComponentCategory } from "@/types/registry"

import { CATEGORY_ICONS } from "./category-icons"
import { ProductCard } from "./product-card"

const ALL = "All"

/*
 * Which cards run two columns wide so a grid never ends on a lone card.
 *
 * At three columns, a count one past a multiple of three gets two wide cards
 * (the first and the fourth, so the pattern reads A A B / C D D / E F G) and a
 * count two past gets one. At two columns an odd count widens the first. The
 * grid is `dense`, so the wide cards pull the narrow ones up around them.
 */
function wideSets(count: number) {
  const three = new Set<number>()
  const two = new Set<number>()
  if (count === 1) {
    three.add(0)
    two.add(0)
  } else {
    if (count % 3 === 1) {
      three.add(0)
      three.add(3)
    } else if (count % 3 === 2) {
      three.add(0)
    }
    if (count % 2 === 1) two.add(0)
  }
  return { three, two }
}

/*
 * The catalog, as the Apple Store's front page: a row of category icons that
 * filters the shelf below it, a search field, and a grid of white cards that
 * slide into their new places when the filter changes.
 *
 * The category lives in `?category=` like the original, so a filtered view
 * can be linked to; the search query is local, because nobody links to a
 * half-typed word.
 */
export function AirCatalog({ items }: { items: CatalogItem[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const still = useReducedMotion()
  const [query, setQuery] = React.useState("")

  const categories = React.useMemo(() => {
    const present = new Set(items.map((item) => item.category))
    return COMPONENT_CATEGORIES.filter((name) => present.has(name))
  }, [items])

  const requested = searchParams.get("category")
  const category =
    requested && (categories as readonly string[]).includes(requested)
      ? (requested as ComponentCategory)
      : ALL

  const setCategory = React.useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams)
      if (next === ALL) params.delete("category")
      else params.set("category", next)
      const search = params.toString()
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const counts = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const item of items) map.set(item.category, (map.get(item.category) ?? 0) + 1)
    return map
  }, [items])

  const filtered = React.useMemo(() => {
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

  const { three, two } = wideSets(filtered.length)
  const spring = still
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 260, damping: 32, mass: 0.9 } as const)

  return (
    <div>
      {/* The icon row. */}
      <div className="border-b border-[#d2d2d7]/70">
        <ul
          aria-label="Filter by category"
          className="air-shelf mx-auto flex max-w-[75rem] gap-2 overflow-x-auto px-3 sm:justify-center sm:gap-4"
        >
          {[ALL, ...categories].map((name) => {
            const Icon = CATEGORY_ICONS[name as ComponentCategory | "All"]
            const active = category === name
            const total = name === ALL ? items.length : (counts.get(name) ?? 0)
            return (
              <li key={name} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setCategory(name)}
                  aria-pressed={active}
                  className={cn(
                    "group relative flex w-[6.5rem] cursor-pointer flex-col items-center gap-2 rounded-xl px-2 pt-2 pb-4 text-center",
                    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0071e3]"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-[3.25rem] items-center justify-center rounded-[16px] transition-colors duration-300",
                      active
                        ? "bg-[#1d1d1f] text-white"
                        : "bg-[#f5f5f7] text-[#1d1d1f] group-hover:bg-[#e8e8ed]"
                    )}
                  >
                    <Icon aria-hidden="true" strokeWidth={1.6} className="size-6" />
                  </span>
                  <span
                    className={cn(
                      "text-[13px] leading-[1.2] tracking-[-0.008em]",
                      active ? "font-semibold text-[#1d1d1f]" : "text-[#1d1d1f]/80"
                    )}
                  >
                    {name === ALL ? "All" : name}
                    <span className="sr-only">, {total} components</span>
                  </span>
                  {active ? (
                    <motion.span
                      layoutId="air-category-rule"
                      aria-hidden="true"
                      className="absolute inset-x-5 -bottom-px h-[2px] rounded-full bg-[#1d1d1f]"
                      transition={spring}
                    />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mx-auto max-w-[75rem] px-5 pt-14 sm:pt-16">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="air-shelf-title text-[#1d1d1f]">
            {category === ALL ? "The lineup." : `${category}.`}{" "}
            <span>
              {category === ALL ? "Every component, running live." : "Running live, ready to install."}
            </span>
          </h2>
          <div className="flex shrink-0 items-center gap-3">
            <label className="flex h-11 w-full items-center gap-2.5 rounded-[12px] bg-white px-3.5 shadow-[inset_0_0_0_1px_#d2d2d7] transition-shadow focus-within:shadow-[inset_0_0_0_2px_#0071e3] sm:w-72">
              <Search aria-hidden="true" strokeWidth={1.8} className="size-4 shrink-0 text-[#6e6e73]" />
              <span className="sr-only">Search components</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search components"
                className="w-full min-w-0 bg-transparent text-[15px] tracking-[-0.01em] text-[#1d1d1f] outline-none placeholder:text-[#6e6e73] [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#86868b] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
                >
                  <X aria-hidden="true" strokeWidth={3} className="size-3" />
                </button>
              ) : null}
            </label>
          </div>
        </div>

        <p aria-live="polite" className="mt-3 text-[14px] text-[#6e6e73]">
          {filtered.length === items.length
            ? `${items.length} components`
            : `${filtered.length} of ${items.length} components`}
        </p>

        {filtered.length > 0 ? (
          <ul className="mt-8 grid grid-flow-row-dense gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false} mode="popLayout">
              {filtered.map((item, index) => (
                <motion.li
                  key={item.slug}
                  layout={still ? false : "position"}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={spring}
                  className={cn(
                    "flex",
                    two.has(index) && "sm:col-span-2",
                    three.has(index)
                      ? filtered.length === 1
                        ? "lg:col-span-3"
                        : "lg:col-span-2"
                      : two.has(index) && "lg:col-span-1"
                  )}
                >
                  <ProductCard item={item} wide={three.has(index)} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="mt-8 flex flex-col items-center rounded-[28px] bg-white px-6 py-20 text-center">
            <p className="air-h4 text-[#1d1d1f]">No components match “{query.trim()}”.</p>
            <p className="mt-3 text-[17px] text-[#6e6e73]">
              Try a different word, or look in every category.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setCategory(ALL)
              }}
              className="mt-6 cursor-pointer rounded-sm text-[17px] text-[#0066cc] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
            >
              Clear the search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/** What the catalog shows before the query string is known. */
export function AirCatalogFallback({ count }: { count: number }) {
  return (
    <div aria-hidden="true">
      <div className="h-[7.75rem] border-b border-[#d2d2d7]/70" />
      <div className="mx-auto max-w-[75rem] px-5 pt-16">
        <div className="h-10 w-80 max-w-full rounded-lg bg-[#e8e8ed]" />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: Math.min(count, 6) }, (_, index) => (
            <li key={index} className="h-[27rem] rounded-[24px] bg-white" />
          ))}
        </ul>
      </div>
    </div>
  )
}
