import type * as React from "react"

import { DocsSidebar } from "@/components/variants/glass/docs-nav"
import { g } from "@/components/variants/glass/ui"
import { getSidebarSections } from "@/lib/docs/sidebar"

/*
 * The docs window: a floating sidebar inset from the left edge, the article
 * on paper beside it. The sidebar lives here rather than in the page so it
 * survives moving between guides — its scroll position and its lens both
 * carry over.
 */
export default function GlassDocsLayout({ children }: { children: React.ReactNode }) {
  const sections = getSidebarSections().map((section) => ({
    ...section,
    items: section.items.map((item) => ({ ...item, href: g(item.href) })),
  }))

  return (
    <div className="mx-auto flex max-w-[1480px] gap-5 px-3 pt-[80px] sm:px-5 lg:gap-6">
      <aside className="hidden w-[264px] shrink-0 lg:block">
        <div className="sticky top-[80px] h-[calc(100dvh-80px-88px)]">
          <DocsSidebar sections={sections} />
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
