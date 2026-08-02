"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"

import { ComponentCard } from "@/components/site/component-card"
import { Button } from "@/components/ui/button"
import type { CatalogItem } from "@/lib/registry/catalog"
import { cn } from "@/lib/utils"
import { COMPONENT_CATEGORIES, COMPONENT_TRAITS, type ComponentTrait } from "@/types/registry"

const ALL = "All"

/**
 * Filterable catalog.
 *
 * Filtering happens in the client against a projected `CatalogItem[]`, so it
 * is instant and needs no round trip.
 *
 * The category lives in the query string rather than in component state: the
 * home page and the search dialog link straight to `?category=`, and keeping
 * it there means those links, the back button and a shared URL all agree
 * without a synchronising effect. The remaining filters are ephemeral and stay
 * local.
 */
export function ComponentCatalog({ items }: { items: CatalogItem[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const category = searchParams.get("category") ?? ALL

  const [traits, setTraits] = React.useState<ComponentTrait[]>([])
  const [query, setQuery] = React.useState("")

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

  const categories = React.useMemo(() => {
    const present = new Set(items.map((item) => item.category))
    return [ALL, ...COMPONENT_CATEGORIES.filter((name) => present.has(name))]
  }, [items])

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return items.filter((item) => {
      if (category !== ALL && item.category !== category) return false
      if (traits.some((trait) => !item.traits.includes(trait))) return false
      if (needle.length === 0) return true
      return (
        item.title.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle) ||
        item.tags.some((tag) => tag.toLowerCase().includes(needle))
      )
    })
  }, [items, category, traits, query])

  function toggleTrait(trait: ComponentTrait) {
    setTraits((current) =>
      current.includes(trait)
        ? current.filter((value) => value !== trait)
        : [...current, trait]
    )
  }

  const filtersActive = category !== ALL || traits.length > 0 || query.length > 0

  if (items.length === 0) return <CatalogEmptyState />

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 border-y border-border py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <FilterRow label="Category">
            {categories.map((name) => (
              <FilterChip
                key={name}
                active={category === name}
                onClick={() => setCategory(name)}
              >
                {name}
              </FilterChip>
            ))}
          </FilterRow>

          <FilterRow label="Traits">
            {COMPONENT_TRAITS.map((trait) => (
              <FilterChip
                key={trait}
                active={traits.includes(trait)}
                onClick={() => toggleTrait(trait)}
              >
                {trait}
              </FilterChip>
            ))}
          </FilterRow>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 flex-1 items-center gap-2 border border-border px-3 focus-within:border-foreground">
            <Search aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by name, description or tag"
              aria-label="Filter components"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {filtersActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTraits([])
                setQuery("")
                setCategory(ALL)
              }}
            >
              <X aria-hidden="true" />
              Reset
            </Button>
          ) : null}
        </div>
      </div>

      <p aria-live="polite" className="label-caps py-4 text-muted-foreground">
        {filtered.length} of {items.length} components
      </p>

      {filtered.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item, index) => (
            <li key={item.slug} className="flex">
              <ComponentCard item={item} index={index + 1} className="w-full" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="border border-border px-6 py-16 text-center text-sm text-muted-foreground">
          Nothing matches these filters.
        </p>
      )}
    </div>
  )
}

/** Shown while the Suspense boundary resolves the query string. */
export function ComponentCatalogFallback() {
  return (
    <div className="border-y border-border py-4">
      <p className="label-caps text-muted-foreground">Loading catalog…</p>
    </div>
  )
}

/** Shown when the registry itself is empty. */
function CatalogEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 border border-border px-6 py-24 text-center">
      <p className="label-caps text-muted-foreground">Empty registry</p>
      <h2 className="text-xl font-semibold tracking-tight">No components published</h2>
      <p className="max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
        Nothing is registered yet. Add a component under{" "}
        <code className="font-mono text-foreground">registry/components/</code>, describe
        it in <code className="font-mono text-foreground">lib/registry/components.ts</code>
        , and it will appear here along with its page, search entry and installable JSON.
      </p>
    </div>
  )
}

function FilterRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="label-caps text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "label-caps h-6 cursor-pointer border px-2 transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
