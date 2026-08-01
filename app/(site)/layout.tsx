import type * as React from "react"

import { DocsHeader, SkipToContent } from "@/components/docs/docs-header"
import { SiteFooter } from "@/components/docs/site-footer"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipToContent />
      <DocsHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  )
}
