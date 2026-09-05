import { Suspense } from "react"
import type { Metadata } from "next"

import { Breadcrumbs } from "@/components/site/breadcrumbs"
import {
  ComponentCatalog,
  ComponentCatalogFallback,
} from "@/components/site/component-catalog"
import { getRegistryStats } from "@/lib/registry"
import { getCatalogItems } from "@/lib/registry/catalog"
import { revealAt } from "@/lib/reveal"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Components",
  description:
    "Browse every Join UI component. Filter by category, status and traits, preview each one live, then install it with the shadcn CLI.",
  alternates: { canonical: "/components" },
  openGraph: {
    title: `Components — ${siteConfig.name}`,
    description:
      "Browse every Join UI component. Filter by category, status and traits, then install with the shadcn CLI.",
    url: `${siteConfig.url}/components`,
  },
}

export default function ComponentsPage() {
  const items = getCatalogItems()
  const stats = getRegistryStats()

  return (
    <main id="main-content" className="mx-auto max-w-[100rem] px-4 py-10 sm:px-6">
      {/*
        The page arrives top to bottom — crumbs, title, standfirst — and the
        catalog below carries on the count from where the header stops. It
        renders after hydration, behind its Suspense boundary, so it starts
        its own clock a little later anyway; the numbering only has to keep
        the order right, not the timing.
      */}
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Components" }]}
        className="reveal mb-8"
      />

      <header className="mb-8 grid gap-6 lg:grid-cols-12">
        <h1
          className="reveal reveal-dither text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.036em] lg:col-span-7 [--reveal-y:0.2em]"
          style={revealAt(1)}
        >
          Components
        </h1>
        <p
          className="reveal max-w-xl self-end leading-relaxed text-pretty text-muted-foreground lg:col-span-5"
          style={revealAt(2)}
        >
          {stats.total === 0
            ? "The catalog is empty while the registry is rebuilt. Every page, filter and search entry below is generated from the registry metadata, so components appear here the moment they are added."
            : `${stats.total} components across ${stats.categories} categories. Every preview runs the same source the CLI installs, and every page ships a ready-made prompt for your coding agent.`}
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
