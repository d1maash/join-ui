import type * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { variantBase, VARIANTS } from "@/lib/variants"

export const metadata: Metadata = {
  title: "Design variants",
  robots: { index: false, follow: false },
}

/*
 * The chooser. Three complete versions of the site, each one a door into
 * every page it has. Painted in fixed colours rather than tokens, because it
 * belongs to none of the variants it introduces.
 */
const BACKDROP: Record<string, React.CSSProperties | undefined> = {}

const SWATCH: Record<string, string> = {
  index: "bg-[#0a0a0a] text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]",
  studio: "bg-white text-[#0a0a0a] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]",
  gallery: "bg-[linear-gradient(160deg,#0b1020_0%,#0a0a0f_55%,#000_100%)] text-white",
}

export default function VariantsPage() {
  return (
    <main
      id="main-content"
      className="light min-h-dvh bg-[#f5f5f7] px-4 py-16 text-[#1d1d1f] sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[17px] font-semibold text-[#6e6e73]">Join UI redesign</p>
        <h1 className="mt-2 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
          Pick a direction.
        </h1>
        <p className="mt-5 max-w-2xl text-[19px] leading-[1.45] text-[#6e6e73]">
          Three complete versions of the site, each built around one idea. Every one renders the
          landing page, the catalog, each component page and the docs. The pill at
          the bottom of every page jumps to the same screen in another variant.
        </p>

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {VARIANTS.map((variant) => (
            <li key={variant.id}>
              <Link
                href={variantBase(variant.id)}
                className={cn(
                  "group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[28px] p-8",
                  "transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.015]",
                  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3]",
                  SWATCH[variant.id]
                )}
                style={BACKDROP[variant.id]}
              >
                <div>
                  <p className="text-[13px] font-semibold tracking-wide uppercase opacity-60">
                    {variant.scheme === "dark" ? "Dark" : "Light"}
                  </p>
                  <h2 className="mt-2 text-[44px] leading-none font-semibold tracking-[-0.03em]">
                    {variant.name}
                  </h2>
                  <p className="mt-4 text-[17px] leading-[1.4] opacity-80">
                    {variant.tagline}
                  </p>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <p className="text-[13px] leading-snug opacity-55">{variant.reference}</p>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-current/10 transition-colors group-hover:bg-current/15">
                    <ArrowUpRight aria-hidden="true" className="size-5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-1 text-[17px] text-[#0066cc] hover:underline"
        >
          Compare with the original site
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </main>
  )
}
