import { Suspense } from "react"
import type { Metadata } from "next"
import { Bot, BookOpen } from "lucide-react"

import { AirCatalog, AirCatalogFallback } from "@/components/variants/air/catalog"
import { air } from "@/components/variants/air/href"
import { MoreLink } from "@/components/variants/air/pill"
import { getRegistryStats } from "@/lib/registry"
import { getCatalogItems } from "@/lib/registry/catalog"

export const metadata: Metadata = {
  title: "Components",
  description:
    "Every Join UI component, previewed live. Filter by category, then install with the shadcn CLI or copy a prompt for your coding agent.",
}

/*
 * The catalog, laid out like the Apple Store's front page: a two-tone title
 * with help links beside it, the category icon row, then the shelf itself.
 */
export default function AirComponentsPage() {
  const items = getCatalogItems()
  const stats = getRegistryStats()

  return (
    <main id="main-content" className="bg-[#f5f5f7] pb-28">
      <div className="bg-white">
        <header className="mx-auto flex max-w-[75rem] flex-col gap-8 px-5 pt-14 pb-10 sm:pt-20 sm:pb-14 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="air-h1 max-w-[16ch] text-[#1d1d1f]">
            Components.{" "}
            <span className="text-[#6e6e73]">
              {stats.total} of them, every one live.
            </span>
          </h1>
          <ul className="flex shrink-0 flex-col gap-4 text-[14px] leading-[1.4] lg:pb-2">
            <li className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7]">
                <BookOpen aria-hidden="true" strokeWidth={1.7} className="size-[18px]" />
              </span>
              <span>
                <span className="block font-semibold text-[#1d1d1f]">New to Join UI?</span>
                <MoreLink href={air("/docs/installation")}>Set up your project</MoreLink>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7]">
                <Bot aria-hidden="true" strokeWidth={1.7} className="size-[18px]" />
              </span>
              <span>
                <span className="block font-semibold text-[#1d1d1f]">Working with an agent?</span>
                <MoreLink href={air("/docs/ai")}>Every page has a prompt</MoreLink>
              </span>
            </li>
          </ul>
        </header>
      </div>
      {/*
        The catalog reads `?category=` with `useSearchParams`, so it needs a
        Suspense boundary to keep this page statically rendered.
      */}
      <Suspense fallback={<AirCatalogFallback count={items.length} />}>
        <AirCatalog items={items} />
      </Suspense>
    </main>
  )
}
