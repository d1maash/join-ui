"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface TabPlate {
  slug: string
  no: string
  title: string
  href: string
}

/*
 * Binder tabs down the right edge: one per plate, the way a field manual is
 * thumbed open at the section you want. Each tab shows its number and pulls
 * out to its name on hover or focus; the plate you are on carries the orange
 * mark. Only where the margin is wide enough to hold them.
 */
export function IndexTabs({ plates }: { plates: TabPlate[] }) {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Plates index"
      className="fixed top-1/2 right-0 z-40 hidden -translate-y-1/2 xl:block"
    >
      <ol className="flex flex-col items-end gap-px">
        {plates.map((plate) => {
          const current = pathname === plate.href
          return (
            <li key={plate.slug}>
              <Link
                href={plate.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "group relative flex h-10 items-center justify-end overflow-hidden rounded-l-[3px] border border-r-0 border-[var(--sp-rule)] bg-[var(--sp-plate)] pr-2 pl-2",
                  "w-[30px] transition-[width,background-color] duration-300 ease-[var(--sp-ease)]",
                  "hover:w-[176px] hover:bg-[var(--sp-sheet)] focus-visible:w-[176px]",
                  current && "bg-[var(--sp-sheet)]"
                )}
              >
                <span className="pointer-events-none absolute right-9 truncate text-[13px] font-medium whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {plate.title}
                </span>
                <span
                  className={cn(
                    "sp-mono relative text-[11px] font-semibold",
                    current ? "text-[var(--sp-ink)]" : "text-[var(--sp-ink-2)]"
                  )}
                >
                  {plate.no}
                </span>
                {current ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1.5 left-0 w-[2px] bg-[var(--sp-signal)]"
                  />
                ) : null}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
