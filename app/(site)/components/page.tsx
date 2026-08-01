import { Suspense } from "react"
import type { Metadata } from "next"

import {
  ComponentCatalog,
  ComponentCatalogFallback,
} from "@/components/docs/component-catalog"
import { DocsBreadcrumbs } from "@/components/docs/docs-breadcrumbs"
import { getCatalogItems } from "@/lib/registry/catalog"
import { getRegistryStats } from "@/lib/registry"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Components",
  description:
    "Browse every Joinway UI component. Filter by category, status and traits, preview each one live, then install it with the shadcn CLI.",
  alternates: { canonical: "/components" },
  openGraph: {
    title: `Components — ${siteConfig.name}`,
    description:
      "Browse every Joinway UI component. Filter by category, status and traits, then install with the shadcn CLI.",
    url: `${siteConfig.url}/components`,
  },
}

export default function ComponentsPage() {
  const items = getCatalogItems()
  const stats = getRegistryStats()

  return (
    <main id="main-content" className="mx-auto max-w-[100rem] px-4 py-10 sm:px-6">
      <DocsBreadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Components" }]}
        className="mb-6"
      />

      <header className="mb-8 flex max-w-2xl flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Components</h1>
        <p className="leading-relaxed text-pretty text-muted-foreground">
          {stats.total} components across {stats.categories} categories. Every preview
          runs the same source the CLI installs, and every page ships a ready-made
          prompt for your coding agent.
        </p>
      </header>

      {/*
        `ComponentCatalog` reads the category from the query string, so it needs
        a Suspense boundary — that keeps this page statically rendered.
      */}
      <Suspense fallback={<ComponentCatalogFallback />}>
        <ComponentCatalog items={items} />
      </Suspense>
    </main>
  )
}
