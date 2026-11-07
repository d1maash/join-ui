"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

import { AppIcon } from "./app-icon"
import { MaxWindow } from "./max-window"
import { useOs } from "./os"

export interface Chapter {
  title: string
  items: Array<{ title: string; href: string; current: boolean; label?: string }>
}

export interface ReaderLink {
  title: string
  href: string
}

/*
 * Docs, as a reader.
 *
 * Chapters down the side, one opaque page in the middle set for reading —
 * a 68ch measure at 16.5px on a sheet a step above its surround, the way
 * Books and Preview put a page on a darker desk — and an "On this page"
 * column that follows the reader down the page. On a phone it is the page
 * alone, full screen, with the chapters folded into one disclosure at the
 * top.
 */
export function Reader({
  chapters,
  section,
  title,
  description,
  toc,
  previous,
  next,
  children,
}: {
  chapters: Chapter[]
  section?: string
  title: string
  description: string
  toc: Array<{ id: string; title: string; level: 2 | 3 }>
  previous?: ReaderLink
  next?: ReaderLink
  children: React.ReactNode
}) {
  const os = useOs()
  const scroller = React.useRef<HTMLElement>(null)
  const [active, setActive] = React.useState<string | null>(null)

  /* Scroll spy against the reader's own scroller, not the window. */
  React.useEffect(() => {
    const root = scroller.current
    if (!root || toc.length === 0) return
    const headings = toc
      .map((entry) => document.getElementById(entry.id))
      .filter((element): element is HTMLElement => element !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { root: window.matchMedia("(min-width: 768px)").matches ? root : null, rootMargin: "-8% 0px -70% 0px" }
    )
    headings.forEach((heading) => observer.observe(heading))
    return () => observer.disconnect()
  }, [toc])

  const sidebar = (
    <div>
      {chapters.map((chapter) => (
        <div key={chapter.title}>
          <p className="d-source-head">{chapter.title}</p>
          <ul>
            {chapter.items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={item.current ? "page" : undefined} className="d-source-row">
                  {item.title}
                  {item.label ? <span className="d-chip ml-auto h-[18px] text-[10.5px]">{item.label}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )

  return (
    <MaxWindow
      adapt
      title="Docs"
      label="Docs window"
      sidebar={sidebar}
      sidebarLabel="Chapters"
      mainRef={scroller}
      heading={
        <>
          <AppIcon id="docs" className="size-7 shrink-0 drop-shadow-[0_2px_4px_rgb(0_0_0/0.35)] max-md:hidden" />
          <div className="min-w-0 leading-tight max-md:hidden">
            <p className="truncate text-[14px] font-semibold tracking-[-0.012em]">Docs</p>
            <p className="truncate text-[11.5px] text-[var(--d-ink-3)]">
              {section ? `${section} · ` : ""}
              {title}
            </p>
          </div>
        </>
      }
      right={
        <>
          <span className="flex max-md:hidden">
            {previous ? (
              <Link href={previous.href} className="d-btn h-7 w-8 rounded-r-none px-0" aria-label={`Previous: ${previous.title}`}>
                <ChevronLeft aria-hidden="true" className="size-4" />
              </Link>
            ) : (
              <span className="d-btn h-7 w-8 rounded-r-none px-0 opacity-40" aria-hidden="true">
                <ChevronLeft className="size-4" />
              </span>
            )}
            {next ? (
              <Link href={next.href} className="d-btn ml-px h-7 w-8 rounded-l-none px-0" aria-label={`Next: ${next.title}`}>
                <ChevronRight aria-hidden="true" className="size-4" />
              </Link>
            ) : (
              <span className="d-btn ml-px h-7 w-8 rounded-l-none px-0 opacity-40" aria-hidden="true">
                <ChevronRight className="size-4" />
              </span>
            )}
          </span>
          <button type="button" className="d-btn h-7" onClick={() => os.setSpotlightOpen(true)}>
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
              <circle cx="6.8" cy="6.8" r="4.6" stroke="currentColor" strokeWidth="1.7" />
              <path d="m10.4 10.4 3.6 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Search
          </button>
        </>
      }
    >
      <div className="d-reader">
        <article className="d-page">
          <details className="d-phone-only d-chapters">
            <summary>
              Chapters
              <ChevronDown aria-hidden="true" className="size-4" />
            </summary>
            {sidebar}
          </details>
          {section ? <p className="d-page-kicker">{section}</p> : null}
          <h1 className="d-page-title">{title}</h1>
          <p className="d-page-standfirst">{description}</p>
          <div className="d-prose">{children}</div>
          <nav aria-label="Documentation navigation" className="d-page-nav">
            {previous ? (
              <Link href={previous.href} className="d-pn">
                <ChevronLeft aria-hidden="true" className="size-4" />
                <span>
                  <span className="block text-[11.5px] text-[var(--d-ink-3)]">Previous</span>
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={next.href} className="d-pn text-right">
                <span>
                  <span className="block text-[11.5px] text-[var(--d-ink-3)]">Next</span>
                  {next.title}
                </span>
                <ChevronRight aria-hidden="true" className="size-4" />
              </Link>
            ) : null}
          </nav>
        </article>
        {toc.length > 0 ? (
          <aside aria-label="On this page" className="d-toc">
            <p className="d-ins-head">On this page</p>
            <ul>
              {toc.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    aria-current={active === entry.id ? "location" : undefined}
                    className={cn("d-toc-link", entry.level === 3 && "pl-5")}
                  >
                    {entry.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </MaxWindow>
  )
}
