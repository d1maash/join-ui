import Link from "next/link"
import { GitHubIcon } from "@/components/icons"

import { LogoMark } from "@/components/docs/logo"
import { docsNav } from "@/lib/docs/nav"
import { getCategorySummaries, getRegistryStats } from "@/lib/registry"
import { siteConfig } from "@/lib/site"

export function SiteFooter() {
  const stats = getRegistryStats()
  const categories = getCategorySummaries()
    .filter((category) => category.count > 0)
    .slice(0, 6)
  const gettingStarted = docsNav[0]?.items.slice(0, 5) ?? []

  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-[100rem] px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="flex w-fit items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <LogoMark className="size-6" />
              <span className="text-sm font-semibold tracking-tight">
                {siteConfig.name}
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.tagline} {stats.total} components across{" "}
              {stats.categories} categories, MIT licensed.
            </p>
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer noopener"
              className="flex w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <GitHubIcon aria-hidden="true" className="size-4" />
              GitHub
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>

          <FooterColumn
            title="Getting started"
            links={gettingStarted.map((page) => ({
              label: page.title,
              href: page.href,
            }))}
          />

          <FooterColumn
            title="Categories"
            links={categories.map((category) => ({
              label: category.name,
              href: `/components?category=${encodeURIComponent(category.name)}`,
            }))}
          />

          <FooterColumn
            title="Resources"
            links={[
              { label: "All components", href: "/components" },
              { label: "Registry setup", href: "/docs/registry-setup" },
              { label: "Use with AI", href: "/docs/ai" },
              { label: "Accessibility", href: "/docs/accessibility" },
              { label: "Contributing", href: "/docs/contributing" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Built with Next.js, Tailwind CSS v4 and Motion. Open code — you own
            what you install.
          </p>
          <p>
            <a
              href={`${siteConfig.url}/r/registry.json`}
              className="rounded-sm font-mono transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              /r/registry.json
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: Array<{ label: string; href: string }>
}) {
  return (
    <nav aria-label={title} className="flex flex-col gap-2.5">
      <h2 className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
