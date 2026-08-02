"use client"

import { Toaster as Sonner } from "sonner"

/**
 * Toasts, stripped to a square ink-on-paper card.
 *
 * Sonner's own theming is bypassed entirely (`unstyled`-adjacent class
 * overrides) so notifications cannot reintroduce colour.
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
            "flex w-full items-center gap-3 border border-foreground bg-background px-4 py-3 font-sans text-sm text-foreground",
          title: "font-medium",
          description: "text-muted-foreground",
          icon: "flex size-4 shrink-0 items-center justify-center [&_svg]:size-4",
          actionButton:
            "ml-auto cursor-pointer border border-foreground bg-foreground px-2 py-1 font-mono text-[0.625rem] tracking-[0.1em] uppercase text-background",
          cancelButton:
            "ml-auto cursor-pointer border border-border px-2 py-1 font-mono text-[0.625rem] tracking-[0.1em] uppercase text-muted-foreground",
        },
      }}
    />
  )
}
