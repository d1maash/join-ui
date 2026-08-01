import Link from "next/link"
import { Github } from "lucide-react"

import { DocsMobileNav } from "@/components/docs/docs-mobile-nav"
import { Logo } from "@/components/docs/logo"
import { SearchCommand } from "@/components/docs/search-command"
import { ThemeToggle } from "@/components/docs/theme-toggle"
import { HeaderNavLink } from "@/components/docs/header-nav-link"
import { Button } from "@/components/ui/button"
import { getSidebarSections } from "@/lib/docs/sidebar"
import { buildSearchIndex } from "@/lib/search"
import { siteConfig } from "@/lib/site"

const NAV = [
  { href: "/docs", label: "Docs" },
  { href: "/components", label: "Components" },
  { href: "/docs/ai", label: "Use with AI" },
]

/**
 * Sticky site header.
 *
 * A Server Component: the search index and sidebar tree are built at build time
 * and handed to the few interactive children as props, so the client bundle
 * never imports the full registry.
 */
export function DocsHeader() {
  const sections = getSidebarSections()
  const searchEntries = buildSearchIndex()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[100rem] items-center gap-2 px-4 sm:px-6">
        <DocsMobileNav sections={sections} />
        <Logo />

        <nav aria-label="Main" className="ml-6 hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((link) => (
              <li key={link.href}>
                <HeaderNavLink href={link.href}>{link.label}</HeaderNavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <SearchCommand index={searchEntries} />
          <Button asChild variant="ghost" size="icon">
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${siteConfig.name} on GitHub (opens in a new tab)`}
            >
              <Github aria-hidden="true" />
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
      className="sr-only z-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:rounded-lg focus:border focus:border-border focus:bg-popover focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-[var(--shadow-overlay)]"
    >
      Skip to content
    </Link>
  )
}
