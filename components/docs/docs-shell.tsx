import type * as React from "react"

import { DocsSidebar } from "@/components/docs/docs-sidebar"
import { getSidebarSections } from "@/lib/docs/sidebar"
import { cn } from "@/lib/utils"

export interface DocsShellProps {
  children: React.ReactNode
  /** Right-hand column — usually a `TableOfContents`. */
  aside?: React.ReactNode
  className?: string
}

/**
 * Three-column documentation frame: navigation, content, table of contents.
 *
 * Both side columns are `position: sticky` rather than fixed, so they scroll
 * with the page on narrow viewports and collapse out entirely below their
 * breakpoints — the mobile drawer takes over navigation from there.
 */
export function DocsShell({ children, aside, className }: DocsShellProps) {
  const sections = getSidebarSections()

  return (
    <div className={cn("mx-auto w-full max-w-[100rem] px-4 sm:px-6", className)}>
      <div className="flex gap-8 xl:gap-10">
        <aside className="hidden w-56 shrink-0 lg:block xl:w-60">
          <div className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain py-8 pr-2">
            <DocsSidebar sections={sections} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 gap-8 xl:gap-10">
          <main
            id="main-content"
            className="min-w-0 flex-1 py-8 lg:border-l lg:border-border lg:pl-8 xl:pl-10"
          >
            {children}
          </main>

          {aside ? (
            <aside className="hidden w-52 shrink-0 xl:block">
              <div className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain py-8">
                {aside}
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  )
}
