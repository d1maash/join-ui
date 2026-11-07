"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight } from "lucide-react"

import { variantHref } from "@/lib/variants"

import { IxSearchTrigger } from "./search"

interface Entry {
  id: string
  title: string
  href: string
  code?: string
  group: string
  keywords: string[]
}

/** How alike two strings are, 0–1, by shared letter pairs. */
function likeness(a: string, b: string): number {
  const pairs = (value: string) => {
    const out = new Map<string, number>()
    for (let i = 0; i < value.length - 1; i += 1) {
      const pair = value.slice(i, i + 2)
      out.set(pair, (out.get(pair) ?? 0) + 1)
    }
    return out
  }
  const left = pairs(a)
  const right = pairs(b)
  let shared = 0
  for (const [pair, count] of left) shared += Math.min(count, right.get(pair) ?? 0)
  const total = Math.max(1, a.length - 1 + b.length - 1)
  return (2 * shared) / total
}

/**
 * One boxed cell: the error, the address that missed, and the nearest things
 * that do exist — ranked by how much the last segment of the address looks
 * like their name, so a mistyped slug usually finds its component.
 */
export function IxNotFound({ entries }: { entries: Entry[] }) {
  const pathname = usePathname()
  const last = decodeURIComponent(pathname.split("/").filter(Boolean).pop() ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

  const nearest = last
    ? entries
        .map((entry) => ({
          entry,
          score: Math.max(
            likeness(last, entry.title.toLowerCase()),
            ...entry.keywords.slice(0, 2).map((keyword) => likeness(last, keyword.toLowerCase().replace(/-/g, " ")))
          ),
        }))
        .filter(({ score }) => score > 0.25)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map(({ entry }) => entry)
    : []

  return (
    <div className="ix-frame ix-rule-b flex flex-1 items-center justify-center px-4 py-16 md:py-24">
      <div className="w-full max-w-[40rem] border border-[var(--ix-line-2)] bg-[var(--ix-cell)]">
        <div className="ix-mono flex h-10 items-center justify-between gap-3 border-b border-[var(--ix-line)] px-4">
          <span className="ix-accent">ERR-404</span>
          <span className="ix-fg-3">not in the index</span>
        </div>
        <div className="px-5 py-8 md:px-8">
          <h1 className="text-[1.625rem] leading-tight font-semibold tracking-[-0.035em] md:text-[2rem]">
            No component or page at this address.
          </h1>
          <p className="ix-mono mt-4 overflow-x-auto border border-[var(--ix-line)] bg-[var(--ix-bg)] px-3 py-2.5 whitespace-nowrap text-[var(--ix-fg-2)]">
            <span aria-hidden="true" className="ix-fg-3 mr-2">
              ›
            </span>
            {pathname}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={variantHref("index", "/components")} className="ix-btn ix-btn-primary">
              Browse components
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={variantHref("index", "/docs")} className="ix-btn">
              Read the docs
            </Link>
            <IxSearchTrigger label="Search" className="!h-9" />
          </div>
        </div>
        {nearest.length > 0 ? (
          <div className="border-t border-[var(--ix-line)]">
            <p className="ix-mono ix-fg-3 px-5 pt-4 pb-2 md:px-8">Did you mean</p>
            <ul className="pb-3">
              {nearest.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={entry.href}
                    className="flex items-center gap-3 px-5 py-2 text-[0.875rem] transition-colors hover:bg-white/[0.03] md:px-8"
                  >
                    <span className="ix-mono ix-fg-3 w-12">{entry.code ?? "DOC"}</span>
                    <span className="flex-1">{entry.title}</span>
                    <ArrowRight aria-hidden="true" className="ix-fg-3 size-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="ix-mono ix-fg-3 flex h-10 items-center gap-4 border-t border-[var(--ix-line)] px-4">
          <Link href={variantHref("index", "/")} className="hover:text-[var(--ix-fg)]">
            ← Index home
          </Link>
          <span className="ml-auto">{entries.filter((entry) => entry.group === "Components").length} components indexed</span>
        </div>
      </div>
    </div>
  )
}
