"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { LayoutGrid, List, Search, X } from "lucide-react"

import { ComponentCard } from "@/components/docs/component-card"
import { Button } from "@/components/ui/button"
import { useStoredPreference } from "@/lib/hooks"
import type { CatalogItem } from "@/lib/registry/catalog"
import { cn } from "@/lib/utils"
import { COMPONENT_CATEGORIES, type ComponentCategory } from "@/types/registry"

const FACETS = [
  { id: "new", label: "New" },
  { id: "updated", label: "Updated" },
  { id: "animated", label: "Animated" },
  { id: "accessible", label: "Accessible" },
] as const

type FacetId = (typeof FACETS)[number]["id"]
type Layout = "grid" | "list"

const LAYOUT_KEY = "joinway-catalog-layout"

function isLayout(value: string): value is Layout {
  return value === "grid" || value === "list"
}

function matchesFacet(item: CatalogItem, facet: FacetId): boolean {
  switch (facet) {
    case "new":
      return item.status === "new"
    case "updated":
      return item.status === "updated"
    case "animated":
      return item.traits.includes("animated")
    case "accessible":
      return item.traits.includes("accessible")
  }
}

function matchesQuery(item: CatalogItem, query: string): boolean {
  if (query.length === 0) return true
  const haystack = [
    item.title,
    item.name,
    item.description,
    item.category,
    ...item.tags,
  ]
    .join(" ")
    .toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token))
}

export interface ComponentCatalogProps {
  items: CatalogItem[]
}

/**
 * Catalog with search, category and facet filters, and a layout switch.
 *
 * Filtering runs entirely in the browser over a pre-projected list, so results
 * update on every keystroke with no request. The selected category is mirrored
 * into the query string with `replace`, which keeps deep links like
 * `/components?category=Cards` shareable without adding history entries.
 */
export function ComponentCatalog({ items }: ComponentCatalogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const categoryParam = searchParams.get("category")
  const activeCategory: ComponentCategory | "All" =
    categoryParam &&
    (COMPONENT_CATEGORIES as readonly string[]).includes(categoryParam)
      ? (categoryParam as ComponentCategory)
      : "All"

  const [query, setQuery] = React.useState("")
  const [facets, setFacets] = React.useState<FacetId[]>([])
  const [layout, changeLayout] = useStoredPreference<Layout>(
    LAYOUT_KEY,
    "grid",
    isLayout
  )
  const inputRef = React.useRef<HTMLInputElement>(null)

  const setCategory = (category: ComponentCategory | "All") => {
    const params = new URLSearchParams(searchParams.toString())
    if (category === "All") params.delete("category")
    else params.set("category", category)
    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }

  const toggleFacet = (facet: FacetId) => {
    setFacets((current) =>
      current.includes(facet)
        ? current.filter((item) => item !== facet)
        : [...current, facet]
    )
  }

  const counts = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const item of items) {
      map.set(item.category, (map.get(item.category) ?? 0) + 1)
    }
    return map
  }, [items])

  const results = React.useMemo(
    () =>
      items.filter(
        (item) =>
          (activeCategory === "All" || item.category === activeCategory) &&
          facets.every((facet) => matchesFacet(item, facet)) &&
          matchesQuery(item, query)
      ),
    [items, activeCategory, facets, query]
  )

  const filtersActive =
    query.length > 0 || facets.length > 0 || activeCategory !== "All"

  const clearAll = () => {
    setQuery("")
    setFacets([])
    setCategory("All")
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search + layout */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, description or tag…"
            aria-label="Search components"
            aria-describedby="catalog-result-count"
            className={cn(
              "h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none",
              "placeholder:text-muted-foreground",
              "transition-colors duration-[var(--duration-fast)]",
              "focus-visible:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            )}
          />
        </div>

        <div
          role="group"
          aria-label="Result layout"
          className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border bg-card p-0.5"
        >
          <Button
            variant="ghost"
            size="icon-sm"
            aria-pressed={layout === "grid"}
            aria-label="Grid layout"
            onClick={() => changeLayout("grid")}
            className={cn(layout === "grid" && "bg-muted text-foreground")}
          >
            <LayoutGrid aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-pressed={layout === "list"}
            aria-label="List layout"
            onClick={() => changeLayout("list")}
            className={cn(layout === "list" && "bg-muted text-foreground")}
          >
            <List aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="sr-only">Filter by category</h2>
        <ul className="flex flex-wrap gap-1.5">
          <li>
            <FilterChip
              pressed={activeCategory === "All"}
              onClick={() => setCategory("All")}
            >
              All
              <span className="tabular-nums opacity-60">{items.length}</span>
            </FilterChip>
          </li>
          {COMPONENT_CATEGORIES.map((category) => {
            const count = counts.get(category) ?? 0
            if (count === 0) return null
            return (
              <li key={category}>
                <FilterChip
                  pressed={activeCategory === category}
                  onClick={() => setCategory(category)}
                >
                  {category}
                  <span className="tabular-nums opacity-60">{count}</span>
                </FilterChip>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Facets */}
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="sr-only">Filter by trait</h2>
        <ul className="flex flex-wrap gap-1.5">
          {FACETS.map((facet) => (
            <li key={facet.id}>
              <FilterChip
                pressed={facets.includes(facet.id)}
                onClick={() => toggleFacet(facet.id)}
                variant="facet"
              >
                {facet.label}
              </FilterChip>
            </li>
          ))}
        </ul>

        <p
          id="catalog-result-count"
          aria-live="polite"
          className="ml-auto text-sm text-muted-foreground"
        >
          {results.length} of {items.length} components
        </p>

        {filtersActive ? (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X aria-hidden="true" />
            Clear filters
          </Button>
        ) : null}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm font-medium">No components match those filters</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try a broader term, or clear the filters to see all {items.length}{" "}
            components.
          </p>
          <Button variant="secondary" size="sm" onClick={clearAll}>
            Clear filters
          </Button>
        </div>
      ) : (
        <ul
          className={cn(
            layout === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col gap-3"
          )}
        >
          {results.map((item) => (
            <li key={item.slug} className="flex">
              <ComponentCard item={item} layout={layout} className="w-full" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FilterChip({
  pressed,
  onClick,
  children,
  variant = "category",
}: {
  pressed: boolean
  onClick: () => void
  children: React.ReactNode
  variant?: "category" | "facet"
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-[0.8125rem]",
        "transition-colors duration-[var(--duration-fast)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        pressed
          ? "border-primary/40 bg-primary-soft font-medium text-primary"
          : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
        variant === "facet" && !pressed && "bg-transparent"
      )}
    >
      {children}
    </button>
  )
}

/** Skeleton shown while the `useSearchParams` boundary resolves. */
export function ComponentCatalogFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-7 w-24 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <p className="sr-only">Loading component catalog</p>
    </div>
  )
}
