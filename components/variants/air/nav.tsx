import { componentsByName } from "@/lib/registry"
import { buildSearchIndex } from "@/lib/search"
import { siteConfig } from "@/lib/site"
import { variantBase } from "@/lib/variants"

import { air } from "./href"
import { AirNavBar } from "./nav-client"

const LINKS = [
  { href: "/components", label: "Components" },
  { href: "/docs", label: "Docs" },
  { href: "/docs/installation", label: "Install" },
  { href: "/docs/ai", label: "For AI" },
  { href: "/docs/accessibility", label: "Accessibility" },
]

const QUICK_LINKS = [
  { title: "Browse all components", href: "/components" },
  { title: "Install a component", href: "/docs/installation" },
  { title: "Copy a prompt for your agent", href: "/docs/ai" },
  { title: "Theming", href: "/docs/theming" },
  { title: "Accessibility", href: "/docs/accessibility" },
]

export function AirGlobalNav() {
  // Built on the server and handed down, so the client never imports the registry.
  const index = buildSearchIndex().map((entry) => ({ ...entry, href: air(entry.href) }))

  return (
    <AirNavBar
      base={variantBase("air")}
      links={LINKS.map((link) => ({ ...link, href: air(link.href) }))}
      components={componentsByName.map((component) => ({
        href: air(`/components/${component.slug}`),
        label: component.title,
      }))}
      searchIndex={index}
      quickLinks={QUICK_LINKS.map((link) => ({ ...link, href: air(link.href) }))}
      github={siteConfig.links.github}
    />
  )
}

export function AirSkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only z-[90] focus:not-sr-only focus:fixed focus:top-2 focus:left-3 focus:rounded-full focus:bg-[#0071e3] focus:px-4 focus:py-2 focus:text-[14px] focus:text-white focus:shadow-lg"
    >
      Skip to content
    </a>
  )
}
