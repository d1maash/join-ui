import type * as React from "react"

import type { IxNav } from "./data"
import { IxNavTree } from "./nav-tree"

/**
 * The reading layout, inside the frame: the library tree on the left, the
 * page in the middle, and whatever the page puts on the right (its table of
 * contents) — three columns of the same grid, divided by the same rules.
 */
export function IxDocsShell({
  nav,
  aside,
  children,
}: {
  nav: IxNav
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="ix-frame ix-rule-b grid grid-cols-1 flex-1 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_13.5rem]">
      <aside className="hidden border-r border-[var(--ix-line)] lg:block">
        <nav
          aria-label="Library"
          data-ix-scroller
          className="ix-scroll sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain"
        >
          <IxNavTree nav={nav} scrollActiveIntoView />
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
      <aside className="hidden border-l border-[var(--ix-line)] xl:block">
        <div className="ix-scroll sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto px-5 pt-8 pb-24">
          {aside}
        </div>
      </aside>
    </div>
  )
}
