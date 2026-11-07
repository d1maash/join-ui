import type * as React from "react"
import Link from "next/link"

import { GitHubIcon } from "@/components/site/icons"
import { SearchCommand } from "@/components/site/search-command"
import { buildSearchIndex } from "@/lib/search"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"
import { variantHref } from "@/lib/variants"

import { HeadNav, RunningTitle, SpecimenMenu } from "./head-client"
import { getPlateIndex, href } from "./plates"

/*
 * The running head. A manual's page carries the book's name on one side and
 * the chapter on the other; this one carries the wordmark, the section the
 * reader is in (it follows the scroll), and the four ways out.
 */
export function RunningHead() {
  const plates = getPlateIndex()
  const index = buildSearchIndex().map((entry) => ({
    ...entry,
    href: variantHref("specimen", entry.href),
  }))

  return (
    <header className="sp-head">
      <div className="sp-wrap flex h-full items-center gap-3 lg:gap-6">
        <Link
          href={href("/")}
          className="group flex shrink-0 items-center gap-2.5 rounded-[2px]"
          aria-label="Join UI field manual, cover"
        >
          <Mark className="size-[18px] transition-transform duration-500 ease-[var(--sp-ease)] group-hover:rotate-90" />
          <span className="text-[17px] font-semibold tracking-[-0.02em]">Join UI</span>
          <span className="sp-label hidden sm:inline">Field manual</span>
        </Link>

        <span aria-hidden="true" className="hidden h-4 w-px bg-[var(--sp-rule-strong)] md:block" />

        <RunningTitle
          plates={plates.map(({ slug, no, title }) => ({ slug, no, title }))}
        />

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <HeadNav />
          <div className="sp-btns hidden sm:block">
            <SearchCommand index={index} />
          </div>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer noopener"
            className="sp-navlink !px-2"
          >
            <GitHubIcon aria-hidden="true" className="size-[18px]" />
            <span className="sr-only">Join UI on GitHub (opens in a new tab)</span>
          </a>
          <SpecimenMenu plates={plates} />
        </div>
      </div>
    </header>
  )
}

/** A registration target: the mark a printer aligns the plates by. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={cn("shrink-0", className)}>
      <circle cx="10" cy="10" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 0v20M0 10h20" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2.25" fill="currentColor" />
    </svg>
  )
}

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only z-[100] focus:not-sr-only focus:fixed focus:top-2 focus:left-3 focus:bg-[#111] focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
    >
      Skip to content
    </a>
  )
}

/** Ticks down the left margin; the orange mark is how far through you are. */
export function MarginRuler() {
  return (
    <div className="sp-ruler" aria-hidden="true">
      <span className="sp-ruler-mark" />
    </div>
  )
}

/*
 * The colophon. Set the way a book sets it: small, in one column of prose
 * and one of facts, with nothing in it the reader did not come looking for.
 */
export function Colophon() {
  const plates = getPlateIndex()
  return (
    <footer className="sp-wrap mt-32 pb-28 lg:mt-44">
      <div className="border-t border-[var(--sp-ink)] pt-6">
        <div className="sp-grid gap-y-10">
          <div className="col-span-4 lg:col-span-4">
            <p className="sp-label">Colophon</p>
            <p className="mt-4 max-w-[34ch] text-[15px] leading-[1.6] text-[var(--sp-ink-2)]">
              <span className="text-[var(--sp-ink)]">Join UI, field manual, volume one.</span>{" "}
              Seven plates, drawn from the same records that build the registry, so the
              parts lettered here are the parts in the file you install.
            </p>
          </div>

          <dl className="col-span-2 flex flex-col gap-4 text-[13px] leading-[1.5] lg:col-span-3">
            <Fact term="Typefaces">
              Inter Tight for text and display. Instrument Serif for captions. JetBrains
              Mono for anything a machine also reads.
            </Fact>
            <Fact term="Paper and ink">
              #efeee9 and #111. One signal, international orange, #ff4f00.
            </Fact>
          </dl>

          <dl className="col-span-2 flex flex-col gap-4 text-[13px] leading-[1.5] lg:col-span-2">
            <Fact term="Licence">MIT. Copy it, change it, ship it.</Fact>
            <Fact term="Standard">WCAG 2.2 AA, reduced-motion stills.</Fact>
            <Fact term="Registry">{siteConfig.namespace}, shadcn CLI</Fact>
          </dl>

          <nav aria-label="Colophon" className="col-span-4 lg:col-span-3">
            <p className="sp-label">Plates</p>
            <ul className="mt-3 grid grid-cols-1 gap-y-1 text-[14px]">
              {plates.map((plate) => (
                <li key={plate.slug}>
                  <Link
                    href={plate.href}
                    className="group flex items-baseline gap-3 rounded-[2px] py-0.5 hover:text-[var(--sp-ink)]"
                  >
                    <span className="sp-mono w-6 text-[11px] text-[var(--sp-ink-2)]">
                      {plate.no}
                    </span>
                    <span className="underline-offset-4 group-hover:underline">
                      {plate.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[14px]">
              <li>
                <Link href={href("/docs")} className="underline-offset-4 hover:underline">
                  Manual
                </Link>
              </li>
              <li>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline-offset-4 hover:underline"
                >
                  GitHub<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a href="/r/registry.json" className="underline-offset-4 hover:underline">
                  registry.json
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.issues}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline-offset-4 hover:underline"
                >
                  Issues<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-wrap items-end justify-between gap-6 border-t border-[var(--sp-rule)] pt-5">
          <p className="sp-serif text-[22px] leading-none text-[var(--sp-ink-2)]">
            Printed on nothing. Moves anyway.
          </p>
          <p className="sp-label">Vol. 1 — Ed. 11.2026 — {siteConfig.author}</p>
        </div>
      </div>
    </footer>
  )
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="sp-label">{term}</dt>
      <dd className="mt-1 text-[var(--sp-ink)]">{children}</dd>
    </div>
  )
}
