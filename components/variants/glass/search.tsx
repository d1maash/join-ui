"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { ArrowUpRight, Search } from "lucide-react"

import { groupResults, searchIndex, type SearchEntry } from "@/lib/search"
import { cn } from "@/lib/utils"

/**
 * Site search as a sheet of glass dropped over the page.
 *
 * The index is built on the server with its hrefs already rewritten into the
 * variant, so every result stays inside `/v/glass`. With nothing typed it
 * offers quick links — the components themselves and the first guide — which
 * is what Spotlight does with an empty field, and what most visitors want.
 */
export function GlassSearch({ index }: { index: SearchEntry[] }) {
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

  const quick = React.useMemo(
    () => [
      ...index.filter((entry) => entry.group === "Components"),
      ...index.filter(
        (entry) => entry.id === "doc:installation" || entry.id === "doc:ai"
      ),
    ],
    [index]
  )

  const empty = query.trim().length === 0

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
        aria-label="Search"
        aria-keyshortcuts="Meta+K Control+K"
        className={cn(
          "flex h-9 cursor-pointer items-center gap-2 rounded-full px-2.5 text-[14px] text-[#3a3a3e] lg:px-3",
          "transition-colors duration-200 hover:bg-black/[0.05] hover:text-[#1d1d1f]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
        )}
      >
        <Search aria-hidden="true" className="size-[17px]" strokeWidth={2} />
        <span className="hidden lg:inline">Search</span>
        <kbd className="hidden h-5 items-center rounded-md bg-black/[0.06] px-1.5 font-sans text-[11px] font-medium text-[#56565b] lg:inline-flex">
          ⌘K
        </kbd>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setQuery("")
        }}
        label="Search Join UI"
        shouldFilter={false}
        loop
        overlayClassName="v-glass light fixed inset-0 z-[120] bg-[rgb(236_239_247/0.45)] backdrop-blur-[6px] data-[state=open]:animate-fade-in"
        contentClassName={cn(
          "v-glass light g-glass g-paper fixed top-[12vh] left-1/2 z-[121] w-[min(40rem,calc(100vw-1.5rem))] -translate-x-1/2",
          "overflow-hidden rounded-[28px] font-sans text-[#1d1d1f]",
          "data-[state=open]:animate-pop-in"
        )}
      >
        <div className="flex items-center gap-3 px-5">
          <Search
            aria-hidden="true"
            className="size-5 shrink-0 text-[#56565b]"
            strokeWidth={2}
          />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search components and guides"
            className="h-[60px] w-full bg-transparent text-[19px] tracking-[-0.02em] outline-none placeholder:text-[#86868b]"
          />
          <kbd className="hidden h-6 shrink-0 items-center rounded-md bg-black/[0.06] px-2 font-sans text-[11px] font-medium text-[#56565b] sm:inline-flex">
            esc
          </kbd>
        </div>

        <Command.List className="max-h-[min(26rem,60vh)] overflow-y-auto overscroll-contain border-t border-black/[0.07] px-2 pb-2">
          {empty ? (
            <Command.Group heading="Quick links" className={GROUP}>
              {quick.map((entry) => (
                <Result key={entry.id} entry={entry} onSelect={onSelect} />
              ))}
            </Command.Group>
          ) : (
            <>
              <Command.Empty className="px-4 py-12 text-center text-[15px] text-[#56565b]">
                No results for “{query}”.
              </Command.Empty>
              {groups.map(({ group, entries }) => (
                <Command.Group key={group} heading={group} className={GROUP}>
                  {entries.map((entry) => (
                    <Result key={entry.id} entry={entry} onSelect={onSelect} />
                  ))}
                </Command.Group>
              ))}
            </>
          )}
        </Command.List>
      </Command.Dialog>
    </>
  )
}

const GROUP = cn(
  "pt-2",
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5",
  "[&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[#56565b]"
)

function Result({
  entry,
  onSelect,
}: {
  entry: SearchEntry
  onSelect: (href: string) => void
}) {
  return (
    <Command.Item
      value={entry.id}
      onSelect={() => onSelect(entry.href)}
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5",
        "data-[selected=true]:bg-[#0071e3] data-[selected=true]:text-white"
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium tracking-[-0.016em]">
          {entry.title}
        </span>
        <span className="block truncate text-[13px] text-[#56565b] group-data-[selected=true]:text-white/85">
          {entry.description}
        </span>
      </span>
      {entry.badge ? (
        <span className="hidden shrink-0 text-[12px] text-[#56565b] group-data-[selected=true]:text-white/85 sm:block">
          {entry.badge}
        </span>
      ) : null}
      <ArrowUpRight
        aria-hidden="true"
        className="size-4 shrink-0 opacity-0 group-data-[selected=true]:opacity-100"
      />
    </Command.Item>
  )
}
