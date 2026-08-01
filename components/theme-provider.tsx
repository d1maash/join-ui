"use client"

import type * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * Theme context.
 *
 * `value` maps both themes to explicit class names so the root element always
 * carries either `.light` or `.dark`. The token layer keys off those classes,
 * which is what lets a preview force its own theme independently of the page.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      value={{ light: "light", dark: "dark" }}
    >
      {children}
    </NextThemesProvider>
  )
}
