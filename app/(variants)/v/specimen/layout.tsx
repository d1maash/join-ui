import type * as React from "react"
import type { Metadata, Viewport } from "next"
import { Instrument_Serif, Inter_Tight } from "next/font/google"

import { VariantSwitcherDock } from "@/components/variants/variant-switcher"
import {
  Colophon,
  MarginRuler,
  RunningHead,
  SkipLink,
} from "@/components/variants/specimen/chrome"
import { IndexTabs } from "@/components/variants/specimen/index-tabs"
import { getPlateIndex } from "@/components/variants/specimen/plates"

import "./specimen.css"

/*
 * Inter Tight carries the whole manual, from the 15px spec notes to the
 * poster-scale cover. Instrument Serif, italic only, is the hand that writes
 * the captions and side notes. The mono is the site's JetBrains Mono, already
 * loaded at the root, and it is kept to labels, numbers and code.
 */
const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sp-sans",
  display: "swap",
})

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic"],
  variable: "--font-sp-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Join UI — Field manual for interfaces that move",
    template: "%s — Join UI field manual",
  },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: "#efeee9",
  colorScheme: "light",
}

export default function SpecimenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v-specimen light ${sans.variable} ${serif.variable}`}>
      <SkipLink />
      <RunningHead />
      <MarginRuler />
      <IndexTabs
        plates={getPlateIndex().map(({ slug, no, title, href }) => ({ slug, no, title, href }))}
      />
      {children}
      <Colophon />
      <VariantSwitcherDock current="specimen" />
    </div>
  )
}
