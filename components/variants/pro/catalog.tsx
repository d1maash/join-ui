"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"

import type { CatalogItem } from "@/lib/registry/catalog"
import { cn } from "@/lib/utils"
import { COMPONENT_CATEGORIES, type ComponentTrait } from "@/types/registry"

import { SegmentedControl } from "./segmented"
import { ComponentTile } from "./tile"

const ALL = "All"

const TRAITS: Array<{ value: ComponentTrait; label: string }> = [
  { value: "animated", label: "Animated" },
  { value: "accessible", label: "Accessible" },
  { value: "zero-deps", label: "No dependencies" },
]

/*
 * The catalog, filtered the Apple way: a segmented control for the category
 * (kept in `?category=` so a filtered view can be linked), a rounded search
 * field, and a row of toggles for traits. Tiles do not re-animate as the
 * filter changes — a search box is not a slideshow.
 */
export function ProCatalog({
  items,
  accents,
}: {
  items: CatalogItem[]
  accents: Record<string, string>
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const requested = searchParams.get("category") ?? ALL

  const [traits, setTraits] = React.useState<ComponentTrait[]>([])
  const [query, setQuery] = React.useState("")

  const categories = React.useMemo(() => {
    const present = new Set(items.map((item) => item.category))
    return [ALL, ...COMPONENT_CATEGORIES.filter((name) => present.has(name))]
  }, [items])

  const category = categories.includes(requested) ? requested : ALL

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

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return items.filter((item) => {
      if (category !== ALL && item.category !== category) return false
      if (traits.some((trait) => !item.traits.includes(trait))) return false
      if (!needle) return true
      return (
        item.title.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle) ||
        item.tags.some((tag) => tag.toLowerCase().includes(needle))
      )
    })
  }, [items, category, traits, query])

  const active = category !== ALL || traits.length > 0 || query.length > 0

  function toggle(trait: ComponentTrait) {
    setTraits((current) =>
      current.includes(trait) ? current.filter((value) => value !== trait) : [...current, trait]
    )
  }

  function reset() {
    setTraits([])
    setQuery("")
    setCategory(ALL)
  }

  return (
    <div>
      <div className="flex flex-col items-center gap-5">
        <div className="pro-no-scrollbar -mx-6 flex max-w-[calc(100%+3rem)] overflow-x-auto px-6 sm:mx-0 sm:max-w-full sm:px-0">
          <SegmentedControl
            options={categories.map((name) => ({ value: name, label: name }))}
            value={category}
            onChange={setCategory}
            label="Category"
          />
        </div>

        <div className="flex w-full max-w-[40rem] flex-col items-center gap-4 sm:flex-row">
          <label className="flex h-11 w-full flex-1 items-center gap-2.5 rounded-full bg-white/[0.08] px-4 transition-shadow focus-within:shadow-[0_0_0_2px_#2997ff]">
            <Search aria-hidden="true" className="size-4 shrink-0 text-[#86868b]" />
            <span className="sr-only">Search components</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, purpose or tag"
              className="h-full w-full bg-transparent text-[16px] tracking-[-0.016em] text-[#f5f5f7] outline-none placeholder:text-[#86868b] [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear the search"
                className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/[0.16] text-[#f5f5f7] focus-visible:outline-2 focus-visible:outline-[#2997ff]"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            ) : null}
          </label>
        </div>

        <div role="group" aria-label="Traits" className="flex flex-wrap justify-center gap-2">
          {TRAITS.map((trait) => {
            const on = traits.includes(trait.value)
            return (
              <button
                key={trait.value}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(trait.value)}
                className={cn(
                  "h-8 cursor-pointer rounded-full px-4 text-[13px] font-medium tracking-[-0.005em] transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2997ff]",
                  on
                    ? "bg-[#f5f5f7] text-black"
                    : "text-[#a1a1a6] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.16)] hover:text-[#f5f5f7] hover:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.32)]"
                )}
              >
                {trait.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-12 mb-6 flex h-8 items-center justify-between gap-4">
        <p aria-live="polite" className="text-[14px] text-[#86868b]">
          {filtered.length === items.length
            ? `${items.length} components`
            : `${filtered.length} of ${items.length} components`}
        </p>
        {active ? (
          <button
            type="button"
            onClick={reset}
            className="cursor-pointer rounded-sm text-[14px] text-[#2997ff] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2997ff]"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {filtered.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <li key={item.slug} className="flex">
              <ComponentTile item={item} accent={accents[item.slug] ?? "#a1a1a6"} className="w-full" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-[30px] bg-[#161617] px-6 py-24 text-center">
          <p className="text-[24px] font-semibold tracking-[-0.025em] text-[#f5f5f7]">
            Nothing matches.
          </p>
          <p className="mt-2 text-[17px] text-[#86868b]">Try a different word, or clear the filters.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 cursor-pointer rounded-sm text-[17px] text-[#2997ff] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2997ff]"
          >
            Clear filters ›
          </button>
        </div>
      )}
    </div>
  )
}

export function ProCatalogFallback() {
  return (
    <div className="flex flex-col items-center gap-5" aria-hidden="true">
      <div className="h-[42px] w-[min(36rem,100%)] rounded-full bg-white/[0.06]" />
      <div className="h-11 w-[min(40rem,100%)] rounded-full bg-white/[0.06]" />
    </div>
  )
}
