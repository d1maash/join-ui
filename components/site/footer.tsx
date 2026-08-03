import Link from "next/link"

import { GitHubIcon } from "@/components/site/icons"
import { LogoMark } from "@/components/site/logo"
import { docsPages } from "@/lib/docs/nav"
import { siteConfig } from "@/lib/site"

const COLUMNS = [
  {
    title: "Registry",
    links: [
      { label: "Components", href: "/components" },
      { label: "Installation", href: "/docs/installation" },
      { label: "Registry setup", href: "/docs/registry-setup" },
    ],
  },
  {
    title: "Guides",
    links: docsPages
      .filter((page) => ["theming", "dark-mode", "accessibility"].includes(page.slug))
      .map((page) => ({ label: page.title, href: page.href })),
  },
  {
    title: "Project",
    links: [
      { label: "Contributing", href: "/docs/contributing" },
      { label: "GitHub", href: siteConfig.links.github },
      { label: "Issues", href: siteConfig.links.issues },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[100rem] px-4 sm:px-6">
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <LogoMark />
            <p className="max-w-[24ch] text-sm leading-relaxed text-muted-foreground">
              {siteConfig.tagline}
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <p className="label-micro text-muted-foreground">{column.title}</p>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => {
                  const external = link.href.startsWith("http")
                  return (
                    <li key={link.href}>
                      {external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="label-micro text-muted-foreground">
            {siteConfig.name} — MIT licence
          </p>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <GitHubIcon aria-hidden="true" className="size-4" />
            Source on GitHub
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
