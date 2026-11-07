import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { FlagBadge } from "@/components/variants/studio/badges"
import { getItems } from "@/components/variants/studio/data"
import { sh } from "@/components/variants/studio/href"
import { NotFoundSearch } from "@/components/variants/studio/not-found-search"
import { docsPages } from "@/lib/docs/nav"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
}

/** Simple and kind: what happened, a search seeded with the miss, and a few ways on. */
export default function StudioNotFound() {
  const newest = getItems().slice(0, 4)
  const guides = docsPages.slice(0, 4)

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-20 pb-24 text-center md:pt-28">
      <p className="text-[13px] font-medium text-muted-foreground">404</p>
      <h1 className="mt-3 text-[clamp(2rem,4.5vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.04em] text-balance">
        This page doesn’t exist.
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-pretty text-muted-foreground">
        It may have been renamed, or the link has a typo. Search for what you were after, or
        start from one of these.
      </p>

      <NotFoundSearch className="mt-8" />

      <div className="mt-14 grid w-full gap-8 text-left sm:grid-cols-2">
        <div>
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">Newest components</p>
          <ul className="flex flex-col">
            {newest.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="flex h-9 items-center gap-2 rounded-md px-2 text-sm transition-colors hover:bg-muted"
                >
                  <span className="truncate">{item.title}</span>
                  <FlagBadge flag={item.flag} size="xs" />
                  <span className="ml-auto truncate text-xs text-muted-foreground">{item.category}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">Getting started</p>
          <ul className="flex flex-col">
            {guides.map((page) => (
              <li key={page.slug}>
                <Link
                  href={sh(page.href)}
                  className="flex h-9 items-center gap-2 rounded-md px-2 text-sm transition-colors hover:bg-muted"
                >
                  <span className="truncate">{page.title}</span>
                  <ArrowRight aria-hidden="true" className="ml-auto size-3.5 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Link
        href={sh("/")}
        className="mt-12 inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
      >
        Back to the home page
      </Link>
    </main>
  )
}
