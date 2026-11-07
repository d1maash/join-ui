"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import { Command } from "cmdk"
import { ArrowRight, Search, X } from "lucide-react"

import { groupResults, searchIndex, type SearchEntry } from "@/lib/search"
import { cn } from "@/lib/utils"

export interface QuickLink {
  title: string
  href: string
}

/*
 * Search, as apple.com does it: the magnifier in the global nav drops a white
 * panel from the top of the window, the page behind it dims and blurs, and the
 * panel opens on a short list of quick links until something is typed. One
 * large field, no chrome around it.
 *
 * Radix owns the dialog (focus trap, Escape, scroll lock, restoring focus to
 * the magnifier) and cmdk owns the list (arrow keys, Enter). cmdk's own
 * filtering is off in favour of the ranked scorer in `lib/search`, the same
 * one the original site uses, fed with hrefs already rewritten into `/v/air`.
 */
export function AirSearch({
  index,
  quickLinks,
  open,
  onOpenChange,
}: {
  index: SearchEntry[]
  quickLinks: QuickLink[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")

  const results = React.useMemo(() => searchIndex(index, query, 10), [index, query])
  const groups = React.useMemo(() => groupResults(results), [results])
  const typing = query.trim().length > 0

  function go(href: string) {
    onOpenChange(false)
    setQuery("")
    router.push(href)
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setQuery("")
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="v-air air-overlay fixed inset-0 z-[80] bg-[rgb(232_232_237/0.45)] backdrop-blur-[10px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="v-air light air-flyout fixed inset-x-0 top-0 z-[81] max-h-[85dvh] overflow-y-auto bg-white font-sans text-[#1d1d1f] shadow-[0_24px_48px_-24px_rgb(0_0_0/0.25)]"
        >
          <Dialog.Title className="sr-only">Search Join UI</Dialog.Title>
          <Command shouldFilter={false} label="Search Join UI" loop>
            <div className="mx-auto max-w-[44rem] px-6 pt-10 pb-12 sm:px-8 sm:pt-14 sm:pb-16">
              <div className="flex items-center gap-3">
                <Search
                  aria-hidden="true"
                  strokeWidth={2}
                  className="size-6 shrink-0 text-[#86868b]"
                />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search Join UI"
                  className="h-12 w-full min-w-0 bg-transparent text-[24px] font-semibold tracking-[-0.022em] text-[#1d1d1f] outline-none placeholder:text-[#86868b] sm:text-[28px]"
                />
                <Dialog.Close
                  aria-label="Close search"
                  className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6e6e73] transition-colors hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
                >
                  <X aria-hidden="true" className="size-5" />
                </Dialog.Close>
              </div>

              <Command.List className="mt-8">
                {typing ? (
                  <Command.Empty className="py-2 text-[17px] text-[#6e6e73]">
                    No results for “{query.trim()}”. Try a component name, a category
                    or a guide.
                  </Command.Empty>
                ) : (
                  <Command.Group
                    heading="Quick Links"
                    className="[&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:text-[#6e6e73]"
                  >
                    {quickLinks.map((link) => (
                      <Command.Item
                        key={link.href}
                        value={`quick:${link.href}`}
                        onSelect={() => go(link.href)}
                        className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-[14px] text-[#1d1d1f] data-[selected=true]:bg-[#f5f5f7]"
                      >
                        <ArrowRight
                          aria-hidden="true"
                          className="size-3.5 text-[#86868b] group-data-[selected=true]:text-[#1d1d1f]"
                        />
                        {link.title}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {groups.map(({ group, entries }) => (
                  <Command.Group
                    key={group}
                    heading={group}
                    className="mb-5 [&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:text-[#6e6e73]"
                  >
                    {entries.map((entry) => (
                      <Command.Item
                        key={entry.id}
                        value={entry.id}
                        onSelect={() => go(entry.href)}
                        className={cn(
                          "group flex cursor-pointer items-baseline gap-3 rounded-xl px-3 py-2.5",
                          "data-[selected=true]:bg-[#f5f5f7]"
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[17px] font-medium tracking-[-0.012em] text-[#1d1d1f]">
                            {entry.title}
                          </span>
                          <span className="mt-0.5 block truncate text-[14px] text-[#6e6e73]">
                            {entry.description}
                          </span>
                        </span>
                        {entry.badge ? (
                          <span className="hidden shrink-0 text-[12px] text-[#6e6e73] sm:block">
                            {entry.badge}
                          </span>
                        ) : null}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
