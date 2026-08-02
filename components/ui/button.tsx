import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Square, high-contrast buttons.
 *
 * Hierarchy is expressed through fill and rule weight rather than hue: solid
 * ink for the primary action, a hairline box for the secondary, bare text for
 * the tertiary.
 */
const buttonVariants = cva(
  cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 text-sm font-medium whitespace-nowrap select-none",
    "transition-[background-color,color,border-color,opacity] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        primary:
          "border border-foreground bg-foreground text-background hover:bg-grey-800 hover:border-grey-800",
        secondary:
          "border border-border bg-background text-foreground hover:border-foreground",
        outline:
          "border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        ghost:
          "border border-transparent bg-transparent text-muted-foreground hover:border-border hover:text-foreground",
        link: "h-auto p-0 text-foreground underline decoration-1 underline-offset-4 hover:decoration-2",
        destructive:
          "border border-foreground bg-background text-foreground hover:bg-foreground hover:text-background",
      },
      size: {
        sm: "h-8 px-3 text-[0.8125rem]",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-[0.9375rem]",
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
