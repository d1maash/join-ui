import { Suspense } from "react"
import type { Metadata } from "next"

import { Catalog, CatalogFallback } from "@/components/variants/gallery/catalog"
import { getGalleryItems } from "@/components/variants/gallery/data"

export const metadata: Metadata = {
  title: "Components",
  description:
    "Every Join UI component as a live card. Filter by category, status and traits, sort by date, copy a prompt for your agent.",
  robots: { index: false, follow: false },
}

export default function GalleryCatalogPage() {
  const items = getGalleryItems()
  const categories = new Set(items.map((item) => item.category)).size

  return (
    <main id="main-content" className="px-4 pt-8 pb-16 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="g-title text-[1.75rem] text-[var(--g-ink)] sm:text-[2rem]">
          Components
        </h1>
        <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--g-ink-3)]">
          <span className="g-num text-[var(--g-ink-2)]">{items.length}</span> components
          in <span className="g-num text-[var(--g-ink-2)]">{categories}</span>{" "}
          {categories === 1 ? "category" : "categories"}. Every card is the component
          itself, running — point at one to copy the brief your agent needs to install
          it.
        </p>
      </header>

      <Suspense fallback={<CatalogFallback count={items.length} />}>
        <Catalog items={items} />
      </Suspense>
    </main>
  )
}
