"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronDown, LayoutGrid } from "lucide-react"

import { cn } from "@/lib/utils"
import { stripVariant, variantHref, VARIANTS, type VariantId } from "@/lib/variants"

/*
 * A review tool, not part of any design: a small pill pinned to the bottom of
 * every variant that jumps to the same page in another variant (or in the
 * original site), so two versions of one screen can be compared in place.
 *
 * Its colours are written out rather than taken from the tokens on purpose —
 * every variant redefines those, and the switcher has to look the same on a
 * black stage, a white shelf and a glass wallpaper alike.
 */
export function VariantSwitcher({ current }: { current: VariantId }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = React.useState(true)

  const sitePath = stripVariant(pathname)
  const query = searchParams.toString()
  const suffix = query ? `?${query}` : ""

  const options: Array<{ id: VariantId | "original"; label: string; href: string }> = [
    ...VARIANTS.map((variant) => ({
      id: variant.id,
      label: variant.name,
      href: `${variantHref(variant.id, sitePath)}${suffix}`,
    })),
    { id: "original", label: "Original", href: `${sitePath}${suffix}` },
  ]

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[200] flex justify-center px-4 print:hidden"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif" }}
    >
      <nav
        aria-label="Design variants"
        className={cn(
          "pointer-events-auto flex items-center gap-1 rounded-full p-1 text-[13px] text-white",
          "bg-[rgb(30_30_32/0.78)] shadow-[0_8px_32px_rgb(0_0_0/0.35),inset_0_0_0_0.5px_rgb(255_255_255/0.18)]",
          "backdrop-blur-xl backdrop-saturate-150"
        )}
      >
        <Link
          href="/v"
          aria-label="All variants"
          className="flex size-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LayoutGrid aria-hidden="true" className="size-4" />
        </Link>
        {open ? (
          <ul className="flex items-center gap-0.5">
            {options.map((option) => {
              const active = option.id === current
              return (
                <li key={option.id}>
                  <Link
                    href={option.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-8 items-center rounded-full px-3.5 font-medium transition-colors",
                      active
                        ? "bg-white text-black"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {option.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <span className="px-2 font-medium text-white/80">
            {VARIANTS.find((variant) => variant.id === current)?.name}
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Collapse the variant switcher" : "Expand the variant switcher"}
          className="flex size-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 transition-transform", open ? "" : "rotate-180")}
          />
        </button>
      </nav>
    </div>
  )
}

/**
 * The switcher as a variant layout should mount it: `useSearchParams` needs a
 * Suspense boundary on a statically rendered route, so the boundary ships with
 * the component instead of being every caller's job.
 */
export function VariantSwitcherDock({ current }: { current: VariantId }) {
  return (
    <React.Suspense fallback={null}>
      <VariantSwitcher current={current} />
    </React.Suspense>
  )
}
