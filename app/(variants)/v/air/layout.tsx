import type * as React from "react"
import type { Metadata, Viewport } from "next"

import { AirFooter } from "@/components/variants/air/footer"
import { AirGlobalNav, AirSkipLink } from "@/components/variants/air/nav"
import { VariantSwitcherDock } from "@/components/variants/variant-switcher"
import { siteConfig } from "@/lib/site"

import "./air.css"

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
}

/*
 * Air — the bright variant. `.light` makes this subtree a light theme island
 * (the root document is dark), and `.v-air` scopes the variant stylesheet.
 */
export default function AirLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="v-air light flex min-h-dvh flex-col bg-white font-sans text-[#1d1d1f]">
      <noscript>
        <style>{`.v-air [data-air-reveal]{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <AirSkipLink />
      <AirGlobalNav />
      <div className="flex-1">{children}</div>
      <AirFooter />
      <VariantSwitcherDock current="air" />
    </div>
  )
}
