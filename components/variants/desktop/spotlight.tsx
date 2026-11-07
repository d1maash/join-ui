"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { FileText, Tag } from "lucide-react"

import { groupResults, searchIndex, type SearchEntry } from "@/lib/search"

import { AppIcon } from "./app-icon"
import { isComponentSlug } from "./apps"
import { useOs } from "./os"

/*
 * Spotlight.
 *
 * ⌘K (or Ctrl+K) from anywhere, or the magnifier in the menu bar. It is the
 * site search — the same ranked index the original site ships — in the shape
 * the Mac taught everyone: one large field floating over the desktop, results
 * underneath with the app's own icon beside each component.
 */
export function Spotlight({ index }: { index: SearchEntry[] }) {
  const { spotlightOpen: open, setSpotlightOpen: setOpen } = useOs()
  const router = useRouter()
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, setOpen])

  const results = React.useMemo(() => searchIndex(index, query), [index, query])
  const groups = React.useMemo(() => groupResults(results), [results])

  /* An empty field still shows something to pick: the seven apps. */
  const suggestions = React.useMemo(
    () => index.filter((entry) => entry.group === "Components").slice(0, 7),
    [index]
  )
  const shown = query.trim() ? groups : [{ group: "Components" as const, entries: suggestions }]

  function go(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) setQuery("")
      }}
      label="Spotlight search"
      shouldFilter={false}
      overlayClassName="v-desktop dark d-spot-overlay"
      contentClassName="v-desktop dark d-spot"
    >
      <div className="flex h-[58px] items-center gap-3 px-5">
        <svg viewBox="0 0 16 16" className="size-[22px] shrink-0 text-[var(--d-ink-2)]" fill="none" aria-hidden="true">
          <circle cx="6.8" cy="6.8" r="4.8" stroke="currentColor" strokeWidth="1.5" />
          <path d="m10.5 10.5 3.6 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Spotlight Search"
          className="h-full w-full bg-transparent text-[22px] font-normal tracking-[-0.015em] text-[var(--d-ink)] outline-none placeholder:text-[var(--d-ink-3)]"
        />
      </div>

      <Command.List className="max-h-[min(26rem,55vh)] overflow-y-auto overscroll-contain border-t border-[var(--d-hair)] px-2 pb-2 empty:hidden">
        <Command.Empty className="px-4 py-8 text-center text-[13px] text-[var(--d-ink-3)]">
          Nothing called “{query}” on this Mac.
        </Command.Empty>
        {shown.map(({ group, entries }) => (
          <Command.Group
            key={group}
            heading={query.trim() ? group : "Apps"}
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[var(--d-ink-3)]"
          >
            {entries.map((entry) => {
              const slug = entry.id.startsWith("component:") ? entry.id.slice(10) : null
              return (
                <Command.Item
                  key={entry.id}
                  value={entry.id}
                  onSelect={() => go(entry.href)}
                  className="d-spot-item flex h-11 cursor-default items-center gap-3 rounded-[10px] px-3 text-[14px]"
                >
                  {slug && isComponentSlug(slug) ? (
                    <AppIcon id={slug} className="size-7" />
                  ) : entry.group === "Documentation" ? (
                    <span className="grid size-7 place-items-center rounded-md bg-white/10">
                      <FileText aria-hidden="true" className="size-4" />
                    </span>
                  ) : (
                    <span className="grid size-7 place-items-center rounded-md bg-white/10">
                      <Tag aria-hidden="true" className="size-4" />
                    </span>
                  )}
                  <span className="min-w-0 shrink-0 truncate font-medium">{entry.title}</span>
                  <span className="d-spot-meta min-w-0 flex-1 truncate text-[13px] text-[var(--d-ink-3)] max-sm:hidden">
                    — {entry.description}
                  </span>
                </Command.Item>
              )
            })}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  )
}
