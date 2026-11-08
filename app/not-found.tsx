import Link from "next/link"

import { siteConfig } from "@/lib/site"

import "./(site)/site.css"

/*
 * The root 404, for the few addresses outside the site shell — a full-screen
 * preview of a slug that does not exist, say. Everything under the site itself
 * lands on `app/(site)/not-found.tsx`, which has the rail and the search.
 */
export default function NotFound() {
  return (
    <div className="join-site dark flex min-h-dvh flex-col">
      <header className="flex h-12 items-center border-b border-[var(--g-line)] px-4">
        <Link href="/" className="text-[0.875rem] font-semibold text-[var(--g-ink)]">
          {siteConfig.name}
        </Link>
      </header>
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-4 py-24"
      >
        <p className="font-mono text-[0.8125rem] text-[var(--g-accent-ink)]">404</p>
        <h1 className="g-display text-[clamp(2.25rem,5vw,3.75rem)] text-[var(--g-ink)]">
          Nothing is filed under this address.
        </h1>
        <p className="max-w-xl leading-relaxed text-[var(--g-ink-3)]">
          It may have been renamed, or the component you want lives under another
          slug.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/components" className="g-btn g-btn-accent">
            Browse components
          </Link>
          <Link href="/docs" className="g-btn">
            Read the docs
          </Link>
        </div>
      </main>
    </div>
  )
}
