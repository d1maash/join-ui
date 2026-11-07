"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { CornerDownLeft, Search } from "lucide-react"

import { groupResults, searchIndex, type SearchEntry } from "@/lib/search"
import { cn } from "@/lib/utils"

/*
 * ⌘K. The index arrives from the layout with every href already rewritten into
 * the variant, so a result never drops the reader back onto the original site.
 * With nothing typed, the seven components are the suggestions — they are
 * what people come here for.
 */
export function RunSearch({
  index,
  open,
  onOpenChange,
}: {
  index: SearchEntry[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  const results = React.useMemo(() => {
    if (query.trim().length === 0) {
      return index.filter((entry) => entry.group === "Components")
    }
    return searchIndex(index, query)
  }, [index, query])
  const groups = React.useMemo(() => groupResults(results), [results])

  function go(href: string) {
    onOpenChange(false)
    setQuery("")
    router.push(href)
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Search Join UI"
      shouldFilter={false}
      overlayClassName="run-portal run-overlay fixed inset-0 z-[150] bg-black/60 backdrop-blur-[2px]"
      contentClassName={cn(
        "run-portal run-dialog fixed top-[14vh] left-1/2 z-[151] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2",
        "overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,#161618,#0f0f11)]",
        "shadow-[0_0_0_1px_rgb(255_255_255/0.1),inset_0_1px_0_rgb(255_255_255/0.06),0_40px_100px_-20px_rgb(0_0_0/0.9)]"
      )}
    >
      <div className="flex items-center gap-3 px-4 shadow-[inset_0_-1px_0_rgb(255_255_255/0.08)]">
        <Search aria-hidden="true" className="size-4 shrink-0 text-[#8b8b90]" />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search components and docs"
          className="h-13 w-full bg-transparent text-[15px] text-[#f5f5f7] outline-none placeholder:text-[#77777c]"
        />
        <kbd className="shrink-0 rounded-[5px] bg-white/[0.07] px-1.5 py-0.5 text-[11px] text-[#8b8b90]">
          esc
        </kbd>
      </div>

      <Command.List className="max-h-[min(24rem,60vh)] overflow-y-auto overscroll-contain p-2">
        <Command.Empty className="px-3 py-10 text-center text-[14px] text-[#8b8b90]">
          Nothing matches “{query}”.
        </Command.Empty>
        {groups.map(({ group, entries }) => (
          <Command.Group
            key={group}
            heading={query.trim().length === 0 ? "The seven" : group}
            className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:text-[#77777c]"
          >
            {entries.map((entry) => (
              <Command.Item
                key={entry.id}
                value={entry.id}
                onSelect={() => go(entry.href)}
                className="run-search-item group flex h-10 cursor-pointer items-center gap-3 rounded-[8px] px-2.5 text-[14px] text-[#c7c7cc]"
              >
                <span className="shrink-0 font-medium">{entry.title}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-[#77777c]">
                  {entry.description}
                </span>
                <CornerDownLeft
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-[#77777c] opacity-0 group-data-[selected=true]:opacity-100"
                />
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  )
}
