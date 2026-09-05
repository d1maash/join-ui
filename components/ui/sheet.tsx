"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close
export const SheetTitle = DialogPrimitive.Title
export const SheetDescription = DialogPrimitive.Description

/**
 * A panel hinged to one edge of the viewport.
 *
 * The overlay fades; the panel only translates. Fading a drawer as it travels
 * is what makes the surface look like a tooltip. A drawer is a piece of the
 * page that was parked off-screen — it is already opaque when it arrives, and
 * it leaves the same way. Exit is shorter than enter so a dismiss feels like
 * a decision, not a rewind. Radix Presence keeps the portal mounted until
 * these animations finish, which is what returns focus after the panel has
 * actually gone rather than halfway through the slide.
 */
export const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "left" | "right"
  }
>(function SheetContent({ className, children, side = "left", ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-grey-1000/20 backdrop-blur-[3px]",
          "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
        )}
      />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-y-0 z-50 flex w-[19rem] max-w-[85vw] flex-col bg-card shadow-lg",
          "border-border overscroll-y-contain",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
          side === "left"
            ? "data-[state=open]:animate-sheet-in-left data-[state=closed]:animate-sheet-out-left"
            : "data-[state=open]:animate-sheet-in-right data-[state=closed]:animate-sheet-out-right",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-lg",
            "border border-transparent text-muted-foreground",
            "transition-[background-color,color,transform] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
            "hover:bg-muted hover:text-foreground active:translate-y-px",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          )}
        >
          <X aria-hidden="true" className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
})
