import Link from "next/link"

import { LogoMark } from "@/components/site/logo"
import { docsNav } from "@/lib/docs/nav"
import { siteConfig } from "@/lib/site"

import { getIxCategories, getIxItems, ixHref } from "./data"

/** A compact boxed footer: four columns of links and one line of record. */
export function IxFooter() {
  const categories = getIxCategories()
  const total = getIxItems().length
  const guides = docsNav.flatMap((section) => section.items).slice(0, 5)

  const columns: Array<{ title: string; links: Array<{ label: string; href: string; external?: boolean }> }> = [
    {
      title: "Library",
      links: [
        { label: `All components (${total})`, href: ixHref("/components") },
        ...categories.slice(0, 4).map((category) => ({
          label: category.name,
          href: ixHref(`/components?category=${encodeURIComponent(category.name)}`),
        })),
      ],
    },
    {
      title: "Docs",
      links: guides.map((page) => ({ label: page.title, href: ixHref(page.href) })),
    },
    {
      title: "Project",
      links: [
        { label: "GitHub", href: siteConfig.links.github, external: true },
        { label: "Issues", href: siteConfig.links.issues, external: true },
        { label: "Contributing", href: ixHref("/docs/contributing") },
        { label: "Registry index", href: "/r/registry.json", external: true },
      ],
    },
  ]

  return (
    <footer className="mt-auto pb-24">
      <div className="ix-frame ix-cross border-y border-[var(--ix-line)] md:border-b-0">
        <div className="grid md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col justify-between gap-6 border-b border-[var(--ix-line)] p-6 md:border-r md:border-b-0">
            <Link href={ixHref("/")} className="flex w-fit items-center gap-2 font-semibold tracking-[-0.02em]">
              <LogoMark className="size-5" />
              {siteConfig.name}
            </Link>
            <p className="ix-fg-3 max-w-[30ch] text-[0.8125rem] leading-relaxed">
              Motion-first React components, installed as source you own.
            </p>
          </div>
          {columns.map((column, index) => (
            <nav
              key={column.title}
              aria-label={column.title}
              className={
                index < columns.length - 1
                  ? "border-b border-[var(--ix-line)] p-6 md:border-r md:border-b-0"
                  : "p-6"
              }
            >
              <p className="ix-mono ix-fg-3 mb-3 text-[0.6875rem] tracking-[0.04em] uppercase">{column.title}</p>
              <ul className="flex flex-col gap-1.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="ix-fg-2 text-[0.8125rem] transition-colors hover:text-[var(--ix-fg)]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="ix-fg-2 text-[0.8125rem] transition-colors hover:text-[var(--ix-fg)]"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="ix-mono ix-fg-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-[var(--ix-line)] px-6 py-3 md:border-b">
          <span>
            © {new Date().getFullYear()} {siteConfig.author} · MIT
          </span>
          <span>registry {siteConfig.namespace} · {total} items</span>
        </div>
      </div>
    </footer>
  )
}
