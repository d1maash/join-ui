import { Suspense } from "react"
import type { Metadata } from "next"

import { ProCatalog, ProCatalogFallback } from "@/components/variants/pro/catalog"
import { accentFor } from "@/components/variants/pro/chapters-data"
import { type } from "@/components/variants/pro/styles"
import { getRegistryStats } from "@/lib/registry"
import { getCatalogItems } from "@/lib/registry/catalog"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Components",
  description:
    "Every Join UI component, live. Filter by category and traits, then install with the shadcn CLI.",
}

export default function ProComponentsPage() {
  const items = getCatalogItems()
  const stats = getRegistryStats()
  const accents = Object.fromEntries(
    items.map((item) => [item.slug, accentFor(item.slug)])
  )

  return (
    <main id="main-content" className="px-6 pt-16 pb-32 sm:pt-24">
      <div className="mx-auto max-w-[1180px]">
        <header className="mx-auto max-w-[52rem] text-center">
          <h1 className={cn(type.display, "text-[#f5f5f7]")}>Components.</h1>
          <p className={cn(type.intro, "mx-auto mt-5 max-w-[36rem] text-[#86868b]")}>
            {stats.total} of them, across {stats.categories} categories.{" "}
            <span className="text-[#f5f5f7]">
              Every one live, documented and one command away.
            </span>
          </p>
        </header>

        <div className="mt-14">
          {/* The category lives in the query string, which needs a boundary to stay static. */}
          <Suspense fallback={<ProCatalogFallback />}>
            <ProCatalog items={items} accents={accents} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
