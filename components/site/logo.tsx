import Link from "next/link"

import { MARK } from "@/lib/brand"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * The connected modules inherit the surrounding text colour and remain crisp
 * in the header, footer, mobile navigation and standalone preview chrome.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={MARK.viewBox}
      role="img"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      {MARK.paths.map((d) => (
        <path key={d} d={d} fill="currentColor" />
      ))}
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
