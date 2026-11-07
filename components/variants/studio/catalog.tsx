"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronDown, LayoutGrid, List, PackageSearch, Search, Sparkles, X } from "lucide-react"

import { cn } from "@/lib/utils"

import { FlagBadge } from "./badges"
import { ComponentCard } from "./component-card"
import { categorySlug } from "./href"
import { openSearch } from "./search"
import type { CategoryCount, StudioItem } from "./types"

type Sort = "newest" | "updated" | "az"
type View = "grid" | "index"

interface CatalogState {
  category: string | null
  query: string
  sort: Sort
  fresh: boolean
  view: View
}

const DEFAULT_STATE: CatalogState = {
  category: null,
  query: "",
  sort: "newest",
  fresh: false,
  view: "grid",
}

const SORTS: Array<{ value: Sort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "updated", label: "Recently updated" },
  { value: "az", label: "A–Z" },
]

function readState(params: URLSearchParams, categories: CategoryCount[]): CatalogState {
  const raw = params.get("category")
  const wanted = raw ? categorySlug(raw) : null
  const category = categories.find((entry) => entry.slug === wanted)?.slug ?? null
  const sort = params.get("sort")
  return {
    category,
    query: params.get("q") ?? "",
    sort: sort === "updated" || sort === "az" ? sort : "newest",
    fresh: params.get("show") === "new",
    view: params.get("view") === "index" ? "index" : "grid",
  }
}

function writeState(state: CatalogState) {
  const params = new URLSearchParams()
  if (state.category) params.set("category", state.category)
  if (state.query.trim()) params.set("q", state.query.trim())
  if (state.sort !== "newest") params.set("sort", state.sort)
  if (state.fresh) params.set("show", "new")
  if (state.view !== "grid") params.set("view", state.view)
  const search = params.toString()
  window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`)
}

function filterItems(items: StudioItem[], state: CatalogState): StudioItem[] {
  const tokens = state.query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const filtered = items.filter((item) => {
    if (state.category && item.categorySlug !== state.category) return false
    if (state.fresh && item.flag !== "new" && item.flag !== "updated") return false
    if (tokens.length === 0) return true
    const haystack = [item.title, item.description, item.category, ...item.tags, ...item.dependencies]
      .join(" ")
      .toLowerCase()
    return tokens.every((token) => haystack.includes(token))
  })
  const sorted = [...filtered]
  if (state.sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title))
  if (state.sort === "updated") {
    sorted.sort(
      (a, b) => (b.updated ?? b.since).localeCompare(a.updated ?? a.since) || a.title.localeCompare(b.title)
    )
  }
  return sorted
}

/** Reads the filters from the URL; the URL is the only copy of them. */
export function Catalog({ items, categories }: { items: StudioItem[]; categories: CategoryCount[] }) {
  const params = useSearchParams()
  const fromUrl = React.useMemo(() => readState(new URLSearchParams(params.toString()), categories), [params, categories])
  const [query, setQuery] = React.useState(fromUrl.query)
  const state = { ...fromUrl, query }

  const update = (patch: Partial<CatalogState>) => {
    const next = { ...state, ...patch }
    if (patch.query !== undefined) setQuery(patch.query)
    writeState(next)
  }

  return <CatalogView items={items} categories={categories} state={state} onChange={update} />
}

/** The same markup with the defaults, prerendered while the URL is read. */
export function CatalogFallback({ items, categories }: { items: StudioItem[]; categories: CategoryCount[] }) {
  return <CatalogView items={items} categories={categories} state={DEFAULT_STATE} onChange={() => {}} />
}

function CatalogView({
  items,
  categories,
  state,
  onChange,
}: {
  items: StudioItem[]
  categories: CategoryCount[]
  state: CatalogState
  onChange: (patch: Partial<CatalogState>) => void
}) {
  const results = React.useMemo(() => filterItems(items, state), [items, state])
  const freshCount = items.filter((item) => item.flag === "new" || item.flag === "updated").length
  const activeCategory = categories.find((entry) => entry.slug === state.category)
  const filtered = Boolean(state.category || state.query.trim() || state.fresh)

  return (
    <>
      <div className="sticky top-14 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-3 md:px-6 xl:flex-row xl:items-center xl:gap-6">
          <div
            role="group"
            aria-label="Category"
            className="st-noscrollbar st-rail-fade -mx-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1"
          >
            <CategoryPill
              label="All"
              count={items.length}
              active={!state.category}
              onClick={() => onChange({ category: null })}
            />
            {categories.map((category) => (
              <CategoryPill
                key={category.slug}
                label={category.name}
                count={category.count}
                active={state.category === category.slug}
                onClick={() => onChange({ category: category.slug })}
              />
            ))}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <label className="relative min-w-0 flex-1 sm:w-60 sm:flex-none">
              <span className="sr-only">Search components</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={state.query}
                onChange={(event) => onChange({ query: event.target.value })}
                placeholder="Search by name, tag or package"
                className={cn(
                  "h-8 w-full rounded-md border border-border bg-background pr-7 pl-8 text-[13px]",
                  "placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                  "[&::-webkit-search-cancel-button]:hidden"
                )}
              />
              {state.query ? (
                <button
                  type="button"
                  onClick={() => onChange({ query: "" })}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-muted-foreground hover:text-foreground"
                >
                  <X aria-hidden="true" className="size-3" />
                </button>
              ) : null}
            </label>

            <button
              type="button"
              aria-pressed={state.fresh}
              onClick={() => onChange({ fresh: !state.fresh })}
              className={cn(
                "flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-[13px] font-medium transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                state.fresh
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles aria-hidden="true" className="size-3.5" />
              New & updated
              <span className={cn("tabular-nums", state.fresh ? "text-background/70" : "text-muted-foreground")}>
                {freshCount}
              </span>
            </button>

            <label className="relative">
              <span className="sr-only">Sort</span>
              <select
                value={state.sort}
                onChange={(event) => onChange({ sort: event.target.value as Sort })}
                className={cn(
                  "h-8 cursor-pointer appearance-none rounded-md border border-border bg-background pr-7 pl-2.5 text-[13px] font-medium",
                  "text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                )}
              >
                {SORTS.map((sort) => (
                  <option key={sort.value} value={sort.value}>
                    {sort.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
            </label>

            <div role="radiogroup" aria-label="View" className="flex items-center rounded-md border border-border p-0.5">
              {(
                [
                  { value: "grid", label: "Grid", icon: LayoutGrid },
                  { value: "index", label: "A–Z index", icon: List },
                ] as const
              ).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={state.view === value}
                  aria-label={label}
                  title={label}
                  onClick={() => onChange({ view: value })}
                  className={cn(
                    "flex size-[26px] cursor-pointer items-center justify-center rounded-[5px] transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-ring",
                    state.view === value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon aria-hidden="true" className="size-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-20 md:px-6">
        <div className="mb-5 flex min-h-7 flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
          <p aria-live="polite">
            {filtered ? (
              <>
                <span className="font-medium text-foreground tabular-nums">{results.length}</span> of{" "}
                {items.length} components
              </>
            ) : (
              <>
                <span className="font-medium text-foreground tabular-nums">{items.length}</span> components,{" "}
                {state.sort === "az" ? "A–Z" : state.sort === "updated" ? "recently updated first" : "newest first"}
              </>
            )}
          </p>
          {activeCategory ? (
            <FilterChip label={activeCategory.name} onClear={() => onChange({ category: null })} />
          ) : null}
          {state.fresh ? <FilterChip label="New & updated" onClear={() => onChange({ fresh: false })} /> : null}
          {state.query.trim() ? (
            <FilterChip label={`“${state.query.trim()}”`} onClear={() => onChange({ query: "" })} />
          ) : null}
          {filtered ? (
            <button
              type="button"
              onClick={() => onChange({ category: null, query: "", fresh: false })}
              className="cursor-pointer text-[13px] font-medium text-foreground underline-offset-4 hover:underline"
            >
              Clear all
            </button>
          ) : null}
        </div>

        {results.length === 0 ? (
          <EmptyState query={state.query} onClear={() => onChange({ category: null, query: "", fresh: false })} />
        ) : state.view === "grid" ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {results.map((item) => (
              <li key={item.key} className="flex">
                <ComponentCard item={item} className="w-full" />
              </li>
            ))}
          </ul>
        ) : (
          <AlphaIndex items={results} />
        )}
      </div>
    </>
  )
}

function CategoryPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      <span className="text-xs font-normal text-muted-foreground tabular-nums">{count}</span>
    </button>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-background pr-1 pl-2 text-xs font-medium text-foreground">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove ${label}`}
        className="flex size-4 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X aria-hidden="true" className="size-3" />
      </button>
    </span>
  )
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border-hover px-6 py-20 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-background shadow-xs">
        <PackageSearch aria-hidden="true" className="size-5 text-muted-foreground" />
      </span>
      <p className="mt-5 text-[15px] font-semibold">No components match</p>
      <p className="mt-1.5 max-w-sm text-sm text-pretty text-muted-foreground">
        Nothing in the registry fits these filters. Loosen them, or search the guides too — the
        answer may be in the docs.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onClear}
          className="h-8 cursor-pointer rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Clear filters
        </button>
        <button
          type="button"
          onClick={() => openSearch(query.trim())}
          className="h-8 cursor-pointer rounded-md border border-border px-3 text-[13px] font-medium hover:bg-muted"
        >
          Search everything
        </button>
      </div>
    </div>
  )
}

/** Every result in one compact, letter-grouped index — the view that still fits on a page at 300. */
function AlphaIndex({ items }: { items: StudioItem[] }) {
  const groups = React.useMemo(() => {
    const map = new Map<string, StudioItem[]>()
    for (const item of [...items].sort((a, b) => a.title.localeCompare(b.title))) {
      const first = item.title.charAt(0)
      const letter = /[a-z]/i.test(first) ? first.toUpperCase() : "#"
      map.set(letter, [...(map.get(letter) ?? []), item])
    }
    return [...map.entries()]
  }, [items])

  return (
    <div className="columns-1 gap-8 sm:columns-2 lg:columns-3 xl:columns-4">
      {groups.map(([letter, entries]) => (
        <section key={letter} aria-label={letter} className="mb-6 break-inside-avoid">
          <h2 className="mb-1.5 border-b border-border pb-1.5 text-xs font-semibold text-muted-foreground">
            {letter}
          </h2>
          <ul className="flex flex-col">
            {entries.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="group flex h-8 items-center gap-2 rounded-md px-1.5 text-[13.5px] transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="truncate font-medium">{item.title}</span>
                  <FlagBadge flag={item.flag} size="xs" />
                  <span className="ml-auto truncate pl-2 text-xs text-muted-foreground">{item.category}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
