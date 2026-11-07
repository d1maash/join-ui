"use client"

import * as React from "react"
import { AlignLeft, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

import type { TocItem } from "./types"

const OFFSET = 120

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true })
  window.addEventListener("resize", onChange)
  window.addEventListener("hashchange", onChange)
  return () => {
    window.removeEventListener("scroll", onChange)
    window.removeEventListener("resize", onChange)
    window.removeEventListener("hashchange", onChange)
  }
}

/**
 * Scroll spy: the active section is the last heading that has crossed the
 * band under the header, or the last one outright once the page bottoms out.
 * Read straight from layout on scroll, so it needs no observer bookkeeping.
 */
function useActiveId(items: TocItem[]): string | null {
  const getSnapshot = React.useCallback(() => {
    let active: string | null = items[0]?.id ?? null
    for (const item of items) {
      const element = document.getElementById(item.id)
      if (!element) continue
      if (element.getBoundingClientRect().top <= OFFSET) active = item.id
      else break
    }
    const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
    if (bottom && items.length > 0) active = items[items.length - 1]?.id ?? active
    return active
  }, [items])

  return React.useSyncExternalStore(subscribe, getSnapshot, () => items[0]?.id ?? null)
}

function TocLinks({
  items,
  active,
  onNavigate,
}: {
  items: TocItem[]
  active: string | null
  onNavigate?: () => void
}) {
  return (
    <ul className="flex flex-col border-l border-border">
      {items.map((item) => {
        const current = item.id === active
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={onNavigate}
              aria-current={current ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1 text-[13px] leading-snug transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                item.level === 3 ? "pl-6" : "pl-3",
                current
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.title}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

/** The right rail: "On this page", then whatever the page adds below it. */
export function Toc({ items, children }: { items: TocItem[]; children?: React.ReactNode }) {
  const active = useActiveId(items)
  return (
    <div className="flex flex-col gap-8">
      {items.length > 0 ? (
        <nav aria-label="On this page">
          <p className="mb-3 flex items-center gap-1.5 text-[13px] font-medium">
            <AlignLeft aria-hidden="true" className="size-3.5 text-muted-foreground" />
            On this page
          </p>
          <TocLinks items={items} active={active} />
        </nav>
      ) : null}
      {children}
    </div>
  )
}

/** Below `xl`: a sticky bar under the header that opens the same list. */
export function MobileToc({ items }: { items: TocItem[] }) {
  const active = useActiveId(items)
  const [open, setOpen] = React.useState(false)
  const current = items.find((item) => item.id === active)

  if (items.length === 0) return null

  return (
    <div
      data-st-toc-bar=""
      className="sticky top-14 z-20 -mx-4 mb-6 border-b border-border bg-background/90 px-4 backdrop-blur-md md:-mx-6 md:px-6 lg:mx-0 lg:px-0 xl:hidden"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-full cursor-pointer items-center gap-2 text-left text-[13px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <AlignLeft aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="font-medium">On this page</span>
        {current ? (
          <span className="min-w-0 truncate text-muted-foreground">
            <span aria-hidden="true" className="mx-1">
              ·
            </span>
            {current.title}
          </span>
        ) : null}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? (
        <div className="max-h-[50vh] overflow-y-auto overscroll-contain pb-4">
          <TocLinks items={items} active={active} onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  )
}
