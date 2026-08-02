import type * as React from "react"

import { Sidebar } from "@/components/site/sidebar"
import { getSidebarSections } from "@/lib/docs/sidebar"
import { cn } from "@/lib/utils"

/**
 * Three-column documentation layout.
 *
 * The columns are separated by real rules rather than whitespace, and each
 * side rail scrolls independently under the sticky header.
 */
export function DocsShell({
  children,
  aside,
}: {
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  const sections = getSidebarSections()

  return (
    <div className="mx-auto flex max-w-[100rem] px-4 sm:px-6">
      {sections.length > 0 ? (
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-border pr-6 lg:block">
          <Sidebar sections={sections} />
        </aside>
      ) : null}

      <main
        id="main-content"
        className={cn(
          "min-w-0 flex-1 py-10",
          sections.length > 0 && "lg:pl-8",
          aside && "xl:pr-8"
        )}
      >
        {children}
      </main>

      {aside ? (
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-52 shrink-0 overflow-y-auto border-l border-border pl-6 xl:block">
          {aside}
        </aside>
      ) : null}
    </div>
  )
}
