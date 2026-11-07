import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"

import { PlateIndex, PlateIndexFallback } from "@/components/variants/specimen/plate-index"
import { PURPOSE, href, toPlate } from "@/components/variants/specimen/plates"
import { componentsByName, getRegistryStats } from "@/lib/registry"
import { COMPONENT_CATEGORIES } from "@/types/registry"

export const metadata: Metadata = {
  title: "Index of plates",
  description:
    "Every Join UI component, drawn up as a numbered plate: live miniature, category and purpose, filterable by category.",
  robots: { index: false, follow: false },
}

const STATUS: Record<string, string> = {
  new: "New",
  stable: "Stable",
  updated: "Updated",
  experimental: "Experimental",
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-")
  return `${day}.${month}.${year}`
}

export default function PlatesIndexPage() {
  const stats = getRegistryStats()
  const plates = componentsByName.map((component) => {
    const plate = toPlate(component)
    return {
      slug: plate.slug,
      no: plate.no,
      title: plate.title,
      purpose: PURPOSE[plate.slug] ?? plate.description,
      category: plate.category,
      status: STATUS[plate.status] ?? plate.status,
      since: formatDate(component.since),
      packages: component.dependencies.join(", ") || "none",
      href: plate.href,
    }
  })
  const categories = COMPONENT_CATEGORIES.map((name) => ({
    name,
    count: plates.filter((plate) => plate.category === name).length,
  })).filter((entry) => entry.count > 0)

  return (
    <main id="main-content" className="sp-wrap pt-8 lg:pt-12">
      <header data-running="Index of plates" className="sp-grid items-end gap-y-6">
        <div className="col-span-4 lg:col-span-8">
          <nav aria-label="Breadcrumb" className="sp-label flex gap-2">
            <Link href={href("/")} className="hover:text-[var(--sp-ink)]">
              Join UI
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-[var(--sp-ink)]">
              Plates
            </span>
          </nav>
          <h1 className="sp-display mt-8 text-[clamp(56px,9vw,132px)] leading-[0.88]">
            Index of plates
          </h1>
        </div>
        <div className="col-span-4 lg:col-span-4">
          <p className="text-[17px] leading-[1.55] text-pretty text-[var(--sp-ink-2)]">
            {stats.total} plates in {stats.categories} categories, in reading order. Each
            miniature is the component itself, running; open a plate for its anatomy,
            specification and source.
          </p>
        </div>
      </header>

      <div className="mt-14 lg:mt-20">
        <Suspense fallback={<PlateIndexFallback />}>
          <PlateIndex plates={plates} categories={categories} />
        </Suspense>
      </div>
    </main>
  )
}
