import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Rounded, soft-contrast buttons.
 *
 * Hierarchy runs down a single axis of material rather than of colour: the
 * primary action is the only filled dark shape on a page, the secondary is a
 * white card with a hairline, and the tertiary is bare text that grows a
 * neutral background on hover. The fill is ink, not a brand hue — on a warm
 * page a dark button already reads as the loudest thing available.
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
          "border border-primary bg-primary text-primary-foreground shadow-xs hover:border-primary-hover hover:bg-primary-hover",
        secondary:
          "border border-border bg-card text-foreground shadow-xs hover:border-border-hover hover:bg-subtle",
        outline:
          "border border-border-hover bg-transparent text-foreground hover:bg-muted",
        ghost:
          "border border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        link: "h-auto rounded-sm p-0 text-foreground underline decoration-border-strong decoration-1 underline-offset-4 hover:decoration-foreground",
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
