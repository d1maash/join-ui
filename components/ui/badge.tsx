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
    "inline-flex items-center gap-1.5 rounded-full border font-mono uppercase whitespace-nowrap select-none",
    "tracking-[0.1em]",
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
      size: {
        sm: "h-5 px-2 text-[0.5625rem]",
        md: "h-6 px-2.5 text-[0.625rem]",
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
    <Badge variant={STATUS_VARIANT[status]} className={className} {...props}>
      {status}
    </Badge>
  )
}

export { badgeVariants }
