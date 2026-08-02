import type * as React from "react"

import { SiteFooter } from "@/components/site/footer"
import { SiteHeader, SkipToContent } from "@/components/site/header"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipToContent />
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  )
}
