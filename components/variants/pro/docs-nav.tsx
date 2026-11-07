"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export interface DocsNavSection {
  title: string
  items: Array<{ title: string; href: string; label?: string }>
}

/*
 * The docs sidebar, developer.apple.com style: quiet section titles, the
 * current page in white on a soft fill, everything else grey until hovered.
 */
export function DocsSidebar({
  sections,
  currentHref,
}: {
  sections: DocsNavSection[]
  /** The page being read — `/docs` itself stands for the introduction. */
  currentHref?: string
}) {
  const pathname = usePathname()
  const here = currentHref ?? pathname

  return (
    <nav aria-label="Documentation" className="flex flex-col gap-8 pb-10">
      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="px-3 text-[12px] font-semibold tracking-[-0.005em] text-[#86868b]">
            {section.title}
          </h2>
          <ul className="mt-2 flex flex-col gap-px">
            {section.items.map((item) => {
              const active = here === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-[10px] px-3 py-[7px] text-[14px] tracking-[-0.01em] transition-colors",
                      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2997ff]",
                      active
                        ? "bg-white/[0.1] font-medium text-[#f5f5f7]"
                        : "text-[#a1a1a6] hover:text-[#f5f5f7]"
                    )}
                  >
                    {item.title}
                    {item.label ? (
                      <span className="text-[11px] font-semibold text-[#ff9f0a]">{item.label}</span>
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/** The same sections folded under one button, for screens without a sidebar. */
export function DocsMobileMenu({
  sections,
  current,
  currentHref,
}: {
  sections: DocsNavSection[]
  current: string
  currentHref: string
}) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  const [lastPath, setLastPath] = React.useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="pro-docs-menu"
        className="flex h-12 w-full cursor-pointer items-center justify-between rounded-[14px] bg-[#161617] px-4 text-left text-[15px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)] focus-visible:outline-2 focus-visible:outline-[#2997ff]"
      >
        <span>
          <span className="text-[#86868b]">Docs</span>
          <span aria-hidden="true" className="mx-2 text-[#6e6e73]">
            /
          </span>
          <span className="font-medium text-[#f5f5f7]">{current}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 text-[#a1a1a6] transition-transform", open && "rotate-180")}
        />
      </button>
      <div
        id="pro-docs-menu"
        hidden={!open}
        className="mt-2 rounded-[18px] bg-[#161617] px-2 pt-5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)]"
      >
        <DocsSidebar sections={sections} currentHref={currentHref} />
      </div>
    </div>
  )
}

export interface TocItem {
  id: string
  title: string
  level: 2 | 3
}

export function DocsToc({ entries }: { entries: TocItem[] }) {
  const [active, setActive] = React.useState<string | null>(entries[0]?.id ?? null)

  React.useEffect(() => {
    const nodes = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((node): node is HTMLElement => node !== null)
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records.filter((record) => record.isIntersecting)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-80px 0px -70% 0px" }
    )
    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [entries])

  return (
    <nav aria-label="On this page">
      <h2 className="text-[12px] font-semibold text-[#86868b]">On this page</h2>
      <ul className="mt-3 flex flex-col border-l border-white/[0.1]">
        {entries.map((entry) => {
          const on = entry.id === active
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={on ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-1.5 text-[13px] leading-[1.35] tracking-[-0.005em] transition-colors",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2997ff]",
                  entry.level === 3 ? "pl-6" : "pl-4",
                  on
                    ? "border-[#f5f5f7] text-[#f5f5f7]"
                    : "border-transparent text-[#86868b] hover:text-[#f5f5f7]"
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
