import type * as React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { getIxNav, getIxSearchIndex } from "@/components/variants/index/data"
import { IxFooter } from "@/components/variants/index/footer"
import { IxHeader } from "@/components/variants/index/header"
import { IxSearchProvider } from "@/components/variants/index/search"
import { VariantSwitcherDock } from "@/components/variants/variant-switcher"
import { siteConfig } from "@/lib/site"

import "./index.css"

/*
 * Geist for the interface, Geist Mono for everything that is a code: index
 * codes, counts, commands, hints. Two cuts of one family, so the mono reads as
 * the same voice speaking precisely rather than as a second typeface.
 */
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-ix-sans",
  display: "swap",
})

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-ix-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Live components, installed as source`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
}

export default function IndexLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v-index dark ${sans.variable} ${mono.variable}`}>
      <a href="#main-content" className="ix-skip">
        Skip to content
      </a>
      <IxSearchProvider index={getIxSearchIndex()}>
        <IxHeader nav={getIxNav()} />
        {children}
        <IxFooter />
      </IxSearchProvider>
      <VariantSwitcherDock current="index" />
    </div>
  )
}
