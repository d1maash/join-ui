"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, Search } from "lucide-react"

import { useSearch } from "@/components/site/search"
import { searchIndex } from "@/lib/search"

/*
 * Search, inline, on the 404. It starts from the words in the address that
 * failed — `/components/approval-gat` already finds Approval Gate — and
 * falls back to an empty field when those words match nothing.
 */
export function NotFoundSearch() {
  const pathname = usePathname()
  const { index } = useSearch()

  const guess = React.useMemo(() => {
    const last = pathname.split("/").filter(Boolean).pop() ?? ""
    const words = decodeURIComponent(last).replace(/[-_]+/g, " ").trim()
    if (!words || words === "gallery") return ""
    if (searchIndex(index, words, 1).length > 0) return words
    const prefix = words
      .split(" ")
      .map((word) => word.slice(0, Math.max(3, word.length - 2)))
      .join(" ")
    return searchIndex(index, prefix, 1).length > 0 ? prefix : ""
  }, [index, pathname])

  const [query, setQuery] = React.useState<string | null>(null)
  const value = query ?? guess
  const results = React.useMemo(() => searchIndex(index, value, 6), [index, value])

  return (
    <div className="w-full max-w-xl">
      <label className="relative flex h-12 items-center">
        <span className="sr-only">Search the library</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 size-4 text-[var(--g-ink-4)]"
        />
        <input
          type="search"
          value={value}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search components, categories and guides"
          className="h-full w-full rounded-xl border border-[var(--g-line-2)] bg-[var(--g-panel)] pr-4 pl-11 text-[0.9375rem] text-[var(--g-ink)] outline-none placeholder:text-[var(--g-ink-4)] focus:border-[var(--g-line-3)] [&::-webkit-search-cancel-button]:hidden"
        />
      </label>
      {value.trim() ? (
        results.length > 0 ? (
          <ul className="mt-2 overflow-hidden rounded-xl border border-[var(--g-line)] bg-[var(--g-panel)]">
            {results.map((entry) => (
              <li
                key={entry.id}
                className="border-b border-[var(--g-line)] last:border-b-0"
              >
                <Link
                  href={entry.href}
                  className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--g-panel-3)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.875rem] font-medium text-[var(--g-ink)]">
                      {entry.title}
                    </span>
                    <span className="block truncate text-[0.75rem] text-[var(--g-ink-3)]">
                      {entry.description}
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-[0.75rem] text-[var(--g-ink-4)] sm:inline">
                    {entry.badge ?? entry.group}
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-[var(--g-ink-4)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--g-ink)]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[0.8125rem] text-[var(--g-ink-3)]">
            Nothing matches “{value.trim()}”.
          </p>
        )
      ) : null}
    </div>
  )
}
