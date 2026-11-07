import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { InstallLine } from "@/components/variants/run/install"
import { CAST } from "@/components/variants/run/script"
import { RunStory } from "@/components/variants/run/story"
import { siteConfig } from "@/lib/site"
import { variantHref } from "@/lib/variants"

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Interfaces for software that acts` },
}

const href = (path: string) => variantHref("run", path)

/*
 * The landing page is one agent run. The statement, then a window that plays
 * the run as you scroll — pick, work, ask, ship, and the page it built — and
 * then the one line that puts any of it in your project.
 */
export default function RunHome() {
  return (
    <main id="main-content">
      <section className="run-hero run-container" aria-labelledby="run-title">
        <h1 id="run-title" className="run-display">
          Interfaces for software <br className="max-md:hidden" />
          that <span className="run-serif">acts.</span>
        </h1>

        <div className="mt-8 flex flex-col gap-7 md:mt-10 md:flex-row md:items-end md:justify-between md:gap-12">
          <p className="run-lede max-w-[33rem] md:text-[1.3125rem] md:leading-[1.45]">
            <strong>Seven motion-first React components for agent products.</strong> Installed as
            source you own.
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <Link href={href("/components")} className="run-btn run-btn--primary">
              Browse the seven
            </Link>
            <Link href={href("/docs")} className="run-btn run-btn--ghost">
              Read the docs
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <RunStory />

      <section
        aria-labelledby="run-install"
        className="run-container pt-28 pb-12 md:pt-40 lg:pt-48"
      >
        <h2 id="run-install" className="run-lede mb-10 max-w-[36rem] md:mb-14">
          <strong>Every part of that run is one command away.</strong> The CLI writes the source
          into your project, not a package into node_modules.
        </h2>
        <InstallLine items={CAST.map(({ slug, title }) => ({ slug, title }))} />
      </section>
    </main>
  )
}
