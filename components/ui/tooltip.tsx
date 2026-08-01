"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(function TooltipContent({ className, sideOffset = 6, children, ...props }, ref) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-[var(--shadow-raised)]",
          "data-[state=delayed-open]:animate-[scale-in_var(--duration-fast)_var(--ease-out-soft)]",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
})

/**
 * Convenience wrapper for the common case: a single trigger with a text label.
 * Renders its own `Provider` so callers do not need a global one — Radix
 * tooltips only need a provider for shared open/close delays.
 */
export function SimpleTooltip({
  label,
  children,
  side = "top",
  delayDuration = 250,
}: {
  label: React.ReactNode
  children: React.ReactNode
  side?: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>["side"]
  delayDuration?: number
}) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
