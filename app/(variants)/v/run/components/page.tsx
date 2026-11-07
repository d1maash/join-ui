import { Suspense } from "react"
import type { Metadata } from "next"

import {
  MissionControl,
  MissionControlRoute,
} from "@/components/variants/run/mission-control"
import { getCatalogItems } from "@/lib/registry/catalog"

export const metadata: Metadata = {
  title: "Components",
  description:
    "All seven Join UI components, running. Filter by category, search, and open any of them.",
  robots: { index: false, follow: false },
}

/*
 * Mission Control: every component as a live window spread across the stage.
 * The category lives in the query string, so the route half reads it behind a
 * Suspense boundary and the page stays static — the fallback is the same stage
 * showing all seven, which is what the prerendered HTML should be anyway.
 */
export default function RunCatalogPage() {
  const items = getCatalogItems()

  return (
    <main id="main-content" className="run-container pt-14">
      <header className="flex flex-col gap-6 pt-14 pb-12 md:flex-row md:items-end md:justify-between md:pt-20 md:pb-16">
        <h1 className="run-display">Components</h1>
        <p className="run-lede max-w-[26rem] md:pb-3">
          <strong>Seven windows, every one of them running.</strong> Pick a category and
          they re-tile; open one to read it, copy it, or hand it to your agent.
        </p>
      </header>

      <Suspense fallback={<MissionControl items={items} />}>
        <MissionControlRoute items={items} />
      </Suspense>
    </main>
  )
}
