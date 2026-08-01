"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import { Command } from "cmdk"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Clock, FileText, Hash, Layers, Search } from "lucide-react"

import { Kbd } from "@/components/ui/kbd"
import { groupResults, searchIndex, type SearchEntry } from "@/lib/search"
import { cn } from "@/lib/utils"

const RECENT_KEY = "joinway-recent-searches"
const RECENT_LIMIT = 5

const GROUP_ICONS = {
  Components: Layers,
  Documentation: FileText,
  Categories: Hash,
} as const

export interface SearchCommandProps {
  /** Built on the server so the client bundle carries only what search needs. */
  index: SearchEntry[]
}

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : []
  } catch {
    return []
  }
}

/**
 * Global search: ⌘K, local scoring, grouped results and recent history.
 *
 * Filtering runs against a small index shipped with the page, so there is no
 * network request and no third-party service — search works offline and on the
 * first keystroke. cmdk's own filter is disabled (`shouldFilter={false}`) in
 * favour of the project's scorer, which weighs titles, tags and categories.
 */
export function SearchCommand({ index }: SearchCommandProps) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [recent, setRecent] = React.useState<string[]>([])

  // Reading history is a side effect of *opening*, so it belongs in the
  // handlers rather than in an effect that watches `open`.
  const changeOpen = React.useCallback((next: boolean) => {
    setOpen(next)
    if (next) setRecent(readRecent())
    else setQuery("")
  }, [])

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isShortcut =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)
      const isSlash =
        event.key === "/" &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      if (!isShortcut && !isSlash) return
      event.preventDefault()
      changeOpen(!open)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [changeOpen, open])

  const results = React.useMemo(() => searchIndex(index, query, 14), [index, query])
  const sections = React.useMemo(() => groupResults(results), [results])

  const recentEntries = React.useMemo(
    () =>
      recent
        .map((id) => index.find((entry) => entry.id === id))
        .filter((entry): entry is SearchEntry => entry !== undefined),
    [recent, index]
  )

  const go = (entry: SearchEntry) => {
    try {
      const next = [entry.id, ...readRecent().filter((id) => id !== entry.id)].slice(
        0,
        RECENT_LIMIT
      )
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {
      // Private mode or storage disabled — history is a nicety, not a requirement.
    }
    changeOpen(false)
    router.push(entry.href)
  }

  const showRecent = query.trim().length === 0 && recentEntries.length > 0
  const showEmpty = query.trim().length > 0 && results.length === 0
  const showHint = query.trim().length === 0 && recentEntries.length === 0

  return (
    <>
      <button
        type="button"
        onClick={() => changeOpen(true)}
        className={cn(
          "group flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted-foreground",
          "transition-colors duration-[var(--duration-fast)] hover:border-border-strong hover:text-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "md:w-56 md:justify-start md:gap-2 md:px-3 lg:w-64"
        )}
      >
        <Search aria-hidden="true" className="size-4 shrink-0" />
        <span className="hidden text-sm md:inline">Search…</span>
        <span className="ml-auto hidden shrink-0 gap-0.5 md:flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
        <span className="sr-only md:hidden">Search the documentation</span>
      </button>

      <Dialog.Root open={open} onOpenChange={changeOpen}>
        <AnimatePresence>
          {open ? (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.15 }}
                  className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-[2px]"
                />
              </Dialog.Overlay>

              <Dialog.Content
                asChild
                forceMount
                aria-describedby={undefined}
                className="fixed top-[10vh] left-1/2 z-50 w-[min(38rem,calc(100vw-2rem))] -translate-x-1/2"
              >
                <motion.div
                  initial={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -8 }
                  }
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 32, mass: 0.7 }
                  }
                >
                  <Dialog.Title className="sr-only">
                    Search components and documentation
                  </Dialog.Title>

                  <Command
                    loop
                    shouldFilter={false}
                    className="overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-[var(--shadow-overlay)]"
                  >
                    <div className="flex items-center gap-2.5 border-b border-border px-4">
                      <Search
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground"
                      />
                      <Command.Input
                        autoFocus
                        value={query}
                        onValueChange={setQuery}
                        placeholder="Search components, docs and categories…"
                        className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                      <Kbd className="hidden sm:inline-flex">Esc</Kbd>
                    </div>

                    <Command.List className="max-h-[min(26rem,55vh)] overflow-y-auto overscroll-contain p-2">
                      {showEmpty ? (
                        <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
                          <p className="text-sm font-medium">
                            No results for “{query.trim()}”
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Try a category like “cards”, or a tag like “animated”.
                          </p>
                        </div>
                      ) : null}

                      {showHint ? (
                        <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
                          <p className="text-sm font-medium">Search everything</p>
                          <p className="text-xs text-muted-foreground">
                            Components, guides and categories — by name, description or
                            tag.
                          </p>
                        </div>
                      ) : null}

                      {showRecent ? (
                        <Command.Group
                          heading="Recent"
                          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[0.6875rem] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase"
                        >
                          {recentEntries.map((entry) => (
                            <ResultRow
                              key={`recent-${entry.id}`}
                              entry={entry}
                              icon={Clock}
                              onSelect={() => go(entry)}
                            />
                          ))}
                        </Command.Group>
                      ) : null}

                      {sections.map((section) => (
                        <Command.Group
                          key={section.group}
                          heading={section.group}
                          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[0.6875rem] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase"
                        >
                          {section.entries.map((entry) => (
                            <ResultRow
                              key={entry.id}
                              entry={entry}
                              icon={GROUP_ICONS[entry.group]}
                              onSelect={() => go(entry)}
                            />
                          ))}
                        </Command.Group>
                      ))}
                    </Command.List>

                    <div className="flex items-center gap-4 border-t border-border bg-muted/40 px-4 py-2 text-[0.6875rem] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Kbd>↑</Kbd>
                        <Kbd>↓</Kbd> navigate
                      </span>
                      <span className="flex items-center gap-1">
                        <Kbd>↵</Kbd> open
                      </span>
                      <span className="ml-auto hidden items-center gap-1 sm:flex">
                        <Kbd>/</Kbd> to search
                      </span>
                    </div>
                  </Command>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          ) : null}
        </AnimatePresence>
      </Dialog.Root>
    </>
  )
}

function ResultRow({
  entry,
  icon: Icon,
  onSelect,
}: {
  entry: SearchEntry
  icon: typeof Layers
  onSelect: () => void
}) {
  return (
    <Command.Item
      value={entry.id}
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm",
        "transition-colors duration-[var(--duration-instant)]",
        "data-[selected=true]:bg-muted data-[selected=true]:text-foreground"
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
        <Icon aria-hidden="true" className="size-3.5" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{entry.title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {entry.description}
        </span>
      </span>
      {entry.badge ? (
        <span className="ml-auto hidden shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground sm:inline">
          {entry.badge}
        </span>
      ) : null}
    </Command.Item>
  )
}
