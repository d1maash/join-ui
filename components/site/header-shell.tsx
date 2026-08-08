"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

/**
 * The photographic masthead marks itself with this id. Any route that renders
 * one gets the clear bar and every other route keeps the solid one, so there is
 * no list of paths to maintain in here as the site grows.
 */
export const MASTHEAD_ID = "masthead"

/**
 * How far the page may scroll before the bar takes its own surface back.
 *
 * Deliberately tiny, and measured rather than guessed. What holds the nav
 * legible while the bar is clear is the gradient across the top of the
 * photograph — and that gradient scrolls away with the picture, so the window
 * has to close before it does. Sampling the brightest pixel behind the glyph
 * band, the inactive links hold 5.3:1 on a desktop crop and 6.8:1 on a phone
 * across the whole of this window; an earlier, shallower gradient was already
 * down to 4.2:1, under AA, by sixteen pixels.
 */
const CLEAR_UNTIL = 8

/**
 * Whether the bar should currently be showing the photograph through itself.
 *
 * Read straight off the document rather than mirrored into state: scroll
 * position is external, mutable, and changes faster than React renders, which
 * is the case `useSyncExternalStore` exists for.
 */
function readClear() {
  return (
    window.scrollY <= CLEAR_UNTIL && document.getElementById(MASTHEAD_ID) !== null
  )
}

/**
 * The bar itself, minus its contents.
 *
 * Split out of `SiteHeader` purely so this decision can be made on the client:
 * `SiteHeader` stays a Server Component and keeps building the search index and
 * the sidebar tree at build time, which is what keeps the registry out of the
 * client bundle. Only this shell ships.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  /*
   * Keyed to the path so a client-side navigation re-subscribes and re-reads
   * after the new page has committed — the masthead check has to run against
   * the DOM that just landed, not the one being replaced.
   */
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      window.addEventListener("scroll", onStoreChange, { passive: true })
      return () => window.removeEventListener("scroll", onStoreChange)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- identity is the point
    [pathname]
  )

  /*
   * The server has no scroll position and no DOM to query, so it answers from
   * the route. Starting solid and correcting after hydration would show a grey
   * bar flicking away over the photograph on every load of the home page.
   */
  const serverSnapshot = React.useCallback(() => pathname === "/", [pathname])

  const clear = React.useSyncExternalStore(subscribe, readClear, serverSnapshot)

  return (
    <header
      data-clear={clear || undefined}
      className={cn(
        "sticky top-0 z-40 w-full border-b",
        "transition-[background-color,border-color] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
        clear
          ? "border-transparent bg-transparent"
          : "border-border bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70"
      )}
    >
      {children}
    </header>
  )
}
