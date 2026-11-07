import type * as React from "react"
import Link from "next/link"

import { getGalleryNav } from "@/components/variants/gallery/data"
import { g } from "@/components/variants/gallery/links"
import { Rail } from "@/components/variants/gallery/rail"
import { LibraryTopBar } from "@/components/variants/gallery/top-bar"
import { siteConfig } from "@/lib/site"

/*
 * The library shell: a sticky rail on the left from 1024px up, a sheet below
 * that, and a top bar over the page. Catalog, component pages, docs and the
 * 404 all sit in it; the landing page does not, it is the shop window.
 */
export function LibraryShell({ children }: { children: React.ReactNode }) {
  const nav = getGalleryNav()
  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-[var(--g-rail)] shrink-0 border-r border-[var(--g-line)] bg-[var(--g-bg)] lg:block">
        <Rail nav={nav} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <LibraryTopBar nav={nav} />
        <div className="flex-1">{children}</div>
        <SlimFooter />
      </div>
    </div>
  )
}

function SlimFooter() {
  return (
    <footer className="border-t border-[var(--g-line)] px-4 pt-6 pb-24 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8125rem] text-[var(--g-ink-4)]">
        <span>
          {siteConfig.name} · MIT licensed · by {siteConfig.author}
        </span>
        <span className="flex flex-wrap gap-x-5 gap-y-2 sm:ml-auto">
          <Link href={g("/docs/installation")} className="transition-colors hover:text-[var(--g-ink)]">
            Installation
          </Link>
          <Link href={g("/docs/ai")} className="transition-colors hover:text-[var(--g-ink)]">
            Prompts for agents
          </Link>
          <Link href={g("/docs/contributing")} className="transition-colors hover:text-[var(--g-ink)]">
            Contributing
          </Link>
          <a
            href={siteConfig.links.issues}
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-[var(--g-ink)]"
          >
            Report an issue
          </a>
        </span>
      </div>
    </footer>
  )
}
