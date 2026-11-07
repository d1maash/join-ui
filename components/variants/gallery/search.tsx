"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { ArrowRight, BookOpen, CornerDownLeft, LayoutGrid, Search, Shapes } from "lucide-react"

import { groupResults, searchIndex, type SearchEntry, type SearchGroup } from "@/lib/search"
import { cn } from "@/lib/utils"

/*
 * ⌘K over components, guides and categories. The index is built on the
 * server from the registry and the docs outline, with every href already
 * rewritten into the variant, and handed down once from the layout.
 *
 * With an empty query the palette is not empty: it lists the newest
 * components and the guides, so it doubles as a jump menu.
 */

interface SearchContextValue {
  open: () => void
}

const SearchContext = React.createContext<SearchContextValue>({ open: () => {} })

export function useSearch() {
  return React.useContext(SearchContext)
}

const GROUP_ICON: Record<SearchGroup, React.ComponentType<{ className?: string }>> = {
  Components: LayoutGrid,
  Documentation: BookOpen,
  Categories: Shapes,
}

export function SearchProvider({
  index,
  children,
}: {
  index: SearchEntry[]
  children: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((previous) => !previous)
      }
      if (event.key === "/" && !open) {
        const target = event.target as HTMLElement | null
        const typing =
          target?.isContentEditable ||
          target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.tagName === "SELECT"
        if (!typing) {
          event.preventDefault()
          setOpen(true)
        }
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  const groups = React.useMemo(() => {
    if (query.trim().length === 0) {
      const components = index.filter((entry) => entry.group === "Components").slice(0, 6)
      const docs = index.filter((entry) => entry.group === "Documentation").slice(0, 4)
      return [
        { group: "Components" as const, entries: components, heading: "Newest components" },
        { group: "Documentation" as const, entries: docs, heading: "Guides" },
      ]
    }
    return groupResults(searchIndex(index, query, 24)).map((section) => ({
      ...section,
      heading: section.group,
    }))
  }, [index, query])

  const value = React.useMemo(() => ({ open: () => setOpen(true) }), [])

  function onSelect(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Search Join UI"
        shouldFilter={false}
        overlayClassName="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in"
        contentClassName={cn(
          "fixed top-[11vh] left-1/2 z-[121] w-[min(40rem,calc(100vw-1.5rem))] -translate-x-1/2",
          "overflow-hidden rounded-2xl border border-[var(--g-line-2)] bg-[#111114] text-[var(--g-ink)]",
          "shadow-[0_24px_80px_-12px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.04)]",
          "data-[state=open]:animate-pop-in"
        )}
      >
        <div className="flex items-center gap-3 border-b border-[var(--g-line)] px-4">
          <Search aria-hidden="true" className="size-4 shrink-0 text-[var(--g-ink-3)]" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search components, categories and docs…"
            className="h-14 w-full bg-transparent text-[0.9375rem] outline-none placeholder:text-[var(--g-ink-4)]"
          />
          <kbd className="g-kbd shrink-0">Esc</kbd>
        </div>

        <Command.List className="g-thin-scroll max-h-[min(26rem,60vh)] overflow-y-auto overscroll-contain p-2">
          <Command.Empty className="px-4 py-12 text-center text-sm text-[var(--g-ink-3)]">
            Nothing matches “{query}”. Try a category, a tag or a prop name.
          </Command.Empty>

          {groups.map(({ group, entries, heading }) => {
            const Icon = GROUP_ICON[group]
            return (
              <Command.Group
                key={group}
                heading={heading}
                className={cn(
                  "pb-1",
                  "[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:pb-1.5",
                  "[&_[cmdk-group-heading]]:text-[0.6875rem] [&_[cmdk-group-heading]]:font-medium",
                  "[&_[cmdk-group-heading]]:text-[var(--g-ink-4)]"
                )}
              >
                {entries.map((entry) => (
                  <Command.Item
                    key={entry.id}
                    value={entry.id}
                    onSelect={() => onSelect(entry.href)}
                    className={cn(
                      "group flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm",
                      "data-[selected=true]:bg-[var(--g-panel-3)]"
                    )}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[var(--g-line)] bg-[var(--g-panel-2)] text-[var(--g-ink-3)] group-data-[selected=true]:text-[var(--g-ink)]">
                      <Icon className="size-3.5" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium text-[var(--g-ink)]">
                        {entry.title}
                      </span>
                      <span className="truncate text-xs text-[var(--g-ink-3)]">
                        {entry.description}
                      </span>
                    </span>
                    {entry.badge ? (
                      <span className="hidden shrink-0 text-xs text-[var(--g-ink-4)] sm:inline">
                        {entry.badge}
                      </span>
                    ) : null}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-[var(--g-ink-4)] opacity-0 group-data-[selected=true]:opacity-100"
                    />
                  </Command.Item>
                ))}
              </Command.Group>
            )
          })}
        </Command.List>

        <div className="flex items-center gap-4 border-t border-[var(--g-line)] px-4 py-2.5 text-[0.6875rem] text-[var(--g-ink-4)]">
          <span className="flex items-center gap-1.5">
            <kbd className="g-kbd">↑</kbd>
            <kbd className="g-kbd">↓</kbd>
            to move
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="g-kbd">
              <CornerDownLeft aria-hidden="true" className="size-3" />
            </kbd>
            to open
          </span>
          <span className="ml-auto hidden sm:inline">
            {index.filter((entry) => entry.group === "Components").length} components indexed
          </span>
        </div>
      </Command.Dialog>
    </SearchContext.Provider>
  )
}

/** The wide field in the rail and the top bar. */
export function SearchField({ className, label = "Search" }: { className?: string; label?: string }) {
  const { open } = useSearch()
  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-[var(--g-line)] bg-[var(--g-panel)] px-2.5 text-left text-[0.8125rem] text-[var(--g-ink-3)]",
        "transition-colors duration-150 hover:border-[var(--g-line-2)] hover:text-[var(--g-ink-2)]",
        className
      )}
    >
      <Search aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      <kbd className="g-kbd">⌘K</kbd>
    </button>
  )
}

export function SearchIconButton({ className }: { className?: string }) {
  const { open } = useSearch()
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Search"
      className={cn("g-icon-btn cursor-pointer", className)}
    >
      <Search aria-hidden="true" />
    </button>
  )
}
