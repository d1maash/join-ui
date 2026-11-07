"use client"

import type * as React from "react"
import { MotionConfig } from "motion/react"

/** Every Motion animation in the variant follows the reader's Reduce Motion setting. */
export function ProMotion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
