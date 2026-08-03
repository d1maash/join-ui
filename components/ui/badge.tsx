import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import type { ComponentStatus } from "@/types/registry"

/**
 * Small pill label.
 *
 * The four tonal variants are all tint-on-hairline rather than solid ink, so a
 * row of badges reads as one quiet band instead of four separate blocks. The
 * status variants below add hue on top of that, never instead of the word.
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
        /** Brand tint — the loudest label available. */
        primary: "border-accent-border bg-accent-soft text-accent",
        /** Hairline pill on the card surface — the default. */
        neutral: "border-border bg-card text-muted-foreground",
        /** Hairline pill with normal ink — one step above neutral. */
        outline: "border-border-strong/40 bg-transparent text-foreground",
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
 * Each state now gets a hue, but the hue is an accelerator rather than the
 * message: the word is always rendered, so the four remain distinguishable
 * without colour.
 */
const STATUS_VARIANT: Record<ComponentStatus, BadgeProps["variant"]> = {
  stable: "positive",
  new: "primary",
  updated: "info",
  experimental: "caution",
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
