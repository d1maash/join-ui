import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import type { ComponentStatus } from "@/types/registry"

/**
 * Small pill label.
 *
 * The tonal variants are neutral by design. A catalog row is mostly badges, and
 * giving each state its own hue turned that row into a colour chart — the words
 * were already doing the work, so the colour was decoration. The semantic
 * variants exist for the rare case where a badge really is reporting a state
 * (a failing check, a live run), not for labelling.
 */
const badgeVariants = cva(
  cn(
    "inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap select-none",
    /*
     * Set in the interface face at its own size, not in mono caps. A pill is
     * read as a word — "New", "Data Display" — and uppercase mono turns each
     * one into a string of letters to decode at the exact moment a reader is
     * scanning past it.
     */
    "font-medium tracking-[-0.005em]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        /** Filled ink — the loudest label available. */
        primary: "border-primary bg-primary text-primary-foreground",
        /** Hairline pill on the card surface — the default. */
        neutral: "border-border bg-card text-muted-foreground",
        /** Hairline pill with normal ink — one step above neutral. */
        outline: "border-border-hover bg-transparent text-foreground",
        /** Flat tint, no rule — the quietest label. */
        muted: "border-transparent bg-muted text-muted-foreground",
        /** Semantic tints, for a state that has one. */
        positive: "border-transparent bg-positive-soft text-positive",
        caution: "border-transparent bg-caution-soft text-caution",
        critical: "border-transparent bg-critical-soft text-critical",
        info: "border-transparent bg-info-soft text-info",
      },
      /*
       * Both steps are larger than they were. Uppercase mono carries at 9px
       * because every glyph is cap height; a mixed-case sans at that size is
       * simply small, so the scale moves up to where its x-height works.
       */
      size: {
        sm: "h-[1.375rem] px-2.5 text-[0.6875rem]",
        md: "h-6 px-2.5 text-xs",
      },
    },
    defaultVariants: { variant: "neutral", size: "sm" },
  }
)

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<"span">, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

/**
 * Registry status.
 *
 * Separated by fill weight and always spelled out, never by hue. `new` is the
 * only one worth interrupting a scan for, so it is the only filled pill.
 */
const STATUS_VARIANT: Record<ComponentStatus, BadgeProps["variant"]> = {
  stable: "neutral",
  new: "primary",
  updated: "outline",
  experimental: "muted",
}

export function StatusBadge({
  status,
  className,
  ...props
}: { status: ComponentStatus } & Omit<BadgeProps, "variant" | "children">) {
  return (
    <Badge
      variant={STATUS_VARIANT[status]}
      // The registry stores the status lower-cased; `capitalize` is what makes
      // it a word on screen now that the pill is no longer uppercased wholesale.
      className={cn("capitalize", className)}
      {...props}
    >
      {status}
    </Badge>
  )
}

export { badgeVariants }
