"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { Search } from "lucide-react"

import { Kbd } from "@/components/ui/kbd"
import { groupResults, searchIndex, type SearchEntry } from "@/lib/search"
import { cn } from "@/lib/utils"

/**
 * Site search.
 *
 * The index is built at request time on the server and passed in as a prop, so
 * the client never imports the registry. cmdk's own filtering is disabled
 * (`shouldFilter={false}`) in favour of the ranked scorer in `lib/search`.
 */
export function SearchCommand({ index }: { index: SearchEntry[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((previous) => !previous)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const results = React.useMemo(() => searchIndex(index, query), [index, query])
  const groups = React.useMemo(() => groupResults(results), [results])

  function onSelect(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-8 cursor-pointer items-center gap-2 border border-border px-2.5 text-sm",
          "text-muted-foreground transition-colors duration-[var(--duration-fast)]",
          "hover:border-foreground hover:text-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        )}
      >
        <Search aria-hidden="true" className="size-3.5" />
        <span className="hidden sm:inline">Search</span>
        <Kbd className="ml-2 hidden sm:inline-flex">⌘K</Kbd>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Search Joinway UI"
        shouldFilter={false}
        // cmdk renders its own portal + overlay; both are styled here so the
        // dialog matches the rest of the square, hairline system.
        overlayClassName="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-[2px] data-[state=open]:animate-fade-in"
        contentClassName={cn(
          "fixed top-[12vh] left-1/2 z-50 w-[min(38rem,calc(100vw-2rem))] -translate-x-1/2",
          "border border-foreground bg-background data-[state=open]:animate-fade-in"
        )}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search components and documentation…"
            className={cn(
              "h-12 w-full bg-transparent text-sm outline-none",
              "placeholder:text-muted-foreground"
            )}
          />
          <Kbd className="shrink-0">ESC</Kbd>
        </div>

        <Command.List className="max-h-[22rem] overflow-y-auto overscroll-contain">
          <Command.Empty className="px-4 py-10 text-center text-sm text-muted-foreground">
            {query.trim().length === 0
              ? "Type to search the registry and the guides."
              : `No results for “${query}”.`}
          </Command.Empty>

          {groups.map(({ group, entries }) => (
            <Command.Group
              key={group}
              heading={group}
              className={cn(
                "border-b border-border last:border-b-0",
                "[&_[cmdk-group-heading]]:label-caps [&_[cmdk-group-heading]]:px-4",
                "[&_[cmdk-group-heading]]:pt-4 [&_[cmdk-group-heading]]:pb-2",
                "[&_[cmdk-group-heading]]:text-muted-foreground"
              )}
            >
              {entries.map((entry) => (
                <Command.Item
                  key={entry.id}
                  value={entry.id}
                  onSelect={() => onSelect(entry.href)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm",
                    "data-[selected=true]:bg-foreground data-[selected=true]:text-background"
                  )}
                >
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {entry.title}
                  </span>
                  <span className="hidden min-w-0 flex-1 truncate text-xs text-muted-foreground data-[selected=true]:text-background sm:block">
                    {entry.description}
                  </span>
                  {entry.badge ? (
                    <span className="label-caps shrink-0 text-muted-foreground">
                      {entry.badge}
                    </span>
                  ) : null}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command.Dialog>
    </>
  )
}
