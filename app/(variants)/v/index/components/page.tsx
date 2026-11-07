import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"

import { IxCatalog } from "@/components/variants/index/catalog"
import { formatDate, plural } from "@/components/variants/index/codes"
import { getIxCategories, getIxItems, getLastChange, ixHref } from "@/components/variants/index/data"

export const metadata: Metadata = {
  title: "Components",
  description:
    "Every Join UI component, live. Filter by category, trait and status, sort by recency or name, and copy the install command or the agent prompt from any cell.",
  robots: { index: false, follow: false },
}

export default function IndexCatalogPage() {
  const items = getIxItems()
  const categories = getIxCategories().map(({ name, mark }) => ({ name, mark }))
  const lastChange = getLastChange()

  return (
    <main id="main-content" className="flex-1">
      <header className="ix-frame ix-rule-b grid gap-6 px-5 pt-8 pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:px-8 md:pt-10 lg:px-10">
        <div>
          <nav aria-label="Breadcrumb" className="ix-mono ix-fg-3 flex items-center gap-2">
            <Link href={ixHref("/")} className="hover:text-[var(--ix-fg)]">
              Index
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-[var(--ix-fg-2)]">
              Components
            </span>
          </nav>
          <h1 className="mt-4 text-[2.25rem] leading-none font-semibold tracking-[-0.045em] md:text-[3rem]">
            Components
          </h1>
          <p className="ix-fg-2 mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-pretty">
            {items.length === 0
              ? "The registry is empty. Components appear here the moment they are added to it."
              : `${plural(items.length, "component")} in ${plural(categories.length, "category", "categories")}, each one live. Every cell copies its install command or its agent prompt without leaving the page.`}
          </p>
        </div>
        <dl className="ix-mono grid grid-cols-3 self-end border border-[var(--ix-line)] md:min-w-[22rem]">
          {[
            ["Total", String(items.length)],
            ["Categories", String(categories.length)],
            ["Last change", lastChange ? formatDate(lastChange) : "—"],
          ].map(([label, value], index) => (
            <div key={label} className={"px-3 py-2.5 " + (index > 0 ? "border-l border-[var(--ix-line)]" : "")}>
              <dt className="ix-fg-3 text-[0.6875rem] tracking-[0.04em] uppercase">{label}</dt>
              <dd className="mt-1 text-[0.8125rem] whitespace-nowrap text-[var(--ix-fg)]">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      {/* The category is read from the query string, which needs a boundary to stay static. */}
      <Suspense
        fallback={
          <div className="ix-frame ix-rule-b ix-mono ix-fg-3 px-5 py-10 md:px-8">Loading the index…</div>
        }
      >
        <IxCatalog items={items} categories={categories} />
      </Suspense>
    </main>
  )
}
