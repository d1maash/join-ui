import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import type { ComponentStatus } from "@/types/registry"

const badgeVariants = cva(
  cn(
    "inline-flex items-center gap-1.5 border font-mono uppercase whitespace-nowrap select-none",
    "tracking-[0.1em]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        /** Filled ink — the loudest label available. */
        primary: "border-foreground bg-foreground text-background",
        /** Hairline box — the default. */
        neutral: "border-border bg-background text-muted-foreground",
        /** Ink rule, transparent fill — one step above neutral. */
        outline: "border-foreground bg-transparent text-foreground",
        /** Flat grey block, no rule — the quietest label. */
        muted: "border-transparent bg-muted text-muted-foreground",
      },
      size: {
        sm: "h-5 px-1.5 text-[0.5625rem]",
        md: "h-6 px-2 text-[0.625rem]",
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
 * With hue unavailable, the four states are separated by fill weight and are
 * always spelled out in words — never abbreviated to a coloured dot.
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
