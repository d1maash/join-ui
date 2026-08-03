import Link from "next/link"

import { GitHubIcon } from "@/components/site/icons"
import { Logo } from "@/components/site/logo"
import { MobileNav } from "@/components/site/mobile-nav"
import { NavLink } from "@/components/site/nav-link"
import { SearchCommand } from "@/components/site/search-command"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { Button } from "@/components/ui/button"
import { getSidebarSections } from "@/lib/docs/sidebar"
import { buildSearchIndex } from "@/lib/search"
import { siteConfig } from "@/lib/site"

const NAV = [
  { href: "/docs", label: "Docs" },
  { href: "/components", label: "Components" },
]

/**
 * Sticky site header.
 *
 * A Server Component: the search index and sidebar tree are built at build time
 * and handed to the few interactive children as props, so the client bundle
 * never imports the full registry.
 */
export function SiteHeader() {
  const sections = getSidebarSections()
  const searchEntries = buildSearchIndex()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-[100rem] items-center gap-3 px-4 sm:px-6">
        <MobileNav sections={sections} />
        <Logo />

        <nav aria-label="Main" className="ml-8 hidden self-stretch lg:block">
          <ul className="flex h-full items-stretch gap-7">
            {NAV.map((link) => (
              <li key={link.href} className="flex">
                <NavLink href={link.href}>{link.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchCommand index={searchEntries} />
          <Button asChild variant="ghost" size="icon-sm">
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${siteConfig.name} on GitHub (opens in a new tab)`}
            >
              <GitHubIcon aria-hidden="true" className="size-4" />
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export function SkipToContent() {
  return (
    <Link
      href="#main-content"
      className="sr-only z-50 focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
    >
      Skip to content
    </Link>
  )
}
