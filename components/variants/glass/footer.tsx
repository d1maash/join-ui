import Link from "next/link"

import { LogoMark } from "@/components/site/logo"
import { componentsByName } from "@/lib/registry"
import { siteConfig } from "@/lib/site"

import { g } from "./ui"

const COLUMNS = [
  {
    title: "Components",
    links: componentsByName.map((component) => ({
      label: component.title,
      href: g(`/components/${component.slug}`),
    })),
  },
  {
    title: "Get started",
    links: [
      { label: "Introduction", href: g("/docs") },
      { label: "Installation", href: g("/docs/installation") },
      { label: "Registry setup", href: g("/docs/registry-setup") },
      { label: "Theming", href: g("/docs/theming") },
    ],
  },
  {
    title: "Guides",
    links: [
      { label: "Accessibility", href: g("/docs/accessibility") },
      { label: "Dark mode", href: g("/docs/dark-mode") },
      { label: "Using components with AI", href: g("/docs/ai") },
      { label: "Contributing", href: g("/docs/contributing") },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", href: siteConfig.links.github },
      { label: "Report an issue", href: siteConfig.links.issues },
      { label: "MIT licence", href: `${siteConfig.links.repo}/blob/main/LICENSE` },
    ],
  },
]

/**
 * The footer, as one wide pane inset from the window edge — the directory
 * Apple puts at the foot of every page, set small and quiet.
 */
export function GlassFooter() {
  return (
    <footer className="px-3 pt-24 pb-28 sm:px-5">
      <div className="g-glass g-thick mx-auto max-w-[1180px] rounded-[32px] px-6 py-10 sm:px-10 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <Link
              href={g("/")}
              className="flex items-center gap-2 self-start rounded-full text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
            >
              <LogoMark className="size-6" />
              <span className="text-[17px] font-semibold tracking-[-0.022em]">
                Join UI
              </span>
            </Link>
            <p className="max-w-[24ch] text-[14px] leading-[1.45] text-[#56565b]">
              Made to move. Yours to keep.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-[12px] font-semibold text-[#1d1d1f]">{column.title}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {column.links.map((link) => {
                  const external = link.href.startsWith("http")
                  const className =
                    "rounded-sm text-[12px] leading-[1.35] text-[#56565b] transition-colors hover:text-[#1d1d1f] hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
                  return (
                    <li key={link.href}>
                      {external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={className}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className={className}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-black/[0.08] pt-5 text-[12px] text-[#56565b] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Copyright © {new Date().getFullYear()} {siteConfig.author}. Open source
            under the MIT licence.
          </p>
          <p>
            Installs through the shadcn CLI as{" "}
            <span className="font-mono text-[11.5px] text-[#3a3a3e]">
              {siteConfig.namespace}
            </span>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
