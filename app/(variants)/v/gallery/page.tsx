import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"

import { GalleryCard, StatusPill } from "@/components/variants/gallery/card"
import {
  formatDate,
  g,
  getCategoryTiles,
  getFeatured,
  getGalleryItems,
  getGalleryNav,
  getNoteworthy,
  realSlug,
} from "@/components/variants/gallery/data"
import { GalleryFooter } from "@/components/variants/gallery/footer"
import { HeroPreview } from "@/components/variants/gallery/hero-preview"
import { LandingNav } from "@/components/variants/gallery/landing-nav"
import { LazyThumb } from "@/components/variants/gallery/lazy-thumb"
import { RailRow } from "@/components/variants/gallery/rail-row"
import { ShipSection } from "@/components/variants/gallery/ship"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import { getComponent } from "@/lib/registry"
import { getComponentSources } from "@/lib/registry/source"

export const metadata: Metadata = {
  title: { absolute: "Join UI — Motion-first React components" },
  robots: { index: false, follow: false },
}

const TILE_LIST = 5

export default async function GalleryLanding() {
  const nav = getGalleryNav()
  const items = getGalleryItems()
  const noteworthy = getNoteworthy()
  const featured = getFeatured()
  const tiles = getCategoryTiles()

  const newest = noteworthy[0]
  const subject = newest ? getComponent(realSlug(newest.slug)) : undefined
  const sources = subject ? await getComponentSources(subject) : []
  const prompt = subject ? buildComponentPrompt({ component: subject, sources }) : ""

  return (
    <>
      <LandingNav nav={nav} />
      <main id="main-content">
        {/* ------------------------------------------------------------ hero */}
        <section className="relative overflow-hidden pt-[calc(var(--g-top)+4.5rem)] sm:pt-[calc(var(--g-top)+6rem)]">
          <div aria-hidden="true" className="g-hero-backdrop">
            <div className="g-hero-band" />
            <div className="g-hero-band g-hero-band-2" />
            <div className="g-grain" />
            <div className="g-hero-fade" />
          </div>

          <div className="relative mx-auto flex max-w-[80rem] flex-col items-center px-4 text-center sm:px-6 lg:px-8">
            {newest ? (
              <Link
                href={g(`/components/${realSlug(newest.slug)}`)}
                className="group mb-7 inline-flex h-8 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] pr-2.5 pl-1 text-[0.8125rem] text-[var(--g-ink-2)] backdrop-blur-md transition-colors hover:border-white/20 hover:text-[var(--g-ink)]"
              >
                <StatusPill item={newest} className="h-6 px-2" />
                <span>
                  {newest.title}
                  <span className="hidden text-[var(--g-ink-4)] sm:inline">
                    {" "}
                    · {formatDate(newest.touched)}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-3.5 text-[var(--g-ink-3)] transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            ) : null}

            <h1 className="g-display max-w-[15ch] text-[clamp(2.75rem,7.2vw,5.75rem)] text-[var(--g-ink)]">
              The motion is done. The source is yours.
            </h1>
            <p className="mt-6 max-w-[38rem] text-[1.0625rem] leading-relaxed text-pretty text-[var(--g-ink-2)] sm:text-[1.1875rem]">
              Animated, accessible React components that land in your repo as plain files through
              the shadcn CLI — each with a ready-made brief for Claude Code, Cursor or Codex.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href={g("/components")} className="g-btn g-btn-accent g-btn-lg">
                Browse components
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                href={g("/docs/installation")}
                className="g-btn g-btn-lg border-white/10 bg-white/[0.06] backdrop-blur-md hover:bg-white/[0.1]"
              >
                Install
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-14 max-w-[76rem] px-3 sm:mt-20 sm:px-6 lg:px-8">
            <HeroPreview nav={nav} items={items} />
          </div>
        </section>

        <div className="mx-auto flex max-w-[80rem] flex-col gap-24 px-4 pt-20 pb-28 sm:px-6 sm:pt-24 lg:px-8">
          {/* ------------------------------------------------------- rails */}
          <div className="flex flex-col gap-16">
            <RailRow
              id="noteworthy"
              title="New & noteworthy"
              description="Newest first, by the later of the day it landed and its last rework."
              href={g("/components")}
            >
              {noteworthy.map((item) => (
                <GalleryCard key={item.slug} item={item} />
              ))}
            </RailRow>

            <RailRow
              id="featured"
              title="Featured"
              description="Picked by the registry — the components that show the most of what the library does."
              href={g("/components")}
              itemClassName="w-[min(84vw,26rem)] sm:w-[27rem]"
            >
              {featured.map((item) => (
                <GalleryCard key={item.slug} item={item} aspect="16/10" description />
              ))}
            </RailRow>
          </div>

          {/* --------------------------------------------------- categories */}
          <section id="categories" aria-labelledby="categories-heading" className="scroll-mt-24">
            <div className="mb-6 flex items-end justify-between gap-6">
              <div>
                <h2 id="categories-heading" className="g-title text-[1.25rem] text-[var(--g-ink)] sm:text-[1.375rem]">
                  Categories
                </h2>
                <p className="mt-1 text-[0.875rem] text-[var(--g-ink-3)]">
                  {tiles.length} of them hold components so far; empty ones stay hidden until they don&apos;t.
                </p>
              </div>
              <Link
                href={g("/components")}
                className="inline-flex shrink-0 items-center gap-0.5 text-[0.8125rem] font-medium text-[var(--g-ink-2)] transition-colors hover:text-[var(--g-ink)]"
              >
                All components
                <ChevronRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tiles.map((tile) => (
                <li
                  key={tile.name}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[var(--g-line)] bg-[var(--g-panel)] transition-colors hover:border-[var(--g-line-2)]"
                >
                  <Link href={tile.href} className="group block">
                    <div className="relative aspect-[16/10] overflow-hidden border-b border-[var(--g-line)] bg-[radial-gradient(120%_90%_at_50%_0%,rgb(255_255_255/0.04),transparent_70%)]">
                      {tile.example ? <LazyThumb slug={realSlug(tile.example.slug)} /> : null}
                    </div>
                    <div className="flex items-baseline justify-between gap-3 px-4 pt-3.5 pb-1">
                      <h3 className="text-[0.9375rem] font-semibold tracking-[-0.016em] text-[var(--g-ink)]">
                        {tile.name}
                      </h3>
                      <span className="g-num text-[0.8125rem] text-[var(--g-ink-3)] transition-colors group-hover:text-[var(--g-ink)]">
                        {tile.count}
                      </span>
                    </div>
                  </Link>
                  <ul className="flex flex-col px-2 pb-2">
                    {tile.members.slice(0, TILE_LIST).map((member) => (
                      <li key={member.slug}>
                        <Link
                          href={g(`/components/${realSlug(member.slug)}`)}
                          className="flex h-8 items-center gap-2 rounded-lg px-2 text-[0.8125rem] text-[var(--g-ink-3)] transition-colors hover:bg-[var(--g-panel-3)] hover:text-[var(--g-ink)]"
                        >
                          <span className="flex-1 truncate">{member.title}</span>
                          <StatusPill item={member} className="h-[1.125rem] px-1.5 text-[0.625rem]" />
                        </Link>
                      </li>
                    ))}
                    {tile.count > TILE_LIST ? (
                      <li>
                        <Link
                          href={tile.href}
                          className="flex h-8 items-center gap-1 rounded-lg px-2 text-[0.8125rem] font-medium text-[var(--g-ink-2)] hover:text-[var(--g-ink)]"
                        >
                          {tile.count - TILE_LIST} more
                          <ChevronRight aria-hidden="true" className="size-3.5" />
                        </Link>
                      </li>
                    ) : null}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          {/* ------------------------------------------------------ agents */}
          {subject && sources[0] ? (
            <ShipSection component={subject} prompt={prompt} target={sources[0].target} />
          ) : null}
        </div>
      </main>
      <GalleryFooter nav={nav} installCommand={subject?.installCommand ?? "pnpm dlx shadcn@latest add @joinui/…"} />
    </>
  )
}
