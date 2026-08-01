"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      // The light class is written explicitly so `.light` token blocks apply to
      // forced-light preview islands nested inside a dark page.
      value={{ light: "light", dark: "dark" }}
    >
      {children}
    </NextThemesProvider>
  )
}
