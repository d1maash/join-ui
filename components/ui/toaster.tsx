"use client"

import { Toaster as Sonner } from "sonner"

/**
 * Toasts, drawn as a raised card rather than as an inverted block.
 *
 * Sonner's own theming is bypassed entirely (`unstyled` plus class overrides)
 * so a notification inherits the site's surface, radius and elevation tokens
 * instead of shipping its own palette.
 */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      gap={8}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-3 rounded-xl border border-border bg-popover px-4 py-3 font-sans text-sm text-popover-foreground shadow-lg",
          title: "font-medium",
          description: "text-muted-foreground",
          icon: "flex size-4 shrink-0 items-center justify-center text-foreground [&_svg]:size-4",
          actionButton:
            "ml-auto cursor-pointer rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground",
          cancelButton:
            "ml-auto cursor-pointer rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground",
        },
      }}
    />
  )
}
