import type * as React from "react"
import type { Metadata, Viewport } from "next"
import { Geist_Mono } from "next/font/google"

import { getItems, getNavTree, getSearchIndex } from "@/components/variants/studio/data"
import { StudioFooter } from "@/components/variants/studio/footer"
import { StudioHeader } from "@/components/variants/studio/header"
import { StudioSearch } from "@/components/variants/studio/search"
import { ThemeSync } from "@/components/variants/studio/theme"
import { THEME_SCRIPT } from "@/components/variants/studio/theme-script"
import { VariantSwitcherDock } from "@/components/variants/variant-switcher"
import { siteConfig } from "@/lib/site"

import "./studio.css"

/*
 * Geist Mono for code. Its figures and punctuation sit on the same rhythm as
 * Inter's, which keeps a prop table or an install line from looking pasted in.
 */
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-studio-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Components that move, in code you own`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
}

/*
 * Studio: a calm documentation-first library. The root renders `.light` and
 * an inline script swaps it for `.dark` before paint when the reader chose
 * that, so the class on this element is the theme — `suppressHydrationWarning`
 * covers the one attribute the script may have changed.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const tree = getNavTree()
  const freshCount = getItems().filter((item) => item.flag === "new" || item.flag === "updated").length

  return (
    <div
      data-studio-root=""
      suppressHydrationWarning
      className={`v-studio light ${mono.variable} flex min-h-dvh flex-col bg-background text-foreground antialiased`}
    >
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <ThemeSync />
      <StudioHeader tree={tree} freshCount={freshCount} />
      <div className="flex-1">{children}</div>
      <StudioFooter />
      <StudioSearch index={getSearchIndex()} />
      <VariantSwitcherDock current="studio" />
    </div>
  )
}
