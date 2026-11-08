"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import { Command } from "cmdk"
import { ArrowRight, Box, CornerDownLeft, FileText, LayoutGrid, Search } from "lucide-react"

import { groupResults, searchIndex, type SearchEntry, type SearchGroup } from "@/lib/search"
import { cn } from "@/lib/utils"

const OPEN_EVENT = "studio:open-search"

/** Opens the search dialog from anywhere — a 404, an empty catalog. */
export function openSearch(query = "") {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { query } }))
}

const ICONS: Record<SearchGroup, typeof Box> = {
  Components: Box,
  Documentation: FileText,
  Categories: LayoutGrid,
}

function subscribeNothing() {
  return () => {}
}

/** "⌘" on Apple platforms, "Ctrl" elsewhere — "⌘" until hydrated. */
function useModifierKey(): string {
  return React.useSyncExternalStore(
    subscribeNothing,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl"),
    () => "⌘"
  )
}

export function SearchTrigger({
  variant = "field",
  className,
}: {
  variant?: "field" | "icon"
  className?: string
}) {
  const modifier = useModifierKey()

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => openSearch()}
        aria-label="Search"
        className={cn(
          "flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground",
          "transition-colors hover:bg-muted hover:text-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          className
        )}
      >
        <Search aria-hidden="true" className="size-4" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => openSearch()}
      className={cn(
        "group flex h-8 w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-subtle pr-1.5 pl-2.5 text-left text-[13px]",
        "text-muted-foreground transition-colors duration-150 hover:border-border-hover hover:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
    >
      <Search aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="flex-1 truncate">Search documentation…</span>
      <kbd className="pointer-events-none flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[11px] font-medium text-muted-foreground">
        <span className={modifier === "⌘" ? "text-xs" : ""}>{modifier}</span>K
      </kbd>
    </button>
  )
}

/**
 * The ⌘K dialog. One instance, mounted by the layout; every trigger asks it
 * to open through an event, so the 404 page and the empty catalog can hand it
 * the query that failed.
 *
 * With nothing typed it lists where most people go — the first guides, the
 * newest components and the categories — sliced from the index, so it stays
 * a short list however large the registry gets. Typing runs the site's own
 * ranked scorer.
 */
export function StudioSearch({ index }: { index: SearchEntry[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((previous) => !previous)
        return
      }
      if (event.key === "/" && !event.metaKey && !event.ctrlKey) {
        const target = event.target as HTMLElement | null
        const typing =
          target?.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
        if (!typing) {
          event.preventDefault()
          setOpen(true)
        }
      }
    }
    function onOpen(event: Event) {
      const detail = (event as CustomEvent<{ query?: string }>).detail
      setQuery(detail?.query ?? "")
      setOpen(true)
    }
    document.addEventListener("keydown", onKeyDown)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      window.removeEventListener(OPEN_EVENT, onOpen)
    }
  }, [])

  const groups = React.useMemo(() => {
    if (query.trim().length > 0) return groupResults(searchIndex(index, query, 16))
    const pick = (group: SearchGroup, count: number) =>
      index.filter((entry) => entry.group === group).slice(0, count)
    return [
      { group: "Documentation" as const, entries: pick("Documentation", 4) },
      { group: "Components" as const, entries: pick("Components", 6) },
      { group: "Categories" as const, entries: pick("Categories", 6) },
    ].filter((section) => section.entries.length > 0)
  }, [index, query])

  function go(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  const empty = query.trim().length === 0

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed top-[min(14vh,8rem)] left-1/2 z-50 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2",
            "overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg",
            "data-[state=open]:animate-pop-in focus:outline-none"
          )}
        >
          <Dialog.Title className="sr-only">Search Join UI</Dialog.Title>
          <Command shouldFilter={false} loop label="Search components and documentation">
            <div className="flex items-center gap-2.5 border-b border-border px-3.5">
              <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search components, guides, categories…"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="flex h-5 shrink-0 items-center rounded border border-border px-1.5 text-[11px] font-medium text-muted-foreground">
                Esc
              </kbd>
            </div>

            <Command.List className="max-h-[min(24rem,60vh)] scroll-py-2 overflow-y-auto overscroll-contain p-2">
              <Command.Empty className="px-3 py-12 text-center text-sm text-muted-foreground">
                No results for “{query}”.
              </Command.Empty>

              {groups.map(({ group, entries }) => {
                const Icon = ICONS[group]
                return (
                  <Command.Group
                    key={group}
                    heading={empty && group === "Components" ? "Newest components" : group}
                    className={cn(
                      "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5",
                      "[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
                      "[&+&]:mt-1"
                    )}
                  >
                    {entries.map((entry) => (
                      <Command.Item
                        key={entry.id}
                        value={entry.id}
                        onSelect={() => go(entry.href)}
                        className={cn(
                          "group flex h-10 cursor-pointer items-center gap-3 rounded-md px-2 text-sm",
                          "data-[selected=true]:bg-muted"
                        )}
                      >
                        <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                        <span className="shrink-0 font-medium">{entry.title}</span>
                        <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">
                          {entry.description}
                        </span>
                        {entry.badge ? (
                          <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                            {entry.badge}
                          </span>
                        ) : null}
                        <ArrowRight
                          aria-hidden="true"
                          className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-data-[selected=true]:opacity-100"
                        />
                      </Command.Item>
                    ))}
                  </Command.Group>
                )
              })}
            </Command.List>

            <div className="flex items-center gap-4 border-t border-border bg-subtle px-3.5 py-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CornerDownLeft aria-hidden="true" className="size-3" /> to open
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true">↑↓</span> to move
              </span>
              <span className="ml-auto hidden sm:inline">
                Press <kbd className="font-medium text-foreground">/</kbd> anywhere to search
              </span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
