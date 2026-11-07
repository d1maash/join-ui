import type * as React from "react"

import { cn } from "@/lib/utils"

import type { Flag } from "./types"

/*
 * The only colour in the chrome. Each flag is a word in a soft tint of its
 * family, so it reads without the hue, and the hue reads without the word.
 */
const FLAG: Record<Flag, { label: string; className: string }> = {
  new: { label: "New", className: "bg-positive-soft text-positive" },
  updated: { label: "Updated", className: "bg-info-soft text-info" },
  experimental: { label: "Experimental", className: "bg-caution-soft text-caution" },
}

export function FlagBadge({
  flag,
  size = "sm",
  className,
}: {
  flag: Flag | null | undefined
  size?: "xs" | "sm"
  className?: string
}) {
  if (!flag) return null
  const { label, className: tone } = FLAG[flag]
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-[5px] font-medium tracking-[-0.005em] whitespace-nowrap select-none",
        size === "xs" ? "h-[18px] px-1.5 text-[10.5px]" : "h-5 px-1.5 text-[11px]",
        tone,
        className
      )}
    >
      {label}
    </span>
  )
}

/** A quiet neutral label — category, dependency count. */
export function MetaBadge({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md border border-border px-2 text-xs font-medium text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  )
}
