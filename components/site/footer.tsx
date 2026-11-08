import Link from "next/link"

import { CopyButton } from "@/components/site/copy-button"
import { SiteLogo } from "@/components/site/rail"
import { siteConfig } from "@/lib/site"

import type { LibraryNav } from "@/components/site/data"

export function SiteFooter({
  nav,
  installCommand,
}: {
  nav: LibraryNav
  installCommand: string
}) {
  const columns = [
    {
      title: "Library",
      links: [
        { label: `All components (${nav.total})`, href: "/components" },
        { label: "New", href: "/components?status=new" },
        ...nav.categories
          .slice(0, 6)
          .map((category) => ({ label: category.name, href: category.href })),
      ],
    },
    {
      title: "Docs",
      links: nav.docs
        .flatMap((section) => section.items)
        .filter((item) =>
          [
            "introduction",
            "installation",
            "registry-setup",
            "theming",
            "accessibility",
            "ai",
          ].includes(item.slug)
        )
        .map((item) => ({ label: item.title, href: item.href })),
    },
    {
      title: "Project",
      links: [
        { label: "GitHub", href: siteConfig.links.github, external: true },
        { label: "Issues", href: siteConfig.links.issues, external: true },
        { label: "Contributing", href: "/docs/contributing" },
        {
          label: "MIT licence",
          href: `${siteConfig.links.repo}/blob/main/LICENSE`,
          external: true,
        },
      ],
    },
  ]

  return (
    <footer className="border-t border-[var(--g-line)]">
      <div className="mx-auto grid max-w-[80rem] grid-cols-2 gap-x-6 gap-y-10 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:px-8">
        <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
          <SiteLogo />
          <p className="max-w-xs text-[0.875rem] leading-relaxed text-[var(--g-ink-3)]">
            {siteConfig.tagline} Accessible, animated with motion, installed through the
            shadcn CLI.
          </p>
          <div className="flex h-9 max-w-sm items-center gap-2 rounded-lg border border-[var(--g-line)] bg-[var(--g-panel)] pr-1 pl-3">
            <code className="min-w-0 flex-1 truncate text-[0.75rem] text-[var(--g-ink-2)]">
              <span className="text-[var(--g-ink-4)]">$ </span>
              {installCommand}
            </code>
            <CopyButton
              value={installCommand}
              label="Copy install command"
              toastMessage="Install command copied"
            />
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="text-[0.8125rem] font-medium text-[var(--g-ink)]">
              {column.title}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  {"external" in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[0.8125rem] text-[var(--g-ink-3)] transition-colors hover:text-[var(--g-ink)]"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-[0.8125rem] text-[var(--g-ink-3)] transition-colors hover:text-[var(--g-ink)]"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--g-line)]">
        <div className="mx-auto flex max-w-[80rem] flex-wrap items-center justify-between gap-3 px-4 pt-6 pb-24 text-[0.75rem] text-[var(--g-ink-4)] sm:px-6 lg:px-8">
          <span>© 2026 {siteConfig.author}. MIT licensed.</span>
          <span>
            Registry {siteConfig.namespace} · WCAG 2.2 AA · reduced-motion fallbacks
          </span>
        </div>
      </div>
    </footer>
  )
}
