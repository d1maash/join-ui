import Link from "next/link"

import { siteConfig } from "@/lib/site"

import { sh } from "./href"
import { ThemeSegmented } from "./theme"

/** One quiet line, the links people look for, and the theme. */
export function StudioFooter() {
  const links = [
    { href: sh("/docs"), label: "Docs" },
    { href: sh("/components"), label: "Components" },
    { href: sh("/docs/ai"), label: "Prompts" },
    { href: siteConfig.links.repo, label: "GitHub", external: true },
    { href: siteConfig.links.issues, label: "Issues", external: true },
  ]

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 pt-8 pb-28 md:flex-row md:items-center md:px-6">
        <p className="text-[13px] leading-relaxed text-balance text-muted-foreground">
          Built by{" "}
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {siteConfig.author}
          </a>
          . Open source under the MIT license — the source is on{" "}
          <a
            href={siteConfig.links.repo}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            GitHub
          </a>
          .
        </p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2 md:ml-auto">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
        <ThemeSegmented />
      </div>
    </footer>
  )
}
