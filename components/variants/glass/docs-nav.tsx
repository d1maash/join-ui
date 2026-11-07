"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"

import type { SidebarSection } from "@/lib/docs/sidebar"
import type { TocEntry } from "@/lib/mdx/source"
import { cn } from "@/lib/utils"

import { useActiveSection } from "./hooks"
import { g, LENS_SPRING } from "./ui"

/**
 * The docs sidebar as macOS Tahoe draws one: a floating pane of glass inset
 * from the window edge, the full height of the view, scrolling on its own.
 * The current page is marked by a tinted lens that glides to the next page as
 * you move through the guides — the sidebar lives in the docs layout, so it
 * survives the navigation and keeps its scroll position too.
 */
export function DocsSidebar({ sections }: { sections: SidebarSection[] }) {
  const pathname = usePathname()
  const current = pathname === g("/docs") ? g("/docs/introduction") : pathname

  return (
    <nav
      aria-label="Documentation"
      className="g-glass g-thick flex h-full flex-col overflow-hidden rounded-[30px]"
    >
      <div className="overflow-y-auto overscroll-contain px-3 py-5 [scrollbar-width:thin]">
        {sections.map((section, index) => (
          <div key={section.title} className={cn(index > 0 && "mt-6")}>
            <p className="px-3 pb-1.5 text-[12px] font-semibold text-[#56565b]">
              {section.title}
            </p>
            <ul className="flex flex-col gap-px">
              {section.items.map((item) => {
                const active = item.href === current
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-8 items-center justify-between gap-2 rounded-[10px] px-3 text-[14px] tracking-[-0.016em] transition-colors duration-200",
                        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0071e3]",
                        active
                          ? "font-medium text-[#0058b8]"
                          : "text-[#1d1d1f] hover:bg-black/[0.045]"
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId="g-docs-lens"
                          transition={LENS_SPRING}
                          aria-hidden="true"
                          className="absolute inset-0 rounded-[10px] bg-[#0071e3]/[0.12] shadow-[inset_0_0_0_0.5px_rgb(0_113_227/0.16)]"
                        />
                      ) : null}
                      <span className="relative truncate">{item.title}</span>
                      {item.label ? (
                        <span className="relative shrink-0 text-[11px] font-medium text-[#56565b]">
                          {item.label}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}

/**
 * On-page contents, on a thin pane to the right of the article. The heading in
 * view is marked by a short bar that slides along the rail.
 */
export function DocsToc({ entries }: { entries: TocEntry[] }) {
  const ids = React.useMemo(() => entries.map((entry) => entry.id), [entries])
  const active = useActiveSection(ids, 180) ?? entries[0]?.id ?? null

  if (entries.length === 0) return null

  return (
    <nav aria-label="On this page" className="g-glass g-thin rounded-[26px] px-2 py-4">
      <p className="px-4 pb-2 text-[12px] font-semibold text-[#3a3a3e]">On this page</p>
      <ul className="relative flex flex-col">
        {entries.map((entry) => {
          const current = entry.id === active
          return (
            <li key={entry.id} className="relative">
              {current ? (
                <motion.span
                  layoutId="g-toc-bar"
                  transition={LENS_SPRING}
                  aria-hidden="true"
                  className="absolute top-1.5 bottom-1.5 left-1.5 w-[3px] rounded-full bg-[#0071e3]"
                />
              ) : null}
              <a
                href={`#${entry.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "block rounded-lg py-1.5 pr-3 text-[13px] leading-[1.35] tracking-[-0.01em] transition-colors",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0071e3]",
                  entry.level === 3 ? "pl-7" : "pl-4",
                  current ? "font-medium text-[#1d1d1f]" : "text-[#3a3a3e] hover:text-[#1d1d1f]"
                )}
              >
                {entry.title}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
