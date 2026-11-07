"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

import { AirCopyPrompt } from "./copy"

export interface LocalNavSection {
  id: string
  label: string
}

/*
 * The local nav, as every Apple product page has one: the product's name on
 * the left, a few small section links on the right, and the one action — here
 * "Copy prompt" — as a small blue pill at the end. It sticks to the top of the
 * window once the global nav has scrolled away (air.css makes the global nav
 * static whenever a local nav is on the page).
 *
 * The section the reader is in is tracked with an IntersectionObserver and
 * marked `aria-current`. On a phone the links fold behind a chevron, the way
 * Apple's do.
 */
export function LocalNav({
  title,
  sections,
  prompt,
}: {
  title: string
  sections: LocalNavSection[]
  prompt: string
}) {
  const [active, setActive] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const [stuck, setStuck] = React.useState(false)
  const sentinel = React.useRef<HTMLDivElement>(null)
  const menuId = React.useId()

  React.useEffect(() => {
    const element = sentinel.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry?.isIntersecting), {
      threshold: 0,
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null)
    if (targets.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-64px 0px -60% 0px", threshold: 0 }
    )
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [sections])

  React.useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="h-px" />
      <nav
        data-air-localnav=""
        aria-label={`${title} sections`}
        className={cn(
          "air-frost sticky top-0 z-40 transition-[border-color] duration-300",
          stuck ? "border-b border-[rgb(0_0_0/0.08)]" : "border-b border-[#d2d2d7]/0"
        )}
      >
        <div className="mx-auto flex h-[52px] max-w-[75rem] items-center gap-4 px-5">
          <a
            href="#top"
            className="min-w-0 truncate rounded-sm text-[19px] font-semibold tracking-[-0.022em] text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-[#0071e3] sm:text-[21px]"
          >
            {title}
          </a>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <ul className="hidden items-center gap-6 md:flex">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={active === section.id ? "location" : undefined}
                    className={cn(
                      "rounded-sm text-[12px] tracking-[-0.006em] transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3]",
                      active === section.id
                        ? "text-[#1d1d1f]"
                        : "text-[#1d1d1f]/72 hover:text-[#0066cc]"
                    )}
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? "Hide sections" : "Show sections"}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#1d1d1f]/80 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0071e3] md:hidden"
            >
              <ChevronDown
                aria-hidden="true"
                strokeWidth={2}
                className={cn("size-4 transition-transform duration-300", open && "rotate-180")}
              />
            </button>

            <span className="pl-2">
              <AirCopyPrompt prompt={prompt} componentName={title} size="sm" />
            </span>
          </div>
        </div>

        {open ? (
          <ul
            id={menuId}
            className="air-flyout border-t border-[rgb(0_0_0/0.06)] px-5 pt-2 pb-5 md:hidden"
            data-state="open"
          >
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={() => setOpen(false)}
                  aria-current={active === section.id ? "location" : undefined}
                  className="block rounded-md py-2.5 text-[17px] text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-[#0071e3]"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </nav>
    </>
  )
}
