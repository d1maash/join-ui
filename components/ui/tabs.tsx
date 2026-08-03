"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

export const Tabs = TabsPrimitive.Root

/**
 * Tab bar.
 *
 * The active tab is marked by a 2px brand rule along the bottom edge and by
 * the hue of its label — the same signal the sidebar and the top nav use, so
 * "where am I" is one colour everywhere on the site.
 */
export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "flex items-stretch gap-6 border-b border-border",
        className
      )}
      {...props}
    />
  )
})

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative -mb-px cursor-pointer border-b-2 border-transparent pb-2.5",
        // Navigation, so it is set like navigation: interface face, 13px, one
        // step heavier than body copy, no case transform.
        "text-[0.8125rem] font-medium tracking-[-0.006em]",
        "text-muted-foreground transition-colors duration-[var(--duration-fast)]",
        "hover:text-foreground",
        "focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-40",
        "data-[state=active]:border-foreground data-[state=active]:text-foreground",
        className
      )}
      {...props}
    />
  )
})

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
      {...props}
    />
  )
})
