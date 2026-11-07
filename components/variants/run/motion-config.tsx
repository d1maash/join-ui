"use client"

import type * as React from "react"
import { MotionConfig } from "motion/react"

/**
 * Every Motion animation in the variant — the window's folds, the catalog's
 * re-tiling, the sliding segment thumbs — drops its movement under
 * `prefers-reduced-motion` and keeps only the change of state.
 */
export function RunMotion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
