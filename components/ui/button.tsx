import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Rounded, soft-contrast buttons.
 *
 * Hierarchy runs down a single axis: the primary action is the only filled
 * brand surface on a page, the secondary is a card with a hairline, and the
 * tertiary is bare text that grows a tinted background on hover. Nothing here
 * uses maximum contrast — a filled button is indigo rather than black ink, and
 * a resting border is a hairline rather than a rule.
 */
const buttonVariants = cva(
  cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap select-none",
    "transition-[background-color,color,border-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        primary:
          "border border-primary bg-primary text-primary-foreground shadow-xs hover:border-primary-hover hover:bg-primary-hover hover:shadow-sm",
        secondary:
          "border border-border bg-card text-foreground shadow-xs hover:border-accent-border hover:bg-accent-soft hover:text-accent",
        outline:
          "border border-accent-border bg-transparent text-accent hover:bg-accent-soft",
        ghost:
          "border border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        link: "h-auto rounded-sm p-0 text-accent underline decoration-1 underline-offset-4 hover:decoration-2",
        destructive:
          "border border-destructive bg-destructive text-destructive-foreground shadow-xs hover:opacity-90",
      },
      size: {
        sm: "h-8 px-3 text-[0.8125rem]",
        md: "h-9 px-4",
        lg: "h-11 px-5 text-[0.9375rem]",
        icon: "size-9 p-0",
        "icon-sm": "size-8 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

export interface ButtonProps
  extends
    React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
})

export { buttonVariants }
