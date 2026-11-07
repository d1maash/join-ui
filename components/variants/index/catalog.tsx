"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Check, LayoutGrid, Rows3, Search, SlidersHorizontal, X } from "lucide-react"

import { useStoredPreference } from "@/lib/hooks"
import { variantHref } from "@/lib/variants"
import { cn } from "@/lib/utils"
import { COMPONENT_STATUSES, COMPONENT_TRAITS, type ComponentStatus, type ComponentTrait } from "@/types/registry"

import { IxBadgeTag } from "./badge"
import { IxCell } from "./cell"
import { formatDate } from "./codes"
import type { IxItem } from "./data"

type Sort = "newest" | "az" | "updated"
type View = "grid" | "table"

const SORTS: Array<{ value: Sort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "az", label: "A–Z" },
  { value: "updated", label: "Updated" },
]

const isView = (value: string): value is View => value === "grid" || value === "table"

const STATUS_LABEL: Record<ComponentStatus, string> = {
  new: "New",
  updated: "Updated",
  stable: "Stable",
  experimental: "Experimental",
}

function hasStatus(item: IxItem, status: ComponentStatus) {
  return item.status === status || (status === "updated" && Boolean(item.updated))
}

interface Filters {
  category: string | null
  query: string
  traits: ComponentTrait[]
  statuses: ComponentStatus[]
}

function passes(item: IxItem, filters: Filters, skip?: "category" | "traits" | "statuses") {
  if (skip !== "category" && filters.category && item.category !== filters.category) return false
  if (skip !== "traits" && filters.traits.some((trait) => !item.traits.includes(trait))) return false
  if (skip !== "statuses" && filters.statuses.length > 0 && !filters.statuses.some((status) => hasStatus(item, status)))
    return false
  const needle = filters.query.trim().toLowerCase()
  if (!needle) return true
  return needle.split(/\s+/).every(
    (token) =>
      item.title.toLowerCase().includes(token) ||
      item.code.toLowerCase().includes(token) ||
      item.category.toLowerCase().includes(token) ||
      item.description.toLowerCase().includes(token) ||
      item.tags.some((tag) => tag.includes(token))
  )
}

/**
 * The catalog: a sticky facet column, a toolbar, and the results as a grid of
 * live cells or as a dense table. The category lives in the URL so links from
 * the index, the search dialog and the sidebar land pre-filtered; the rest is
 * the reader's own and stays local.
 */
export function IxCatalog({
  items,
  categories,
}: {
  items: IxItem[]
  categories: Array<{ name: string; mark: string }>
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const requested = params.get("category")
  const category = categories.some((entry) => entry.name === requested) ? requested : null

  const [query, setQuery] = React.useState("")
  const [traits, setTraits] = React.useState<ComponentTrait[]>([])
  const [statuses, setStatuses] = React.useState<ComponentStatus[]>([])
  const [sort, setSort] = React.useState<Sort>("newest")
  const [view, setView] = useStoredPreference<View>("ix-catalog-view", "grid", isView)
  const [sheet, setSheet] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null)

  const filters = React.useMemo<Filters>(
    () => ({ category, query, traits, statuses }),
    [category, query, traits, statuses]
  )

  const setCategory = React.useCallback(
    (next: string | null) => {
      const search = new URLSearchParams(params)
      if (next) search.set("category", next)
      else search.delete("category")
      const qs = search.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [params, pathname, router]
  )

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (event.key !== "/" || target?.closest("input, textarea, [contenteditable]")) return
      event.preventDefault()
      input.current?.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const results = React.useMemo(() => {
    const list = items.filter((item) => passes(item, filters))
    if (sort === "az") return [...list].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === "updated")
      return [...list].sort((a, b) => (b.updated ?? b.since).localeCompare(a.updated ?? a.since))
    return list
  }, [items, filters, sort])

  const counts = React.useMemo(() => {
    const byCategory = new Map<string, number>()
    let all = 0
    for (const item of items) {
      if (!passes(item, filters, "category")) continue
      all += 1
      byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + 1)
    }
    const byTrait = new Map<ComponentTrait, number>()
    for (const trait of COMPONENT_TRAITS) {
      byTrait.set(
        trait,
        items.filter((item) => passes(item, filters, "traits") && [...traits, trait].every((t) => item.traits.includes(t))).length
      )
    }
    const byStatus = new Map<ComponentStatus, number>()
    for (const status of COMPONENT_STATUSES) {
      byStatus.set(status, items.filter((item) => passes(item, filters, "statuses") && hasStatus(item, status)).length)
    }
    return { all, byCategory, byTrait, byStatus }
  }, [items, filters, traits])

  const activeCount = (category ? 1 : 0) + traits.length + statuses.length + (query ? 1 : 0)

  function reset() {
    setQuery("")
    setTraits([])
    setStatuses([])
    setCategory(null)
  }

  const toggle = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value]

  const facets = (
    <>
      <FacetGroup title="Category">
        <Facet
          radio
          pressed={category === null}
          onClick={() => setCategory(null)}
          label="All components"
          count={counts.all}
        />
        {categories.map((entry) => (
          <Facet
            key={entry.name}
            radio
            pressed={category === entry.name}
            onClick={() => setCategory(category === entry.name ? null : entry.name)}
            label={entry.name}
            mark={entry.mark}
            count={counts.byCategory.get(entry.name) ?? 0}
          />
        ))}
      </FacetGroup>
      <FacetGroup title="Traits">
        {COMPONENT_TRAITS.map((trait) => (
          <Facet
            key={trait}
            pressed={traits.includes(trait)}
            onClick={() => setTraits((list) => toggle(list, trait))}
            label={trait}
            count={counts.byTrait.get(trait) ?? 0}
          />
        ))}
      </FacetGroup>
      <FacetGroup title="Status">
        {COMPONENT_STATUSES.filter((status) => items.some((item) => hasStatus(item, status))).map((status) => (
          <Facet
            key={status}
            pressed={statuses.includes(status)}
            onClick={() => setStatuses((list) => toggle(list, status))}
            label={STATUS_LABEL[status]}
            count={counts.byStatus.get(status) ?? 0}
          />
        ))}
      </FacetGroup>
    </>
  )

  return (
    <div className="ix-frame ix-rule-b grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)]">
      {/* Facet column — desktop */}
      <aside aria-label="Filters" className="hidden border-r border-[var(--ix-line)] lg:block">
        <div className="ix-scroll sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto pb-24">
          {facets}
          {activeCount > 0 ? (
            <div className="px-4 pt-4">
              <button type="button" onClick={reset} className="ix-btn ix-btn-ghost !h-8 w-full !justify-start !px-3">
                <X aria-hidden="true" />
                Reset {activeCount} {activeCount === 1 ? "filter" : "filters"}
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="min-w-0">
        {/* Toolbar */}
        <div className="sticky top-14 z-20 border-b border-[var(--ix-line)] bg-[rgb(10_10_10/0.9)] backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 md:px-5">
            <label className="relative min-w-[12rem] flex-1">
              <span className="sr-only">Filter components</span>
              <Search
                aria-hidden="true"
                className="ix-fg-3 pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
              />
              <input
                ref={input}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by name, code or tag"
                className="ix-input !pr-9"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear the filter"
                  className="ix-fg-3 absolute top-1/2 right-2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[3px] hover:text-[var(--ix-fg)]"
                >
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              ) : (
                <kbd aria-hidden="true" className="ix-kbd absolute top-1/2 right-2 -translate-y-1/2">
                  /
                </kbd>
              )}
            </label>

            <button
              type="button"
              onClick={() => setSheet((value) => !value)}
              aria-expanded={sheet}
              aria-controls="ix-filter-sheet"
              className="ix-btn lg:!hidden"
            >
              <SlidersHorizontal aria-hidden="true" />
              Filters
              {traits.length + statuses.length > 0 ? (
                <span className="ix-mono ix-accent">{traits.length + statuses.length}</span>
              ) : null}
            </button>

            <div className="ix-seg" role="group" aria-label="Sort">
              {SORTS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={sort === option.value}
                  onClick={() => setSort(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="ix-seg" role="group" aria-label="View">
              <button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")} aria-label="Grid of cells">
                <LayoutGrid aria-hidden="true" />
              </button>
              <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")} aria-label="Dense table">
                <Rows3 aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Category chips — below the facet column's breakpoint */}
          <div className="ix-scroll -mt-1 flex gap-1.5 overflow-x-auto px-4 pb-3 md:px-5 lg:hidden">
            <button type="button" className="ix-chip" aria-pressed={category === null} onClick={() => setCategory(null)}>
              All <span className="ix-mono opacity-70">{counts.all}</span>
            </button>
            {categories.map((entry) => (
              <button
                key={entry.name}
                type="button"
                className="ix-chip"
                aria-pressed={category === entry.name}
                onClick={() => setCategory(category === entry.name ? null : entry.name)}
              >
                {entry.name} <span className="ix-mono opacity-70">{counts.byCategory.get(entry.name) ?? 0}</span>
              </button>
            ))}
          </div>

          {sheet ? (
            <div id="ix-filter-sheet" className="border-t border-[var(--ix-line)] lg:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2">{facets}</div>
            </div>
          ) : null}
        </div>

        <div className="ix-mono ix-fg-3 flex h-10 items-center justify-between gap-4 border-b border-[var(--ix-line)] px-4 md:px-5">
          <p aria-live="polite">
            <span className="text-[var(--ix-fg)]">{results.length}</span> of {items.length}
            {category ? <> · {category}</> : null}
          </p>
          {activeCount > 0 ? (
            <button type="button" onClick={reset} className="cursor-pointer hover:text-[var(--ix-fg)]">
              Reset
            </button>
          ) : (
            <p>{SORTS.find((option) => option.value === sort)?.label} first</p>
          )}
        </div>

        {results.length === 0 ? (
          <Empty total={items.length} onReset={reset} />
        ) : view === "grid" ? (
          <ul className="ix-cells" data-cols="3" data-narrow="">
            {results.map((item) => (
              <li key={item.id} className="flex">
                <IxCell item={item} className="w-full" />
              </li>
            ))}
          </ul>
        ) : (
          <Table items={results} />
        )}
      </div>
    </div>
  )
}

function FacetGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--ix-line)] py-3 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:[&:nth-child(odd)]:border-r-0">
      <p className="ix-mono ix-fg-3 px-4 pb-1.5 text-[0.6875rem] tracking-[0.04em] uppercase">{title}</p>
      <div role="group" aria-label={title}>
        {children}
      </div>
    </div>
  )
}

function Facet({
  label,
  count,
  mark,
  pressed,
  radio = false,
  onClick,
}: {
  label: string
  count: number
  mark?: string
  pressed: boolean
  radio?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      disabled={count === 0 && !pressed}
      className="ix-facet"
    >
      <span className="ix-facet-box" data-radio={radio ? "" : undefined}>
        {!radio && pressed ? <Check aria-hidden="true" /> : null}
      </span>
      <span className="min-w-0 flex-1 truncate first-letter:uppercase">{label}</span>
      {mark ? <span className="ix-mono ix-fg-3 hidden xl:inline">{mark}</span> : null}
      <span className={cn("ix-mono w-6 text-right", pressed ? "ix-accent" : "ix-fg-3")}>{count}</span>
    </button>
  )
}

function Empty({ total, onReset }: { total: number; onReset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 px-6 py-16 md:px-10">
      <p className="ix-mono ix-fg-3">0 / {total}</p>
      <h2 className="text-xl font-semibold tracking-[-0.02em]">Nothing in the index matches.</h2>
      <p className="ix-fg-2 max-w-md text-[0.9375rem] leading-relaxed">
        The filters rule out every component. Loosen one, or reset them and start from the whole
        library.
      </p>
      <button type="button" onClick={onReset} className="ix-btn">
        <X aria-hidden="true" />
        Reset filters
      </button>
    </div>
  )
}

function Table({ items }: { items: IxItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="ix-table min-w-[44rem]">
        <caption className="sr-only">Components</caption>
        <thead>
          <tr>
            <th scope="col" className="w-20">Code</th>
            <th scope="col">Name</th>
            <th scope="col">Category</th>
            <th scope="col">Status</th>
            <th scope="col">Deps</th>
            <th scope="col" className="text-right">Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="relative transition-colors hover:bg-white/[0.02]">
              <td className="ix-mono !text-[var(--ix-accent)]">{item.code}</td>
              <th scope="row" className="!font-normal">
                <Link
                  href={variantHref("index", `/components/${item.slug}`)}
                  className="ix-overlay font-medium text-[var(--ix-fg)]"
                >
                  {item.title}
                </Link>
                <span className="ix-fg-3 mt-0.5 line-clamp-1 block max-w-[28rem] text-[0.75rem]">
                  {item.description}
                </span>
              </th>
              <td className="whitespace-nowrap">{item.category}</td>
              <td>{item.badge ? <IxBadgeTag badge={item.badge} /> : <span className="ix-mono ix-fg-3">stable</span>}</td>
              <td className="ix-mono whitespace-nowrap">{item.deps.length > 0 ? item.deps.join(", ") : "—"}</td>
              <td className="ix-mono text-right whitespace-nowrap">{formatDate(item.updated ?? item.since)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
