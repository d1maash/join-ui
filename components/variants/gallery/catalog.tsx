"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"

import { GalleryCard } from "@/components/variants/gallery/card"
import { cn } from "@/lib/utils"
import {
  COMPONENT_CATEGORIES,
  COMPONENT_STATUSES,
  COMPONENT_TRAITS,
  type ComponentStatus,
  type ComponentTrait,
} from "@/types/registry"

import type { GalleryItem } from "@/components/variants/gallery/data"

/*
 * The catalog.
 * ---------------------------------------------------------------------------
 * Every component as a big live card, filtered and sorted in the client
 * against a projected list (no props tables, no source — a few hundred bytes
 * per item). Category and status live in the query string so the rail, the
 * landing tiles and the search dialog can link straight to a slice of it;
 * sort, traits and the text filter are local and reset on purpose.
 *
 * Only the options that exist are offered: a category with nothing in it, or
 * a status no component has, never becomes a chip that leads to an empty grid.
 */

type Sort = "newest" | "az" | "updated"

const SORTS: Array<{ value: Sort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "az", label: "A–Z" },
  { value: "updated", label: "Updated" },
]

const STATUS_LABEL: Record<ComponentStatus, string> = {
  new: "New",
  updated: "Updated",
  stable: "Stable",
  experimental: "Experimental",
}

const TRAIT_LABEL: Record<ComponentTrait, string> = {
  animated: "Animated",
  accessible: "Accessible",
  "zero-deps": "Zero dependencies",
}

function isStatus(value: string | null): value is ComponentStatus {
  return value !== null && (COMPONENT_STATUSES as readonly string[]).includes(value)
}

export function Catalog({ items }: { items: GalleryItem[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const categoryParam = params.get("category")
  const statusParam = params.get("status")
  const category = categoryParam && items.some((item) => item.category === categoryParam) ? categoryParam : null
  const status = isStatus(statusParam) ? statusParam : null

  const [sort, setSort] = React.useState<Sort>("newest")
  const [traits, setTraits] = React.useState<ComponentTrait[]>([])
  const [query, setQuery] = React.useState("")
  const deferredQuery = React.useDeferredValue(query)

  const setParam = React.useCallback(
    (key: "category" | "status", value: string | null) => {
      const next = new URLSearchParams(params)
      if (value === null) next.delete(key)
      else next.set(key, value)
      const search = next.toString()
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
    },
    [params, pathname, router]
  )

  const categories = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
    return COMPONENT_CATEGORIES.filter((name) => counts.has(name)).map((name) => ({
      name,
      count: counts.get(name) ?? 0,
    }))
  }, [items])

  const statuses = React.useMemo(
    () =>
      COMPONENT_STATUSES.filter((value) =>
        items.some((item) => item.status === value || (value === "updated" && item.updated))
      ),
    [items]
  )

  const filtered = React.useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase()
    const list = items.filter((item) => {
      if (category && item.category !== category) return false
      if (status) {
        const matches = status === "updated" ? item.status === "updated" || Boolean(item.updated) : item.status === status
        if (!matches) return false
      }
      if (traits.some((trait) => !item.traits.includes(trait))) return false
      if (!needle) return true
      return (
        item.title.toLowerCase().includes(needle) ||
        item.name.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle) ||
        item.category.toLowerCase().includes(needle) ||
        item.tags.some((tag) => tag.toLowerCase().includes(needle))
      )
    })
    const sorted = [...list]
    if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === "updated")
      sorted.sort((a, b) => b.touched.localeCompare(a.touched) || a.title.localeCompare(b.title))
    else sorted.sort((a, b) => b.since.localeCompare(a.since) || a.title.localeCompare(b.title))
    return sorted
  }, [items, category, status, traits, deferredQuery, sort])

  const filtering = Boolean(category || status || traits.length > 0 || query.trim())

  function clearAll() {
    setTraits([])
    setQuery("")
    router.replace(pathname, { scroll: false })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-[var(--g-top)] z-30 -mx-4 flex flex-col gap-3 border-b border-[var(--g-line)] bg-[rgb(9_9_11/0.86)] px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative flex h-9 min-w-0 flex-1 items-center sm:max-w-xs">
            <span className="sr-only">Filter components</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 size-3.5 text-[var(--g-ink-4)]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by name, tag or category"
              className="h-full w-full rounded-lg border border-[var(--g-line)] bg-[var(--g-panel)] pr-8 pl-8.5 text-[0.8125rem] text-[var(--g-ink)] outline-none placeholder:text-[var(--g-ink-4)] focus:border-[var(--g-line-3)] [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear the text filter"
                className="absolute right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-md text-[var(--g-ink-3)] hover:bg-[var(--g-panel-3)] hover:text-[var(--g-ink)]"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            ) : null}
          </label>

          <div className="ml-auto flex items-center gap-3">
            <p className="g-num hidden text-[0.8125rem] text-[var(--g-ink-3)] sm:block" aria-live="polite">
              {filtered.length} of {items.length}
            </p>
            <div
              role="radiogroup"
              aria-label="Sort components"
              className="flex h-9 items-center rounded-lg border border-[var(--g-line)] bg-[var(--g-panel)] p-0.5"
            >
              {SORTS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={sort === option.value}
                  onClick={() => setSort(option.value)}
                  className={cn(
                    "h-full cursor-pointer rounded-md px-2.5 text-[0.8125rem] font-medium transition-colors",
                    sort === option.value
                      ? "bg-[var(--g-panel-3)] text-[var(--g-ink)] shadow-[inset_0_0_0_1px_var(--g-line-2)]"
                      : "text-[var(--g-ink-3)] hover:text-[var(--g-ink)]"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="g-scroller -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Category">
          <button
            type="button"
            aria-pressed={category === null}
            onClick={() => setParam("category", null)}
            className="g-chip cursor-pointer"
          >
            All <span className="g-chip-count">{items.length}</span>
          </button>
          {categories.map((entry) => (
            <button
              key={entry.name}
              type="button"
              aria-pressed={category === entry.name}
              onClick={() => setParam("category", category === entry.name ? null : entry.name)}
              className="g-chip cursor-pointer"
            >
              {entry.name} <span className="g-chip-count">{entry.count}</span>
            </button>
          ))}
          <span aria-hidden="true" className="mx-1.5 hidden h-5 w-px self-center bg-[var(--g-line-2)] sm:block" />
          {statuses.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              onClick={() => setParam("status", status === value ? null : value)}
              className="g-chip cursor-pointer"
            >
              {value === "new" ? (
                <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--g-accent)]" />
              ) : null}
              {STATUS_LABEL[value]}
            </button>
          ))}
          {COMPONENT_TRAITS.map((trait) => {
            const active = traits.includes(trait)
            return (
              <button
                key={trait}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setTraits((current) =>
                    active ? current.filter((entry) => entry !== trait) : [...current, trait]
                  )
                }
                className="g-chip cursor-pointer"
              >
                {TRAIT_LABEL[trait]}
              </button>
            )
          })}
          {filtering ? (
            <button
              type="button"
              onClick={clearAll}
              className="g-chip cursor-pointer border-transparent text-[var(--g-ink-3)]"
            >
              <X aria-hidden="true" className="size-3.5" />
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length > 0 ? (
        <ul className="grid gap-x-5 gap-y-9 [grid-template-columns:repeat(auto-fill,minmax(min(100%,17.5rem),1fr))]">
          {filtered.map((item) => (
            <li key={item.slug} className="flex">
              <GalleryCard item={item} description className="w-full" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[var(--g-line-2)] px-6 py-20 text-center">
          <p className="text-[0.9375rem] font-medium text-[var(--g-ink)]">Nothing matches these filters</p>
          <p className="max-w-sm text-[0.875rem] text-[var(--g-ink-3)]">
            {query.trim()
              ? `No component in this slice mentions “${query.trim()}”.`
              : "No component has every trait you picked."}{" "}
            Loosen a filter, or start from everything.
          </p>
          <button type="button" onClick={clearAll} className="g-btn cursor-pointer">
            Show all {items.length}
          </button>
        </div>
      )}
    </div>
  )
}

/** What the page shows while the query string is read on the client. */
export function CatalogFallback({ count }: { count: number }) {
  return (
    <ul
      aria-hidden="true"
      className="mt-[7.5rem] grid gap-x-5 gap-y-9 [grid-template-columns:repeat(auto-fill,minmax(min(100%,17.5rem),1fr))]"
    >
      {Array.from({ length: Math.min(count, 9) }, (_, index) => (
        <li key={index} className="flex flex-col gap-3">
          <div className="g-card-thumb aspect-[4/3]">
            <span className="g-thumb-wait" />
          </div>
          <div className="h-4 w-2/5 rounded bg-[var(--g-panel-2)]" />
          <div className="h-3 w-4/5 rounded bg-[var(--g-panel)]" />
        </li>
      ))}
    </ul>
  )
}
