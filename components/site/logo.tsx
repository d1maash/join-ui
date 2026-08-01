import Link from "next/link"

import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * The mark: two strokes converging inside a square — the "join" in Joinway.
 *
 * Drawn entirely in `currentColor`, so it inverts with the theme and can be
 * dropped onto any surface without a second asset.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      <rect
        x="0.75"
        y="0.75"
        width="22.5"
        height="22.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6 18V11.5A2.5 2.5 0 0 1 8.5 9H18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M6 6h6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        className
      )}
    >
      <LogoMark />
      <span className="text-[0.9375rem] font-semibold tracking-tight">
        {siteConfig.shortName}
        <span className="font-normal text-muted-foreground"> UI</span>
      </span>
    </Link>
  )
}
