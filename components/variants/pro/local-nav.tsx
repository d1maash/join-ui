"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

import { CopyPromptPill } from "./copy"

export interface LocalNavLink {
  id: string
  label: string
}

/*
 * The product sub-nav: the component's name on the left at 21px, its sections
 * at 12px on the right, and the one action — Copy prompt — as a small blue
 * pill. It takes the top edge once the global nav has scrolled away, and the
 * section in view is marked as you read. On a phone the sections fold under
 * a chevron, as they do on apple.com.
 */
export function LocalNav({ title, links }: { title: string; links: LocalNavLink[] }) {
  const [current, setCurrent] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const [stuck, setStuck] = React.useState(false)
  const sentinel = React.useRef<HTMLDivElement>(null)

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
    const sections = links
      .map((link) => document.getElementById(link.id))
      .filter((node): node is HTMLElement => node !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target.id)
      },
      { rootMargin: "-30% 0px -60% 0px" }
    )
    for (const section of sections) observer.observe(section)
    return () => observer.disconnect()
  }, [links])

  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="h-0" />
      <div data-pro-localnav className="sticky top-0 z-[90]">
        <nav
          aria-label={`${title} sections`}
          className={cn(
            "pro-localnav border-b transition-colors duration-300",
            stuck ? "border-white/[0.12]" : "border-white/[0.08]"
          )}
        >
          <div className="mx-auto flex h-[52px] max-w-[1080px] items-center gap-4 px-4 sm:px-[22px]">
            <a
              href="#top"
              className="min-w-0 truncate rounded-sm text-[19px] font-semibold tracking-[-0.025em] text-[#f5f5f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2997ff] sm:text-[21px]"
            >
              {title}
            </a>

            <ul className="ml-auto hidden items-center gap-6 md:flex">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    aria-current={current === link.id ? "location" : undefined}
                    className={cn(
                      "rounded-sm text-[12px] tracking-[-0.01em] transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2997ff]",
                      current === link.id
                        ? "text-[#f5f5f7]"
                        : "text-[#f5f5f7]/70 hover:text-[#2997ff]"
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="pro-localnav-menu"
              aria-label={open ? "Hide sections" : "Show sections"}
              className="ml-auto flex size-9 cursor-pointer items-center justify-center rounded-full text-[#e8e8ed] focus-visible:outline-2 focus-visible:outline-[#2997ff] md:hidden"
            >
              <ChevronDown
                aria-hidden="true"
                className={cn("size-4 transition-transform duration-300", open && "rotate-180")}
              />
            </button>

            <CopyPromptPill size="sm" className="h-7 px-3 text-[12px]" />
          </div>

          <ul
            id="pro-localnav-menu"
            hidden={!open}
            className="border-t border-white/[0.08] px-4 pt-2 pb-4 md:hidden"
          >
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={() => setOpen(false)}
                  aria-current={current === link.id ? "location" : undefined}
                  className="block rounded-md py-2.5 text-[17px] text-[#e8e8ed] focus-visible:outline-2 focus-visible:outline-[#2997ff]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}
