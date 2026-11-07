"use client"

import type * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

import { GlassCopy } from "./copy"
import { useActiveSection } from "./hooks"
import { g, LENS_SPRING } from "./ui"

/**
 * The product page's local navigation: a wide bar of glass that sticks under
 * the global capsule, naming the component on the left and its sections on the
 * right, with the one action the page exists for — Copy prompt — at the end.
 * The section in view carries the lens.
 */
export function LocalNav({
  title,
  links,
  spy,
  prompt,
}: {
  title: string
  links: Array<{ id: string; label: string }>
  /** The ids the scroll spy follows, in document order. */
  spy: string[]
  prompt: string
}) {
  const active = useActiveSection(spy, 200)

  return (
    <div className="pointer-events-none sticky top-[70px] z-40 px-3 sm:px-5">
      <nav
        aria-label={`${title} sections`}
        className="g-glass pointer-events-auto mx-auto flex h-[52px] max-w-[1180px] items-center gap-2 rounded-full pr-1.5 pl-5 [--g-fill:0.66]"
      >
        <Link
          href={g("/components")}
          className="mr-auto min-w-0 truncate rounded-sm text-[17px] font-semibold tracking-[-0.022em] text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
        >
          <span className="sr-only">Components: </span>
          {title}
        </Link>

        <ul className="hidden items-center lg:flex">
          {links.map((link) => {
            const current = active === link.id
            return (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={current ? "location" : undefined}
                  className={cn(
                    "relative flex h-8 items-center rounded-full px-3 text-[13px] tracking-[-0.01em] transition-colors duration-200",
                    "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3]",
                    current ? "text-[#1d1d1f]" : "text-[#3a3a3e] hover:text-[#1d1d1f]"
                  )}
                >
                  {current ? (
                    <motion.span
                      layoutId="g-local-lens"
                      transition={LENS_SPRING}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-black/[0.06]"
                    />
                  ) : null}
                  <span className="relative">{link.label}</span>
                </a>
              </li>
            )
          })}
        </ul>

        <GlassCopy
          value={prompt}
          kind="prompt"
          idle="Copy prompt"
          toastMessage={`${title} prompt copied`}
          tone="primary"
          size="sm"
          className="ml-2"
        />
      </nav>
    </div>
  )
}
