import type { Metadata } from "next"
import Link from "next/link"

import { GalleryCard } from "@/components/variants/gallery/card"
import { g, getNoteworthy } from "@/components/variants/gallery/data"
import { NotFoundSearch } from "@/components/variants/gallery/not-found-search"
import { RailRow } from "@/components/variants/gallery/rail-row"
import { LibraryShell } from "@/components/variants/gallery/shell"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
}

/*
 * The 404 sits in the library shell, rail and all, so the way out is
 * everywhere you look: the rail, a search field that already tried the words
 * in the broken address, and the newest components underneath.
 */
export default function GalleryNotFound() {
  const noteworthy = getNoteworthy()

  return (
    <LibraryShell>
      <main
        id="main-content"
        className="flex flex-col gap-20 px-4 pt-16 pb-16 sm:px-6 sm:pt-24 lg:px-8"
      >
        <section className="flex flex-col items-start gap-6">
          <p className="font-mono text-[0.8125rem] text-[var(--g-accent-ink)]">
            404 · not in the registry
          </p>
          <h1 className="g-display max-w-[16ch] text-[clamp(2.25rem,5vw,3.75rem)] text-[var(--g-ink)]">
            Nothing is filed under this address.
          </h1>
          <p className="max-w-xl text-[1rem] leading-relaxed text-[var(--g-ink-3)]">
            The page may have been renamed, or the component you want lives under
            another slug. Search for it, or start from the catalog.
          </p>
          <NotFoundSearch />
          <div className="flex flex-wrap gap-2">
            <Link href={g("/components")} className="g-btn g-btn-accent">
              Browse components
            </Link>
            <Link href={g("/docs")} className="g-btn">
              Read the docs
            </Link>
          </div>
        </section>

        <RailRow
          id="not-found-new"
          title="New & noteworthy"
          description="The most recently added and reworked components."
          href={g("/components")}
        >
          {noteworthy.map((item) => (
            <GalleryCard key={item.slug} item={item} />
          ))}
        </RailRow>
      </main>
    </LibraryShell>
  )
}
