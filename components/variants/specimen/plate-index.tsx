"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"

import { Thumb } from "./live"
import { CropMarks } from "./marks"

export interface IndexPlate {
  slug: string
  no: string
  title: string
  purpose: string
  category: string
  status: string
  since: string
  packages: string
  href: string
}

const ALL = "All"

/*
 * The index of plates. Categories are binder tabs along the top edge of the
 * sheet — the one you are in is cut into the sheet below it — and the plates
 * are either laid out as cards, each with its live miniature on a scrap of
 * drafting board, or set as a dense index for reading down. The category
 * lives in `?category=` so a shared link, the back button and the search
 * results all land on the same tab; the view is the reader's own.
 */
export function PlateIndex({
  plates,
  categories,
}: {
  plates: IndexPlate[]
  categories: Array<{ name: string; count: number }>
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const requested = searchParams.get("category") ?? ALL
  const known = requested === ALL || categories.some((entry) => entry.name === requested)
  const [view, setView] = React.useState<"plates" | "index">("plates")

  const shown = requested === ALL ? plates : plates.filter((plate) => plate.category === requested)

  const tabs = [{ name: ALL, count: plates.length }, ...categories]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <nav aria-label="Categories" className="-mb-px min-w-0 overflow-x-auto">
          <ul className="flex items-end gap-1">
            {tabs.map((tab) => {
              const active = tab.name === requested
              const query = tab.name === ALL ? "" : `?category=${encodeURIComponent(tab.name)}`
              return (
                <li key={tab.name} className="shrink-0">
                  <Link
                    href={`${pathname}${query}`}
                    scroll={false}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-11 items-center gap-2.5 rounded-t-[6px] border border-b-0 px-4 text-[14px] font-medium transition-colors",
                      active
                        ? "h-12 border-[var(--sp-ink)] bg-[var(--sp-sheet)] text-[var(--sp-ink)]"
                        : "border-[var(--sp-rule)] bg-[var(--sp-plate)] text-[var(--sp-ink-2)] hover:bg-[var(--sp-sheet)] hover:text-[var(--sp-ink)]"
                    )}
                  >
                    {tab.name}
                    <span className="sp-mono text-[11px] text-[var(--sp-ink-2)]">
                      {String(tab.count).padStart(2, "0")}
                    </span>
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 -bottom-px h-px bg-[var(--sp-sheet)]"
                      />
                    ) : null}
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute top-[-1px] left-3 h-[2px] w-5 bg-[var(--sp-signal)]"
                      />
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div role="group" aria-label="Layout" className="mb-2 flex items-center gap-1">
          {(["plates", "index"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={cn(
                "sp-label h-8 cursor-pointer rounded-[2px] px-3 transition-colors",
                view === option
                  ? "bg-[var(--sp-ink)] !text-white"
                  : "hover:bg-[rgb(17_17_17/0.06)] hover:!text-[var(--sp-ink)]"
              )}
            >
              {option === "plates" ? "Plates" : "Index"}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-[var(--sp-ink)] bg-[var(--sp-sheet)] px-4 pt-8 pb-10 sm:px-8 lg:px-10 lg:pt-10">
        {!known ? (
          <EmptySheet
            message={`Nothing is filed under “${requested}”.`}
            href={pathname}
          />
        ) : shown.length === 0 ? (
          <EmptySheet message={`No plates in ${requested} yet.`} href={pathname} />
        ) : view === "plates" ? (
          <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((plate) => (
              <li key={plate.slug}>
                <PlateCard plate={plate} />
              </li>
            ))}
          </ul>
        ) : (
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Plates{requested === ALL ? "" : ` in ${requested}`}
            </caption>
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-[var(--sp-ink)]">
                {["No.", "Plate", "Purpose", "Category", "Status", "Entered", "Packages"].map(
                  (heading) => (
                    <th key={heading} scope="col" className="sp-label py-2 pr-4 font-medium">
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {shown.map((plate) => (
                <tr
                  key={plate.slug}
                  className="group grid grid-cols-[3rem_1fr] gap-x-2 border-b border-[var(--sp-rule)] py-4 align-baseline md:table-row md:py-0"
                >
                  <td className="sp-mono py-0 text-[13px] text-[var(--sp-ink-2)] md:py-4 md:pr-4">
                    {plate.no}
                  </td>
                  <th scope="row" className="py-0 pr-4 text-left font-normal md:py-4">
                    <Link
                      href={plate.href}
                      className="text-[19px] font-semibold tracking-[-0.015em] underline-offset-4 hover:underline"
                    >
                      {plate.title}
                    </Link>
                  </th>
                  <td className="col-span-2 py-1 pr-4 text-[14px] leading-[1.45] text-[var(--sp-ink-2)] md:max-w-[38ch] md:py-4">
                    {plate.purpose}
                  </td>
                  <td className="sp-label col-span-2 py-0 pr-4 md:py-4">{plate.category}</td>
                  <td className="sp-label hidden py-4 pr-4 md:table-cell">{plate.status}</td>
                  <td className="sp-mono hidden py-4 pr-4 text-[12px] md:table-cell">
                    {plate.since}
                  </td>
                  <td className="sp-mono hidden py-4 text-[12px] text-[var(--sp-ink-2)] md:table-cell">
                    {plate.packages}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function PlateCard({ plate }: { plate: IndexPlate }) {
  return (
    <Link href={plate.href} className="group block rounded-[2px]">
      <div className="flex items-end justify-between gap-4">
        <span className="sp-display text-[64px] leading-[0.78] tracking-[-0.045em]">
          {plate.no}
        </span>
        <span className="sp-label pb-1 text-right">{plate.category}</span>
      </div>
      <div className="sp-board relative mt-4 aspect-[4/3] overflow-hidden transition-shadow duration-300 group-hover:shadow-[inset_0_0_0_1px_var(--sp-ink)]">
        <CropMarks gap={6} length={10} />
        <span aria-hidden="true" className="sp-scale" />
        <span className="sp-label absolute top-2.5 left-3 z-10">Fig. {plate.no}</span>
        <div className="absolute inset-0 px-5 pt-8 pb-4">
          <Thumb slug={plate.slug} />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h2 className="text-[24px] leading-[1.1] font-semibold tracking-[-0.02em] underline-offset-[6px] group-hover:underline">
          {plate.title}
        </h2>
        <span className="sp-label shrink-0">{plate.status}</span>
      </div>
      <p className="mt-2 text-[15px] leading-[1.5] text-[var(--sp-ink-2)]">{plate.purpose}</p>
    </Link>
  )
}

function EmptySheet({ message, href }: { message: string; href: string }) {
  return (
    <div className="flex flex-col items-start gap-4 py-16">
      <p className="sp-serif text-[28px] leading-tight text-[var(--sp-ink-2)]">{message}</p>
      <Link href={href} className="text-[15px] font-semibold underline underline-offset-[6px]">
        Show every plate
      </Link>
    </div>
  )
}

export function PlateIndexFallback() {
  return (
    <div className="min-h-[60vh] border border-[var(--sp-ink)] bg-[var(--sp-sheet)]" aria-hidden="true" />
  )
}
