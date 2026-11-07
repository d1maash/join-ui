"use client"

import * as React from "react"

export interface IxTocEntry {
  id: string
  title: string
  level: 2 | 3
}

/**
 * "On this page", with the section being read marked. The marker follows the
 * last heading that has scrolled past the top third of the viewport.
 */
export function IxToc({ entries }: { entries: IxTocEntry[] }) {
  const [active, setActive] = React.useState<string | null>(entries[0]?.id ?? null)

  React.useEffect(() => {
    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((node): node is HTMLElement => node !== null)
    if (headings.length === 0) return

    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.3
      let current = headings[0]!.id
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= line) current = heading.id
        else break
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = headings[headings.length - 1]!.id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [entries])

  if (entries.length === 0) return null

  return (
    <nav aria-label="On this page">
      <p className="ix-mono ix-fg-3 mb-2 text-[0.6875rem] tracking-[0.04em] uppercase">On this page</p>
      <ul className="border-l border-[var(--ix-line)]">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              data-level={entry.level}
              data-active={active === entry.id ? "" : undefined}
              aria-current={active === entry.id ? "location" : undefined}
              className="ix-toc-link"
            >
              {entry.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
