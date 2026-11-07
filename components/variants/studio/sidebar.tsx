"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Search, X } from "lucide-react"

import { useStoredPreference } from "@/lib/hooks"
import { cn } from "@/lib/utils"

import { FlagBadge } from "./badges"
import { sh } from "./href"
import type { NavGroup, NavLink, NavTree } from "./types"

const isString = (value: string): value is string => typeof value === "string"

function useCollapsed() {
  const [stored, setStored] = useStoredPreference("joinui-studio-collapsed", "", isString)
  const collapsed = React.useMemo(() => new Set(stored.split("|").filter(Boolean)), [stored])
  const toggle = React.useCallback(
    (slug: string) => {
      const next = new Set(collapsed)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      setStored([...next].join("|"))
    },
    [collapsed, setStored]
  )
  return [collapsed, toggle] as const
}

function normalize(path: string): string {
  return path.length > 1 ? path.replace(/\/$/, "") : path
}

/**
 * The documentation rail: guides first, then every component grouped by
 * category. Groups collapse (and remember it), carry their count, and the
 * one holding the current page is always open. A filter narrows the
 * component groups in place — at a few hundred entries, typing four letters
 * beats scrolling.
 */
export function Sidebar({
  tree,
  onNavigate,
  className,
}: {
  tree: NavTree
  onNavigate?: () => void
  className?: string
}) {
  const pathname = normalize(usePathname())
  const [collapsed, toggle] = useCollapsed()
  const [filter, setFilter] = React.useState("")
  const listRef = React.useRef<HTMLDivElement>(null)

  const needle = filter.trim().toLowerCase()
  const groups = React.useMemo(() => {
    if (!needle) return tree.components
    return tree.components
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.title.toLowerCase().includes(needle)),
      }))
      .filter((group) => group.items.length > 0)
  }, [tree.components, needle])

  // Bring the current page into view inside the rail, without moving the page.
  React.useEffect(() => {
    const list = listRef.current
    const scroller = list?.closest<HTMLElement>("[data-st-scroll]")
    const current = list?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!scroller || !current) return
    const top =
      current.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
    if (top < scroller.scrollTop || top > scroller.scrollTop + scroller.clientHeight - 48) {
      scroller.scrollTop = top - scroller.clientHeight / 2
    }
  }, [pathname])

  return (
    <div ref={listRef} className={cn("flex flex-col gap-6 text-sm", className)}>
      {tree.docs.map((group) => (
        <Group key={group.slug} title={group.title}>
          {group.items.map((item) => (
            <Item key={item.key} item={item} active={pathname === item.href} onNavigate={onNavigate} />
          ))}
        </Group>
      ))}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-2">
          <Link
            href={sh("/components")}
            onClick={onNavigate}
            aria-current={pathname === sh("/components") ? "page" : undefined}
            className="rounded-sm text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            Components
          </Link>
          <span className="text-xs text-muted-foreground tabular-nums">{tree.total}</span>
        </div>

        <label className="relative mx-0.5 block">
          <span className="sr-only">Filter components</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setFilter("")
            }}
            placeholder="Filter components"
            className={cn(
              "h-8 w-full rounded-md border border-border bg-transparent pr-7 pl-8 text-[13px]",
              "placeholder:text-muted-foreground focus-visible:border-border-hover focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
              "[&::-webkit-search-cancel-button]:hidden"
            )}
          />
          {filter ? (
            <button
              type="button"
              onClick={() => setFilter("")}
              aria-label="Clear filter"
              className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-muted-foreground hover:text-foreground"
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          ) : null}
        </label>

        {groups.length === 0 ? (
          <p className="px-2 py-3 text-[13px] text-muted-foreground">
            No component matches “{filter}”.
          </p>
        ) : null}

        <div className="flex flex-col gap-1">
          {groups.map((group) => (
            <CategoryGroup
              key={group.slug}
              group={group}
              open={Boolean(needle) || !collapsed.has(group.slug) || group.items.some((item) => item.href === pathname)}
              onToggle={() => toggle(group.slug)}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">{title}</p>
      {children}
    </div>
  )
}

function CategoryGroup({
  group,
  open,
  onToggle,
  pathname,
  onNavigate,
}: {
  group: NavGroup
  open: boolean
  onToggle: () => void
  pathname: string
  onNavigate?: () => void
}) {
  const id = `st-nav-${group.slug}`
  const fresh = group.items.filter((item) => item.flag === "new").length

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className={cn(
          "group flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-left text-[13px] font-medium text-foreground",
          "transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        )}
      >
        <ChevronRight
          aria-hidden="true"
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-90"
          )}
        />
        <span className="min-w-0 flex-1 truncate">{group.title}</span>
        {!open && fresh > 0 ? (
          <span aria-label={`${fresh} new`} className="size-1.5 rounded-full bg-positive" />
        ) : null}
        <span className="text-xs font-normal text-muted-foreground tabular-nums">
          {group.items.length}
        </span>
      </button>
      <div id={id} className="st-collapse" data-open={open} inert={!open}>
        <div>
          <div className="ml-[15px] flex flex-col gap-0.5 border-l border-border py-0.5 pl-2">
            {group.items.map((item) => (
              <Item
                key={item.key}
                item={item}
                active={pathname === item.href}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Item({
  item,
  active,
  onNavigate,
}: {
  item: NavLink
  active: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-8 min-w-0 items-center gap-2 rounded-md px-2 text-[13px] transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        active
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <span className="min-w-0 flex-1 truncate">{item.title}</span>
      <FlagBadge flag={item.flag === "experimental" ? null : item.flag} size="xs" />
    </Link>
  )
}
