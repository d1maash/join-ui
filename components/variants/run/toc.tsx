"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * "On this page", with the section being read marked. The marker follows the
 * last heading that has passed the top quarter of the screen — the one whose
 * text is under the reader's eyes, not the next one waiting below.
 */
export function Toc({
  entries,
}: {
  entries: Array<{ id: string; title: string; level: number }>
}) {
  const [active, setActive] = React.useState<string | null>(entries[0]?.id ?? null)

  React.useEffect(() => {
    const nodes = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((node): node is HTMLElement => node !== null)
    if (nodes.length === 0) return
    const onScroll = () => {
      const line = window.innerHeight * 0.25
      let current = nodes[0]!.id
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= line) current = node.id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [entries])

  return (
    <nav aria-label="On this page" className="flex flex-col">
      <p className="run-label pb-3">On this page</p>
      <ul className="flex flex-col border-l border-white/[0.08]">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={active === entry.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1 text-[13px] leading-[1.45] transition-colors",
                entry.level === 3 ? "pl-6" : "pl-4",
                active === entry.id
                  ? "border-[#f5f5f7] text-[#f5f5f7]"
                  : "border-transparent text-[#77777c] hover:text-[#c7c7cc]"
              )}
            >
              {entry.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
