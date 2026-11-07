"use client"

import { usePathname } from "next/navigation"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

import { openSearch } from "./search"

/** The path that missed, and a search field seeded with its last segment. */
export function NotFoundSearch({ className }: { className?: string }) {
  const pathname = usePathname()
  const guess = decodeURIComponent(pathname.split("/").filter(Boolean).pop() ?? "")
    .replace(/[-_]+/g, " ")
    .trim()
  const seed = guess === "studio" ? "" : guess

  return (
    <div className={cn("flex w-full flex-col items-center gap-3", className)}>
      <p className="max-w-full truncate font-mono text-[12.5px] text-muted-foreground">{pathname}</p>
      <button
        type="button"
        onClick={() => openSearch(seed)}
        className={cn(
          "flex h-11 w-full max-w-md cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-background px-3.5 text-left text-sm shadow-xs",
          "text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        )}
      >
        <Search aria-hidden="true" className="size-4 shrink-0" />
        <span className="flex-1 truncate">
          {seed ? (
            <>
              Search for “<span className="text-foreground">{seed}</span>”
            </>
          ) : (
            "Search components and docs…"
          )}
        </span>
        <kbd className="rounded border border-border px-1.5 text-[11px] font-medium">/</kbd>
      </button>
    </div>
  )
}
