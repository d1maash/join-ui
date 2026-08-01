"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { useIsHydrated } from "@/lib/hooks"

/**
 * Light/dark switch.
 *
 * `resolvedTheme` is only meaningful after hydration, so the icon is held at a
 * fixed state until then — rendering the real one on the server would produce
 * a mismatch for anyone whose system preference differs from the default.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useIsHydrated()
  const isDark = hydrated && resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <Sun aria-hidden="true" className="size-4" />
      ) : (
        <Moon aria-hidden="true" className="size-4" />
      )}
    </Button>
  )
}
