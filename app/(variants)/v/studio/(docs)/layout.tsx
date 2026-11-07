import type * as React from "react"

import { getNavTree } from "@/components/variants/studio/data"
import { Sidebar } from "@/components/variants/studio/sidebar"

/*
 * The documentation frame for guides and component pages: the rail lives in
 * this layout, so it stays mounted — scroll position, collapsed groups and
 * filter intact — while the reader moves from page to page.
 */
export default function StudioDocsLayout({ children }: { children: React.ReactNode }) {
  const tree = getNavTree()

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
      <aside
        aria-label="Documentation"
        data-st-scroll=""
        className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain py-8 pr-2 lg:block"
      >
        <Sidebar tree={tree} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
