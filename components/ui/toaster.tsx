"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

/**
 * Toast host.
 *
 * Mounted once in the root layout. Sonner renders an `aria-live` region and
 * keeps toasts reachable with `F6`, so status messages are announced without
 * moving focus.
 */
export function Toaster() {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "!rounded-lg !border-border !bg-popover !text-popover-foreground !shadow-[var(--shadow-overlay)]",
          description: "!text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-muted-foreground",
        },
      }}
    />
  )
}
