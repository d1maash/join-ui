import type * as React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { SearchProvider } from "@/components/variants/gallery/search"
import { VariantSwitcherDock } from "@/components/variants/variant-switcher"
import { buildSearchIndex } from "@/lib/search"
import { siteConfig } from "@/lib/site"
import { variantHref } from "@/lib/variants"

import "./gallery.css"

/*
 * Geist for the interface and the display type, Geist Mono for anything a
 * machine would also read. Both are handed to the stylesheet as custom
 * properties on the root, so the search dialog and the toasts — portalled
 * outside this tree — set in the same faces.
 */
const sans = Geist({ subsets: ["latin"], display: "swap", variable: "--g-font-sans" })
const mono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--g-font-mono" })

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Motion-first React components`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  const index = buildSearchIndex().map((entry) => ({
    ...entry,
    href: variantHref("gallery", entry.href),
  }))

  const fonts = `:root:has(.v-gallery){--g-font-sans:${sans.style.fontFamily};--g-font-mono:${mono.style.fontFamily}}`

  return (
    <div className={`v-gallery dark ${sans.variable} ${mono.variable}`}>
      <style dangerouslySetInnerHTML={{ __html: fonts }} />
      <a href="#main-content" className="g-skip">
        Skip to content
      </a>
      <SearchProvider index={index}>{children}</SearchProvider>
      <VariantSwitcherDock current="gallery" />
    </div>
  )
}
