"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { ArrowRight, Box, FileText, LayoutGrid, Search } from "lucide-react"

import { groupResults, searchIndex, type SearchEntry, type SearchGroup } from "@/lib/search"
import { cn } from "@/lib/utils"

const GROUP_ICON: Record<SearchGroup, React.ComponentType<{ className?: string }>> = {
  Components: Box,
  Documentation: FileText,
  Categories: LayoutGrid,
}

/*
 * Quick links shown before anything is typed, the way Spotlight on
 * apple.com opens on a short list rather than on an empty box.
 */
function quickLinks(index: SearchEntry[]): SearchEntry[] {
  const wanted = ["doc:installation", "doc:registry-setup", "doc:ai", "doc:accessibility"]
  return wanted
    .map((id) => index.find((entry) => entry.id === id))
    .filter((entry): entry is SearchEntry => entry !== undefined)
}

export function ProSearch({
  index,
  className,
}: {
  /** Entries with their hrefs already rewritten into the variant. */
  index: SearchEntry[]
  className?: string
}) {
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
  const quick = React.useMemo(() => quickLinks(index), [index])
  const empty = query.trim().length === 0

  function go(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search Join UI"
        aria-keyshortcuts="Control+K Meta+K"
        className={cn(
          "flex h-11 w-10 cursor-pointer items-center justify-center rounded-full text-[#e8e8ed]/80",
          "transition-colors hover:text-white",
          "focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#2997ff]",
          className
        )}
      >
        <Search aria-hidden="true" className="size-[17px]" strokeWidth={1.75} />
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setQuery("")
        }}
        label="Search Join UI"
        shouldFilter={false}
        overlayClassName="fixed inset-0 z-[120] bg-black/60 backdrop-blur-[6px] data-[state=open]:animate-fade-in"
        contentClassName={cn(
          "v-pro dark fixed top-[10vh] left-1/2 z-[121] w-[min(42rem,calc(100vw-1.5rem))] -translate-x-1/2",
          "overflow-hidden rounded-[22px] bg-[rgb(28_28_30/0.92)] text-[#f5f5f7]",
          "shadow-[0_0_0_0.5px_rgb(255_255_255/0.16),0_40px_120px_rgb(0_0_0/0.7)] backdrop-blur-2xl backdrop-saturate-150",
          "data-[state=open]:animate-pop-in"
        )}
      >
        <div className="flex items-center gap-3 px-5">
          <Search aria-hidden="true" className="size-5 shrink-0 text-[#86868b]" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search components and docs"
            className="h-16 w-full bg-transparent text-[21px] tracking-[-0.02em] text-[#f5f5f7] outline-none placeholder:text-[#86868b]"
          />
          <kbd className="hidden shrink-0 rounded-md bg-white/[0.08] px-1.5 py-0.5 font-sans text-[11px] text-[#a1a1a6] sm:block">
            esc
          </kbd>
        </div>

        <Command.List className="max-h-[min(26rem,60vh)] overflow-y-auto overscroll-contain border-t border-white/[0.08] pb-2">
          {empty ? (
            <Command.Group
              heading="Quick links"
              className="px-2 pt-3 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[#86868b]"
            >
              {quick.map((entry) => (
                <Command.Item
                  key={entry.id}
                  value={entry.id}
                  onSelect={() => go(entry.href)}
                  className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-[#f5f5f7] data-[selected=true]:bg-white/[0.08]"
                >
                  <ArrowRight aria-hidden="true" className="size-4 text-[#86868b]" />
                  {entry.title}
                </Command.Item>
              ))}
            </Command.Group>
          ) : (
            <>
              <Command.Empty className="px-5 py-12 text-center text-[15px] text-[#86868b]">
                No results for “{query}”.
              </Command.Empty>
              {groups.map(({ group, entries }) => {
                const Icon = GROUP_ICON[group]
                return (
                  <Command.Group
                    key={group}
                    heading={group}
                    className="px-2 pt-3 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[#86868b]"
                  >
                    {entries.map((entry) => (
                      <Command.Item
                        key={entry.id}
                        value={entry.id}
                        onSelect={() => go(entry.href)}
                        className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 data-[selected=true]:bg-white/[0.08]"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-[#a1a1a6]">
                          <Icon className="size-4" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-[15px] font-medium text-[#f5f5f7]">
                            {entry.title}
                          </span>
                          <span className="truncate text-[13px] text-[#86868b]">
                            {entry.description}
                          </span>
                        </span>
                        {entry.badge ? (
                          <span className="hidden shrink-0 text-[12px] text-[#86868b] sm:block">
                            {entry.badge}
                          </span>
                        ) : null}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )
              })}
            </>
          )}
        </Command.List>
      </Command.Dialog>
    </>
  )
}
