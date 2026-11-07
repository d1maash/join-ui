"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { Thumb } from "./live"
import { CropMarks } from "./marks"

export interface ContentsEntry {
  slug: string
  no: string
  title: string
  purpose: string
  category: string
  status: string
  href: string
}

/*
 * The contents page. Each row is a plate: its number, its name, what it is
 * for, its category, and a dotted leader to the plate it opens. Pointing at a
 * row — or tabbing to it — develops that plate's live miniature in the frame
 * beside the list, the way a contact sheet is read with a loupe.
 */
export function Contents({ entries }: { entries: ContentsEntry[] }) {
  const [active, setActive] = React.useState(entries[1]?.slug ?? entries[0]?.slug ?? "")
  const current = entries.find((entry) => entry.slug === active) ?? entries[0]

  return (
    <div className="sp-grid gap-y-10">
      <ol className="col-span-4 border-t border-[var(--sp-ink)] lg:col-span-7">
        {entries.map((entry) => {
          const isActive = entry.slug === active
          return (
            <li key={entry.slug} className="border-b border-[var(--sp-rule)]">
              <Link
                href={entry.href}
                onPointerEnter={() => setActive(entry.slug)}
                onFocus={() => setActive(entry.slug)}
                data-active={isActive ? "" : undefined}
                className="sp-toc-row group grid grid-cols-[2.5rem_1fr] items-baseline gap-x-3 py-5 sm:grid-cols-[3.25rem_1fr] lg:py-6"
              >
                <span className="sp-mono text-[13px] text-[var(--sp-ink-2)]">{entry.no}</span>
                <span className="min-w-0">
                  <span className="flex items-baseline gap-4">
                    <span className="sp-toc-title text-[clamp(24px,2.5vw,34px)] leading-[1.05] font-semibold tracking-[-0.025em]">
                      {entry.title}
                    </span>
                    <span aria-hidden="true" className="sp-leaders hidden sm:block" />
                    <span className="sp-label hidden shrink-0 sm:inline">{entry.category}</span>
                  </span>
                  <span className="mt-2 block max-w-[52ch] text-[15px] leading-[1.45] text-[var(--sp-ink-2)]">
                    {entry.purpose}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>

      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-[calc(var(--sp-head)+40px)]">
          <div className="sp-board relative aspect-[5/4] overflow-hidden">
            <CropMarks />
            <span aria-hidden="true" className="sp-scale" />
            <div className="pointer-events-none absolute inset-x-4 top-3 z-10 flex justify-between">
              <span className="sp-label">Preview</span>
              <span className="sp-label">PL. {current?.no}</span>
            </div>
            {current ? (
              <div key={current.slug} className="sp-thumb-frame absolute inset-0 px-6 pt-10 pb-6">
                <Thumb slug={current.slug} />
              </div>
            ) : null}
          </div>
          <p className="mt-4 flex items-baseline justify-between gap-4 border-t border-[var(--sp-rule)] pt-3">
            <span className="sp-serif text-[19px] leading-tight text-[var(--sp-ink-2)]">
              {current?.title}, in miniature.
            </span>
            <span className={cn("sp-label shrink-0")}>{current?.status}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
