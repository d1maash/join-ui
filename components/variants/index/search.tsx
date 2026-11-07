"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { CornerDownLeft, Search } from "lucide-react"

import { groupResults, searchIndex, type SearchEntry } from "@/lib/search"
import { cn } from "@/lib/utils"

import type { IxSearchEntry } from "./data"

interface SearchContextValue {
  open: () => void
  portal: HTMLElement | null
}

const SearchContext = React.createContext<SearchContextValue>({ open: () => {}, portal: null })

export function usePortal() {
  return React.useContext(SearchContext).portal
}

/**
 * ⌘K over components, guides and categories. One dialog for the variant,
 * opened from the header pill, the hero pill or the shortcut. It portals into
 * the variant's own root, so it is drawn with the variant's styles.
 */
export function IxSearchProvider({
  index,
  children,
}: {
  index: IxSearchEntry[]
  children: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [portal, setPortal] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const codes = React.useMemo(() => new Map(index.map((entry) => [entry.id, entry.code])), [index])
  const results = React.useMemo(() => searchIndex(index as SearchEntry[], query), [index, query])
  const groups = React.useMemo(() => groupResults(results), [results])

  /* With nothing typed, the dialog is a directory rather than a blank box. */
  const suggestions = React.useMemo(() => {
    const components = index.filter((entry) => entry.group === "Components").slice(0, 6)
    const docs = index.filter((entry) => entry.group === "Documentation").slice(0, 4)
    return [
      { group: "Newest components", entries: components },
      { group: "Documentation", entries: docs },
    ]
  }, [index])

  const shown = query.trim() ? groups.map((g) => ({ group: g.group as string, entries: g.entries })) : suggestions

  function go(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  const value = React.useMemo(() => ({ open: () => setOpen(true), portal }), [portal])

  return (
    <SearchContext.Provider value={value}>
      {children}
      <div ref={setPortal} />
      {portal ? (
        <Command.Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next) setQuery("")
          }}
          label="Search Join UI"
          shouldFilter={false}
          container={portal}
          overlayClassName="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-fade-in"
          contentClassName={cn(
            "fixed top-[12vh] left-1/2 z-[91] w-[min(40rem,calc(100vw-1.5rem))] -translate-x-1/2",
            "overflow-hidden rounded-[6px] border border-[var(--ix-line-2)] bg-[var(--ix-cell)]",
            "shadow-[0_24px_80px_-12px_rgb(0_0_0/0.8)] data-[state=open]:animate-pop-in"
          )}
        >
          <div className="flex h-12 items-center gap-3 border-b border-[var(--ix-line)] px-4">
            <Search aria-hidden="true" className="ix-fg-3 size-4 shrink-0" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search by name, code, tag or guide…"
              className="h-full w-full bg-transparent text-sm text-[var(--ix-fg)] outline-none placeholder:text-[var(--ix-fg-3)]"
            />
            <kbd className="ix-kbd shrink-0">esc</kbd>
          </div>

          <Command.List className="ix-scroll max-h-[min(26rem,60vh)] overflow-y-auto overscroll-contain pb-2">
            <Command.Empty className="ix-mono ix-fg-3 px-4 py-12 text-center">
              No match for “{query}”.
            </Command.Empty>

            {shown.map(({ group, entries }) => (
              <Command.Group key={group} heading={group}>
                {entries.map((entry) => {
                  const code = codes.get(entry.id)
                  return (
                    <Command.Item
                      key={entry.id}
                      value={entry.id}
                      onSelect={() => go(entry.href)}
                      className={cn(
                        "group mx-2 flex cursor-pointer items-center gap-3 rounded-[4px] px-2 py-2 text-sm",
                        "text-[var(--ix-fg-2)] data-[selected=true]:bg-white/[0.05] data-[selected=true]:text-[var(--ix-fg)]"
                      )}
                    >
                      <span className="ix-mono ix-fg-3 w-11 shrink-0 group-data-[selected=true]:text-[var(--ix-accent)]">
                        {code ?? (entry.group === "Documentation" ? "DOC" : "—")}
                      </span>
                      <span className="min-w-0 shrink-0 truncate font-medium text-[var(--ix-fg)]">
                        {entry.title}
                      </span>
                      <span className="ix-fg-3 hidden min-w-0 flex-1 truncate text-xs sm:block">
                        {entry.description}
                      </span>
                      <CornerDownLeft
                        aria-hidden="true"
                        className="ix-fg-3 ml-auto size-3.5 shrink-0 opacity-0 group-data-[selected=true]:opacity-100"
                      />
                    </Command.Item>
                  )
                })}
              </Command.Group>
            ))}
          </Command.List>

          <div className="ix-mono ix-fg-3 flex h-9 items-center gap-4 border-t border-[var(--ix-line)] px-4">
            <span className="flex items-center gap-1.5">
              <kbd className="ix-kbd">↑</kbd>
              <kbd className="ix-kbd">↓</kbd> move
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="ix-kbd">↵</kbd> open
            </span>
            <span className="ml-auto">{index.filter((entry) => entry.group === "Components").length} components indexed</span>
          </div>
        </Command.Dialog>
      ) : null}
    </SearchContext.Provider>
  )
}

/** A button that opens the dialog. */
export function IxSearchTrigger({
  variant = "pill",
  label = "Search components",
  className,
}: {
  variant?: "pill" | "icon" | "wide"
  label?: string
  className?: string
}) {
  const { open } = React.useContext(SearchContext)
  const [mac, setMac] = React.useState(true)

  React.useEffect(() => {
    // Read after hydration, so the server's "⌘" and the first client render agree.
    const id = window.requestAnimationFrame(() =>
      setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent))
    )
    return () => window.cancelAnimationFrame(id)
  }, [])

  if (variant === "icon") {
    return (
      <button type="button" onClick={open} aria-label={label} className={cn("ix-icon-btn", className)}>
        <Search aria-hidden="true" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "group flex cursor-pointer items-center gap-2 rounded-[5px] border border-[var(--ix-line-2)] bg-[var(--ix-cell)] text-[var(--ix-fg-3)]",
        "transition-colors hover:border-[var(--ix-line-3)] hover:text-[var(--ix-fg-2)]",
        variant === "wide" ? "h-10 w-full px-3 text-sm" : "h-8 px-2.5 text-[0.8125rem]",
        className
      )}
    >
      <Search aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="flex-1 truncate text-left">{label}</span>
      <span className="ml-3 flex items-center gap-0.5" aria-hidden="true">
        <kbd className="ix-kbd">{mac ? "⌘" : "Ctrl"}</kbd>
        <kbd className="ix-kbd">K</kbd>
      </span>
    </button>
  )
}
