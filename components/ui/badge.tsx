import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import type { ComponentStatus } from "@/types/registry"

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[0.6875rem] font-medium leading-4",
  {
    variants: {
      variant: {
        neutral: "border-border bg-muted text-muted-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
        primary: "border-primary/25 bg-primary-soft text-primary",
        accent: "border-accent/30 bg-accent-soft text-accent-foreground",
        success: "border-success/30 bg-success/10 text-success",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[0.6875rem]",
        md: "px-2 py-1 text-xs",
      },
    },
    defaultVariants: { variant: "neutral", size: "sm" },
  }
)

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<"span">,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

const STATUS_VARIANT: Record<
  ComponentStatus,
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  stable: "neutral",
  new: "primary",
  updated: "accent",
  experimental: "outline",
}

const STATUS_LABEL: Record<ComponentStatus, string> = {
  stable: "Stable",
  new: "New",
  updated: "Updated",
  experimental: "Experimental",
}

/** Status chip driven by registry metadata, so labels never drift. */
export function StatusBadge({
  status,
  className,
  ...props
}: { status: ComponentStatus } & Omit<BadgeProps, "variant" | "children">) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={className} {...props}>
      {status === "experimental" ? (
        <span aria-hidden="true" className="size-1 rounded-full bg-current" />
      ) : null}
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export { badgeVariants }
