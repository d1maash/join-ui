"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * The site is dark only, so this pins next-themes rather than resolving a
 * preference. It stays in the tree for one reason: `sonner` and anything else
 * that reads `useTheme()` still expects a provider above it.
 *
 * The `.light` token block in `globals.css` is not dead code — registry
 * components are installed into other people's projects, and plenty of those
 * are light. This site simply never renders that half.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      value={{ light: "light", dark: "dark" }}
    >
      {children}
    </NextThemesProvider>
  )
}
