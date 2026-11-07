import type * as React from "react"
import type { Metadata, Viewport } from "next"
import Link from "next/link"

import { GlassFooter } from "@/components/variants/glass/footer"
import { GlassNav } from "@/components/variants/glass/nav"
import { g } from "@/components/variants/glass/ui"
import { Wallpaper } from "@/components/variants/glass/wallpaper"
import { VariantSwitcherDock } from "@/components/variants/variant-switcher"
import { getSidebarSections } from "@/lib/docs/sidebar"
import { buildSearchIndex } from "@/lib/search"
import { siteConfig } from "@/lib/site"

import "./glass.css"

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Glass`,
    template: `%s — ${siteConfig.name} Glass`,
  },
  description: siteConfig.description,
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: "#eceff7",
  colorScheme: "light",
}

/*
 * The Glass variant: Liquid Glass panes floating over a living wallpaper.
 *
 * The root carries `light`, which re-declares every token for the subtree, and
 * `isolate`, so the fixed wallpaper's negative z-index stays inside it — above
 * the document background, under everything else. The search index and the
 * navigation tree are built here on the server with their hrefs rewritten into
 * the variant, so nothing the visitor clicks leaves `/v/glass`.
 */
export default function GlassLayout({ children }: { children: React.ReactNode }) {
  const search = buildSearchIndex().map((entry) => ({ ...entry, href: g(entry.href) }))
  const sections = getSidebarSections().map((section) => ({
    ...section,
    items: section.items.map((item) => ({ ...item, href: g(item.href) })),
  }))

  return (
    <div className="g-root v-glass light relative isolate flex min-h-dvh flex-col font-sans text-[#1d1d1f] antialiased">
      <Wallpaper />
      <Link
        href="#main-content"
        className="sr-only z-[130] rounded-full bg-[#0071e3] px-4 py-2 text-[14px] font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </Link>
      <GlassNav search={search} sections={sections} />
      <div className="flex-1">{children}</div>
      <GlassFooter />
      <VariantSwitcherDock current="glass" />
    </div>
  )
}
