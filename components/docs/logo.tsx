import Link from "next/link"

import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-hidden="true"
      className={cn("size-7", className)}
    >
      <defs>
        <linearGradient id="joinway-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand-from)" />
          <stop offset="55%" stopColor="var(--brand-via)" />
          <stop offset="100%" stopColor="var(--brand-to)" />
        </linearGradient>
      </defs>
      <rect
        x="1.25"
        y="1.25"
        width="29.5"
        height="29.5"
        rx="8.5"
        fill="var(--card)"
        stroke="var(--border-strong)"
        strokeWidth="1.5"
      />
      {/* Two paths converging — the "join" in Joinway. */}
      <path
        d="M9 22.5V15a4 4 0 0 1 4-4h6"
        fill="none"
        stroke="url(#joinway-mark)"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
      <path
        d="M23 9.5V17a4 4 0 0 1-4 4h-6"
        fill="none"
        stroke="url(#joinway-mark)"
        strokeWidth="2.75"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        className
      )}
    >
      <LogoMark />
      <span className="text-[0.9375rem] font-semibold tracking-tight">
        {siteConfig.shortName}
        <span className="text-muted-foreground"> UI</span>
      </span>
    </Link>
  )
}
