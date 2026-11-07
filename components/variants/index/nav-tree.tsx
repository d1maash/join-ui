"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Search, X } from "lucide-react"

import { DOCS_INDEX_SLUG } from "@/lib/docs/nav"
import { variantHref } from "@/lib/variants"
import { cn } from "@/lib/utils"

import { IxFlag } from "./badge"
import type { IxNav } from "./data"

/*
 * Below this many components every group starts open; above it only the group
 * holding the current page does, so a sidebar of three hundred entries opens
 * as a list of categories rather than as a wall.
 */
const OPEN_ALL_BELOW = 48

/**
 * The library tree: guides first, then every component grouped by category,
 * each group collapsible, with a filter on top that searches the whole tree.
 * The same tree is the desktop sidebar and the mobile sheet.
 */
export function IxNavTree({
  nav,
  onNavigate,
  scrollActiveIntoView = false,
}: {
  nav: IxNav
  onNavigate?: () => void
  scrollActiveIntoView?: boolean
}) {
  const rawPath = usePathname()
  const pathname =
    rawPath === variantHref("index", "/docs")
      ? variantHref("index", `/docs/${DOCS_INDEX_SLUG}`)
      : rawPath
  const [filter, setFilter] = React.useState("")
  const [toggled, setToggled] = React.useState<Record<string, boolean>>({})
  const listRef = React.useRef<HTMLDivElement>(null)

  const needle = filter.trim().toLowerCase()
  const match = (text: string) => text.toLowerCase().includes(needle)

  const docs = nav.docs
    .map((section) => ({
      ...section,
      items: needle ? section.items.filter((item) => match(item.title)) : section.items,
    }))
    .filter((section) => section.items.length > 0)

  const groups = nav.groups
    .map((group) => ({
      ...group,
      shown: needle
        ? group.items.filter(
            (item) => match(item.title) || match(item.code) || match(group.name)
          )
        : group.items,
    }))
    .filter((group) => group.shown.length > 0)

  const isOpen = (name: string, items: IxNav["groups"][number]["items"]) => {
    if (needle) return true
    if (name in toggled) return toggled[name]!
    if (nav.total < OPEN_ALL_BELOW) return true
    return items.some((item) => item.href === pathname)
  }

  React.useEffect(() => {
    if (!scrollActiveIntoView) return
    const active = listRef.current?.querySelector<HTMLElement>('[aria-current="page"]')
    const scroller = listRef.current?.closest<HTMLElement>("[data-ix-scroller]")
    if (!active || !scroller) return
    // Only when the current page would otherwise be out of sight.
    const box = active.getBoundingClientRect()
    const frame = scroller.getBoundingClientRect()
    if (box.bottom <= frame.bottom - 24 && box.top >= frame.top) return
    scroller.scrollTop += box.top - frame.top - frame.height / 2
  }, [pathname, scrollActiveIntoView])

  const empty = docs.length === 0 && groups.length === 0

  return (
    <div ref={listRef} className="flex flex-col pb-6">
      <div className="px-3 pt-3 pb-2">
        <label className="relative block">
          <span className="sr-only">Filter the library</span>
          <Search
            aria-hidden="true"
            className="ix-fg-3 pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          />
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={`Filter ${nav.total} components`}
            className="ix-input !h-8 !text-[0.8125rem]"
          />
          {filter ? (
            <button
              type="button"
              onClick={() => setFilter("")}
              aria-label="Clear the filter"
              className="ix-fg-3 absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[3px] hover:text-[var(--ix-fg)]"
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          ) : null}
        </label>
      </div>

      {docs.map((section) => (
        <div key={section.title} className="pt-3">
          <p className="ix-mono ix-fg-3 px-4 pb-1.5 text-[0.6875rem] tracking-[0.04em] uppercase">
            {section.title}
          </p>
          <ul>
            {section.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="ix-side-link"
                >
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  {item.label ? <IxFlag badge={item.label === "New" ? "New" : "Updated"} /> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {groups.length > 0 ? (
        <div className="mt-4 border-t border-[var(--ix-line)] pt-3">
          <div className="flex items-baseline justify-between px-4 pb-1.5">
            <p className="ix-mono ix-fg-3 text-[0.6875rem] tracking-[0.04em] uppercase">
              Components
            </p>
            <Link
              href={variantHref("index", "/components")}
              onClick={onNavigate}
              className="ix-mono ix-fg-3 text-[0.6875rem] hover:text-[var(--ix-fg)]"
            >
              {nav.total} · index
            </Link>
          </div>
          {groups.map((group) => {
            const open = isOpen(group.name, group.items)
            const id = `ix-group-${group.mark}`
            return (
              <div key={group.name}>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={id}
                  onClick={() => setToggled((state) => ({ ...state, [group.name]: !open }))}
                  className="ix-side-head"
                >
                  <ChevronDown aria-hidden="true" />
                  <span className="flex-1 truncate">{group.name}</span>
                  <span className="ix-mono ix-fg-3 font-normal">
                    {needle ? `${group.shown.length}/${group.items.length}` : group.items.length}
                  </span>
                </button>
                <ul id={id} hidden={!open}>
                  {group.shown.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={pathname === item.href ? "page" : undefined}
                        className={cn("ix-side-link !pl-5")}
                      >
                        <span className="ix-side-code">{item.code}</span>
                        <span className="min-w-0 flex-1 truncate">{item.title}</span>
                        <IxFlag badge={item.badge === "Experimental" ? null : item.badge} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      ) : null}

      {empty ? (
        <p className="ix-mono ix-fg-3 px-4 py-6">Nothing matches “{filter}”.</p>
      ) : null}
    </div>
  )
}
