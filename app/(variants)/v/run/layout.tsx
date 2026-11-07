import type * as React from "react"
import type { Metadata, Viewport } from "next"
import { Geist_Mono, Instrument_Serif } from "next/font/google"

import { RunFooter } from "@/components/variants/run/footer"
import { RunMotion } from "@/components/variants/run/motion-config"
import { RunTopBar } from "@/components/variants/run/top-bar"
import { VariantSwitcherDock } from "@/components/variants/variant-switcher"
import { componentsByName } from "@/lib/registry"
import { buildSearchIndex } from "@/lib/search"
import { siteConfig } from "@/lib/site"
import { variantHref } from "@/lib/variants"

import "./run.css"

/*
 * Inter is already the root face, with its optical-size axis, so display type
 * draws the tight Display cut and captions the open Text cut on their own.
 * Geist Mono is the machine voice — tool names, commands, the install line.
 * Instrument Serif is held for one word.
 */
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-run-mono",
  display: "swap",
})

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic"],
  variable: "--font-run-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Interfaces for software that acts`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
}

export default function RunLayout({ children }: { children: React.ReactNode }) {
  const searchIndex = buildSearchIndex().map((entry) => ({
    ...entry,
    href: variantHref("run", entry.href),
  }))
  const components = componentsByName.map(({ slug, title }) => ({ slug, title }))

  return (
    <div className={`v-run ${mono.variable} ${serif.variable}`}>
      <a href="#main-content" className="run-skip">
        Skip to content
      </a>
      <RunMotion>
        <RunTopBar searchIndex={searchIndex} components={components} />
        {children}
        <RunFooter />
      </RunMotion>
      <VariantSwitcherDock current="run" />
    </div>
  )
}
