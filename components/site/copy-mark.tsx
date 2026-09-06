"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * A check written the way a hand writes it: the short stroke first, then the
 * long one. Lucide's own path starts at the far end of the long arm, which
 * draws the mark backwards.
 */
const CHECK = "M4 12 9 17 20 6"

function useStill() {
  return useReducedMotion() === true
}

function MarkSvg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/**
 * The idle prompt mark folding away, then a check drawn in its place.
 *
 * The lines retract first so the chevron is the last thing to go — it is the
 * character of the mark — and the check starts only once that space is clear.
 * Nothing scales, nothing bounces; the motion is the ink leaving and arriving.
 */
export function PromptCopyMark({ copied }: { copied: boolean }) {
  const still = useStill()
  const out = {
    duration: still ? 0 : 0.16,
    ease: EASE,
  }
  const draw = {
    pathLength: {
      duration: still ? 0 : 0.24,
      ease: EASE,
      delay: still || !copied ? 0 : 0.1,
    },
    opacity: {
      duration: still ? 0 : 0.08,
      delay: still || !copied ? 0 : 0.1,
    },
  }

  return (
    <MarkSvg>
      <motion.path
        d="m6 8 4 4-4 4"
        initial={false}
        animate={{ pathLength: copied ? 0 : 1, opacity: copied ? 0 : 1 }}
        transition={out}
      />
      <motion.path
        d="M13 10h7"
        initial={false}
        animate={{ pathLength: copied ? 0 : 1, opacity: copied ? 0 : 1 }}
        transition={{ ...out, delay: still ? 0 : 0.02 }}
      />
      <motion.path
        d="M13 14h5"
        initial={false}
        animate={{ pathLength: copied ? 0 : 1, opacity: copied ? 0 : 1 }}
        transition={{ ...out, delay: still ? 0 : 0.05 }}
      />
      <motion.path d={CHECK} initial={false} animate={{ pathLength: copied ? 1 : 0, opacity: copied ? 1 : 0 }} transition={draw} />
    </MarkSvg>
  )
}

/**
 * The overlapping pages of a copy glyph give way to the same drawn check.
 */
export function ClipboardCopyMark({ copied }: { copied: boolean }) {
  const still = useStill()
  const out = {
    duration: still ? 0 : 0.14,
    ease: EASE,
  }
  const draw = {
    pathLength: {
      duration: still ? 0 : 0.24,
      ease: EASE,
      delay: still || !copied ? 0 : 0.08,
    },
    opacity: {
      duration: still ? 0 : 0.08,
      delay: still || !copied ? 0 : 0.08,
    },
  }

  return (
    <MarkSvg>
      <motion.g
        initial={false}
        animate={{ opacity: copied ? 0 : 1 }}
        transition={out}
      >
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </motion.g>
      <motion.path d={CHECK} initial={false} animate={{ pathLength: copied ? 1 : 0, opacity: copied ? 1 : 0 }} transition={draw} />
    </MarkSvg>
  )
}
