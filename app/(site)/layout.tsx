import type * as React from "react"
import type { Metadata, Viewport } from "next"

import { SearchProvider } from "@/components/site/search"
import { buildSearchIndex } from "@/lib/search"
import { siteConfig } from "@/lib/site"

import "./site.css"

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Motion-first React components`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
}

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const index = buildSearchIndex()

  return (
    <div className="join-site dark">
      <a href="#main-content" className="g-skip">
        Skip to content
      </a>
      <SearchProvider index={index}>{children}</SearchProvider>
    </div>
  )
}
