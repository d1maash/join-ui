import type * as React from "react"
import type { Metadata, Viewport } from "next"

import { COMPONENT_SLUGS, vh, type ComponentInfo } from "@/components/variants/desktop/apps"
import { Dock } from "@/components/variants/desktop/dock"
import { MenuBar, type DocsSection } from "@/components/variants/desktop/menu-bar"
import { OsProvider } from "@/components/variants/desktop/os"
import { PhoneStatusBar } from "@/components/variants/desktop/phone-bar"
import { RunProvider } from "@/components/variants/desktop/run"
import { Spotlight } from "@/components/variants/desktop/spotlight"
import { Wallpaper } from "@/components/variants/desktop/wallpaper"
import { VariantSwitcherDock } from "@/components/variants/variant-switcher"
import { docsNav } from "@/lib/docs/nav"
import { getComponent } from "@/lib/registry"
import { buildSearchIndex } from "@/lib/search"
import { siteConfig } from "@/lib/site"

import "./desktop.css"

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Desktop`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
}

/*
 * The Desktop variant: the site is a small operating system.
 *
 * The layout is the OS itself — wallpaper, menu bar, Dock, Spotlight and the
 * window server that remembers what is open across pages. Pages are what the
 * OS is showing: the landing page is the desktop, a component page is that
 * component's app, maximised. Registry data is read here, on the server, and
 * handed down as plain props, so the client never imports the registry.
 */
export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  const components: ComponentInfo[] = COMPONENT_SLUGS.flatMap((slug) => {
    const component = getComponent(slug)
    if (!component) return []
    return [
      {
        slug,
        title: component.title,
        category: component.category,
        description: component.description,
        installCommand: component.installCommand,
      },
    ]
  })

  const search = buildSearchIndex().map((entry) => ({ ...entry, href: vh(entry.href) }))
  const docs: DocsSection[] = docsNav.map((section) => ({
    title: section.title,
    items: section.items.map((item) => ({ title: item.title, href: vh(item.href) })),
  }))

  return (
    <OsProvider components={components}>
      <RunProvider>
        <div className="v-desktop dark relative isolate min-h-dvh">
          <a
            href="#main-content"
            className="sr-only z-[300] rounded-lg bg-[#0a84ff] px-4 py-2 text-[14px] font-medium text-white focus:not-sr-only focus:fixed focus:top-10 focus:left-3"
          >
            Skip to content
          </a>
          <Wallpaper />
          <MenuBar docs={docs} />
          <PhoneStatusBar />
          {children}
          <Dock />
          <Spotlight index={search} />
          <VariantSwitcherDock current="desktop" />
        </div>
      </RunProvider>
    </OsProvider>
  )
}
