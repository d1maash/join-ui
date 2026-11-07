import type * as React from "react"
import type { Metadata, Viewport } from "next"
import Link from "next/link"

import { GlobalNav } from "@/components/variants/pro/global-nav"
import { ProFooter } from "@/components/variants/pro/footer"
import { proHref } from "@/components/variants/pro/href"
import { ProMotion } from "@/components/variants/pro/motion-config"
import { VariantSwitcherDock } from "@/components/variants/variant-switcher"
import { componentsByName } from "@/lib/registry"
import { buildSearchIndex } from "@/lib/search"

import "./pro.css"

export const metadata: Metadata = {
  title: {
    default: "Join UI — Pro",
    template: "%s — Join UI",
  },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
}

const NAV = [
  { label: "Components", href: "/components" },
  { label: "Docs", href: "/docs" },
  { label: "Installation", href: "/docs/installation" },
  { label: "Theming", href: "/docs/theming" },
  { label: "Accessibility", href: "/docs/accessibility" },
  { label: "For agents", href: "/docs/ai" },
]

/*
 * Pro: the black stage of apple.com's product pages. The scheme class sits on
 * the variant root so every token below it resolves to the dark island.
 */
export default function ProLayout({ children }: { children: React.ReactNode }) {
  const links = NAV.map((link) => ({ ...link, href: proHref(link.href) }))
  const components = componentsByName.map((component) => ({
    label: component.title,
    href: proHref(`/components/${component.slug}`),
  }))
  const searchIndex = buildSearchIndex().map((entry) => ({
    ...entry,
    href: proHref(entry.href),
  }))

  return (
    <div className="v-pro dark flex min-h-dvh flex-col font-sans antialiased">
      <Link
        href="#main-content"
        className="sr-only z-[300] focus:not-sr-only focus:fixed focus:top-2 focus:left-3 focus:rounded-full focus:bg-[#0071e3] focus:px-4 focus:py-2 focus:text-[14px] focus:text-white"
      >
        Skip to content
      </Link>
      <GlobalNav links={links} components={components} searchIndex={searchIndex} />
      <ProMotion>
        <div className="flex-1">{children}</div>
      </ProMotion>
      <ProFooter />
      <VariantSwitcherDock current="pro" />
    </div>
  )
}
