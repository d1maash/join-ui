import Link from "next/link"

import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * The mark: two strokes converging inside a rounded square — the "join" in
 * Joinway.
 *
 * The tile is filled with `--primary` — ink — and the strokes are knocked out
 * of it in `--primary-foreground`, so the mark reads the same on paper, on
 * charcoal and on a social card, and needs no second asset for either theme.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      <rect width="24" height="24" rx="6.5" fill="var(--primary)" />
      <path
        d="M7 17.5V11.5A2.5 2.5 0 0 1 9.5 9H17"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 6.5h5.5"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.62"
      />
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
      <span className="text-[0.9375rem] font-semibold">
        {siteConfig.shortName}
        <span className="font-normal text-muted-foreground"> UI</span>
      </span>
    </Link>
  )
}
