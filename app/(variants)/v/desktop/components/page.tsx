import { Suspense } from "react"
import type { Metadata } from "next"

import { Catalog, CatalogFromQuery, type CatalogEntry } from "@/components/variants/desktop/catalog"
import { getCatalogItems } from "@/lib/registry/catalog"

export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Every Join UI component in a Finder window: browse by tag, switch between icons, list and gallery, then open one to install it.",
  robots: { index: false, follow: false },
}

/*
 * The catalog page is the Catalog app, maximised. The selected tag comes
 * from `?category=`, which only the client can read on a static page — so
 * the Finder renders unfiltered first, inside a Suspense boundary, and
 * picks the tag up as it hydrates.
 */
export default function CatalogPage() {
  const items: CatalogEntry[] = getCatalogItems().map((item) => ({
    slug: item.slug,
    title: item.title,
    description: item.description,
    category: item.category,
    status: item.status,
    since: item.since,
    dependencyCount: item.dependencyCount,
    tags: item.tags,
  }))

  return (
    <Suspense fallback={<Catalog items={items} category={null} />}>
      <CatalogFromQuery items={items} />
    </Suspense>
  )
}
