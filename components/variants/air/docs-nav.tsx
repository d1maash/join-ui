"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ListFilter, X } from "lucide-react"

import type { TocEntry } from "@/lib/mdx/source"
import { cn } from "@/lib/utils"

export interface AirSidebarSection {
  title: string
  items: Array<{ title: string; href: string; label?: string }>
}

/*
 * The documentation navigator, after Apple Developer: a quiet column of
 * sections with the current page held in a soft grey pill, and a filter field
 * that narrows the tree as you type. On a phone the same tree folds into a
 * bar under the global nav that names the page you are on.
 */
function Tree({
  sections,
  pathname,
  query,
  onNavigate,
}: {
  sections: AirSidebarSection[]
  pathname: string
  query: string
  onNavigate?: () => void
}) {
  const needle = query.trim().toLowerCase()
  const visible = sections
    .map((section) => ({
      ...section,
      items: needle
        ? section.items.filter((item) => item.title.toLowerCase().includes(needle))
        : section.items,
    }))
    .filter((section) => section.items.length > 0)

  if (visible.length === 0) {
    return <p className="px-3 py-2 text-[14px] text-[#6e6e73]">No pages match “{query.trim()}”.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      {visible.map((section) => (
        <div key={section.title}>
          <p className="px-3 pb-1.5 text-[12px] font-semibold tracking-[-0.004em] text-[#6e6e73]">
            {section.title}
          </p>
          <ul className="flex flex-col gap-px">
            {section.items.map((item) => {
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-[8px] px-3 py-[0.4375rem] text-[14px] leading-[1.3] tracking-[-0.01em] transition-colors",
                      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0071e3]",
                      active
                        ? "bg-[#e8e8ed] font-semibold text-[#1d1d1f]"
                        : "text-[#1d1d1f]/80 hover:bg-[#f0f0f2] hover:text-[#1d1d1f]"
                    )}
                  >
                    <span className="min-w-0 truncate">{item.title}</span>
                    {item.label ? (
                      <span className="shrink-0 text-[11px] font-semibold text-[#b64400]">
                        {item.label}
                      </span>
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

function Filter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex h-9 items-center gap-2 rounded-[10px] bg-white px-2.5 shadow-[inset_0_0_0_1px_#d2d2d7] focus-within:shadow-[inset_0_0_0_2px_#0071e3]">
      <ListFilter aria-hidden="true" strokeWidth={1.8} className="size-4 shrink-0 text-[#6e6e73]" />
      <span className="sr-only">Filter the documentation</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Filter"
        className="w-full min-w-0 bg-transparent text-[14px] text-[#1d1d1f] outline-none placeholder:text-[#6e6e73] [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear the filter"
          className="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#86868b] text-white"
        >
          <X aria-hidden="true" strokeWidth={3} className="size-2.5" />
        </button>
      ) : null}
    </label>
  )
}

export function AirDocsSidebar({ sections }: { sections: AirSidebarSection[] }) {
  const pathname = usePathname()
  const [query, setQuery] = React.useState("")
  return (
    <nav aria-label="Documentation" className="flex flex-col gap-5 px-4 pt-8 pb-28">
      <Filter value={query} onChange={setQuery} />
      <Tree sections={sections} pathname={pathname} query={query} />
    </nav>
  )
}

/** The phone version: a bar naming the current page that opens the tree. */
export function AirDocsMobileBar({
  sections,
  current,
}: {
  sections: AirSidebarSection[]
  current: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const panelId = React.useId()

  React.useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div className="air-frost sticky top-12 z-30 border-b border-[rgb(0_0_0/0.08)] lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex h-12 w-full cursor-pointer items-center justify-between gap-3 px-5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0071e3]"
      >
        <span className="min-w-0">
          <span className="sr-only">Documentation menu, current page: </span>
          <span className="block truncate text-[15px] font-semibold tracking-[-0.016em] text-[#1d1d1f]">
            {current}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={2}
          className={cn("size-4 shrink-0 transition-transform duration-300", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className="air-flyout max-h-[70dvh] overflow-y-auto border-t border-[rgb(0_0_0/0.06)] bg-white px-3 pt-4 pb-6"
          data-state="open"
        >
          <div className="px-1 pb-4">
            <Filter value={query} onChange={setQuery} />
          </div>
          <Tree
            sections={sections}
            pathname={pathname}
            query={query}
            onNavigate={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  )
}

export function AirToc({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = React.useState<string | null>(null)

  React.useEffect(() => {
    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((element): element is HTMLElement => element !== null)
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      (observed) => {
        const visible = observed
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-72px 0px -66% 0px", threshold: 0 }
    )
    headings.forEach((heading) => observer.observe(heading))
    return () => observer.disconnect()
  }, [entries])

  if (entries.length === 0) return null

  return (
    <nav aria-label="On this page" className="pt-10 pb-28">
      <p className="mb-3 text-[12px] font-semibold text-[#1d1d1f]">On this page</p>
      <ul className="flex flex-col gap-0.5 border-l border-[#e8e8ed]">
        {entries.map((entry) => {
          const current = active === entry.id
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-1 text-[13px] leading-[1.35] tracking-[-0.006em] transition-colors",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0071e3]",
                  entry.level === 3 ? "pl-6" : "pl-3",
                  current
                    ? "border-[#1d1d1f] font-semibold text-[#1d1d1f]"
                    : "border-transparent text-[#6e6e73] hover:text-[#1d1d1f]"
                )}
              >
                {entry.title}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
