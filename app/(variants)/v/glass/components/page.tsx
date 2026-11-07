import { Suspense } from "react"
import type { Metadata } from "next"

import { GlassCatalog } from "@/components/variants/glass/catalog"
import { ComponentTile } from "@/components/variants/glass/tile"
import { getRegistryStats } from "@/lib/registry"
import { getCatalogItems } from "@/lib/registry/catalog"

export const metadata: Metadata = {
  title: "Components",
  description:
    "Every Join UI component, live. Filter by category and trait, then install with the shadcn CLI.",
}

const numberWords = ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"]

export default function GlassComponentsPage() {
  const items = getCatalogItems()
  const stats = getRegistryStats()
  const count = numberWords[stats.total] ?? String(stats.total)

  return (
    <main id="main-content" className="px-4 pt-32 sm:px-6 sm:pt-40">
      <div className="mx-auto max-w-[1180px]">
        <header className="grid gap-6 px-2 pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="g-type-in g-spectrum text-[19px] font-semibold tracking-[-0.02em] sm:text-[21px]">
              The catalog
            </p>
            <h1
              className="g-type-in mt-2 text-[clamp(3rem,8vw,5.5rem)] leading-[0.98] font-semibold tracking-[-0.05em] text-[#1d1d1f]"
              style={{ animationDelay: "80ms" }}
            >
              Components.
            </h1>
          </div>
          <p
            className="g-type-in max-w-[26rem] text-[17px] leading-[1.47] tracking-[-0.016em] text-pretty text-[#3a3a3e] sm:text-[19px] sm:leading-[1.42]"
            style={{ animationDelay: "180ms" }}
          >
            {stats.total === 0
              ? "The catalog is empty while the registry is rebuilt."
              : `${count} so far, across ${stats.categories} categories. Every preview runs the source the CLI installs.`}
          </p>
        </header>

        {/*
          The catalog reads its category from the query string, so it renders
          on the client behind this boundary. The fallback is the same grid,
          unfiltered — a complete page before hydration, and with no script.
        */}
        <Suspense
          fallback={
            <ul className="mt-[116px] grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <li key={item.slug}>
                  <ComponentTile item={item} />
                </li>
              ))}
            </ul>
          }
        >
          <GlassCatalog items={items} />
        </Suspense>
      </div>
    </main>
  )
}
