import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { Catalog, CatalogFallback } from "@/components/variants/studio/catalog"
import { getCategoryCounts, getItems } from "@/components/variants/studio/data"
import { sh } from "@/components/variants/studio/href"

export const metadata: Metadata = {
  title: "Components",
  description: "Every Join UI component, live — filter by category, search, sort.",
  robots: { index: false, follow: false },
}

export default function StudioCatalogPage() {
  const items = getItems()
  const categories = getCategoryCounts(items)
  const fresh = items.filter((item) => item.flag === "new" || item.flag === "updated").length

  return (
    <main id="main-content">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-10 pb-8 md:px-6 md:pt-14">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <li>
              <Link href={sh("/")} className="transition-colors hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li aria-current="page" className="text-foreground">
              Components
            </li>
          </ol>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <h1 className="text-[clamp(2rem,3.6vw,2.5rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
              Components
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-pretty text-muted-foreground">
              Every component in the registry, running live. Filter by category, search by name,
              tag or package, and open one for its preview, code, props and prompt.
            </p>
          </div>
          <dl className="flex gap-8 text-[13px]">
            {[
              { label: "Components", value: items.length },
              { label: "Categories", value: categories.length },
              { label: "New & updated", value: fresh },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-0.5">
                <dt className="text-muted-foreground">{stat.label}</dt>
                <dd className="text-lg font-semibold tracking-[-0.02em] tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <Suspense fallback={<CatalogFallback items={items} categories={categories} />}>
        <Catalog items={items} categories={categories} />
      </Suspense>
    </main>
  )
}
