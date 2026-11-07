"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { Check, Search, X } from "lucide-react"

import type { CatalogItem } from "@/lib/registry/catalog"
import { cn } from "@/lib/utils"
import { COMPONENT_CATEGORIES, COMPONENT_TRAITS, type ComponentTrait } from "@/types/registry"

import { Segmented } from "./segmented"
import { ComponentTile } from "./tile"
import { pill } from "./ui"

const ALL = "All"

const TRAIT_LABEL: Record<ComponentTrait, string> = {
  animated: "Animated",
  accessible: "Accessible",
  "zero-deps": "Zero dependencies",
}

const TILE_SPRING = { type: "spring", stiffness: 380, damping: 34, mass: 0.9 } as const

/**
 * The catalog: a toolbar of glass floating over a grid of tiles.
 *
 * The category lives in the query string, so the landing page, the search
 * sheet and a shared URL all agree on it; traits and the text filter are
 * local. When the filter changes the grid reflows on springs — tiles that
 * stay glide to their new places, the rest fade out where they stood.
 */
export function GlassCatalog({ items }: { items: CatalogItem[] }) {
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
      if (needle.length === 0) return true
      return (
        item.title.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle) ||
        item.tags.some((tag) => tag.toLowerCase().includes(needle))
      )
    })
  }, [items, category, traits, query])

  const active = category !== ALL || traits.length > 0 || query.length > 0

  function reset() {
    setTraits([])
    setQuery("")
    setCategory(ALL)
  }

  function toggleTrait(trait: ComponentTrait) {
    setTraits((current) =>
      current.includes(trait)
        ? current.filter((value) => value !== trait)
        : [...current, trait]
    )
  }

  return (
    <div>
      <div className="relative z-30 lg:sticky lg:top-[70px]">
        <div
          role="search"
          aria-label="Filter components"
          className="g-glass flex flex-col gap-2 rounded-[28px] p-2 [--g-fill:0.66] lg:flex-row lg:items-center lg:rounded-full"
        >
          <div className="-m-1 overflow-x-auto p-1 [scrollbar-width:none]">
            <Segmented
              id="g-catalog-category"
              label="Category"
              options={categories.map((name) => ({ value: name, label: name }))}
              value={category}
              onChange={setCategory}
            />
          </div>

          <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] lg:mx-0 lg:ml-auto lg:overflow-visible lg:px-0">
            {COMPONENT_TRAITS.map((trait) => {
              const on = traits.includes(trait)
              return (
                <button
                  key={trait}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTrait(trait)}
                  className={cn(
                    "flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[14px] tracking-[-0.016em] transition-colors duration-200",
                    "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3]",
                    on
                      ? "bg-[#0071e3]/[0.12] font-medium text-[#0058b8]"
                      : "text-[#3a3a3e] hover:bg-black/[0.05] hover:text-[#1d1d1f]"
                  )}
                >
                  {on ? <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} /> : null}
                  {TRAIT_LABEL[trait]}
                </button>
              )
            })}
          </div>

          <label className="g-well flex h-10 min-w-0 items-center gap-2 rounded-full px-3.5 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-[#0071e3] lg:w-60">
            <Search aria-hidden="true" className="size-4 shrink-0 text-[#56565b]" />
            <span className="sr-only">Filter by name, description or tag</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter"
              className="h-full w-full min-w-0 bg-transparent text-[15px] tracking-[-0.016em] text-[#1d1d1f] outline-none placeholder:text-[#6e6e73] [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear the filter"
                className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#86868b] text-white"
              >
                <X aria-hidden="true" className="size-3" strokeWidth={3} />
              </button>
            ) : null}
          </label>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 px-2">
        <p aria-live="polite" className="text-[15px] tracking-[-0.016em] text-[#56565b]">
          {filtered.length === items.length
            ? `${items.length} components`
            : `${filtered.length} of ${items.length} components`}
        </p>
        {active ? (
          <button type="button" onClick={reset} className={pill("plain", "sm", "text-[#0066cc]")}>
            Reset filters
          </button>
        ) : null}
      </div>

      {filtered.length > 0 ? (
        <motion.ul layout className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((item) => (
              <motion.li
                key={item.slug}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={TILE_SPRING}
              >
                <ComponentTile item={item} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="g-glass g-flat mt-4 flex flex-col items-center rounded-[34px] px-6 py-20 text-center">
          <p className="text-[28px] font-semibold tracking-[-0.028em] text-[#1d1d1f]">
            Nothing matches.
          </p>
          <p className="mt-2 text-[17px] text-[#56565b]">
            Try another word, or clear the filters.
          </p>
          <button type="button" onClick={reset} className={pill("primary", "md", "mt-7")}>
            Reset filters
          </button>
        </div>
      )}
    </div>
  )
}
