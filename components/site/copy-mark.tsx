"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

const EASE = [0.22, 1, 0.36, 1] as const

/** Shared beats so the mark and the words leave and arrive as one step. */
const OUT = 0.16
const DRAW = 0.24
const DRAW_DELAY = 0.1
const LABEL_IN_DELAY = 0.12
const TRAVEL = 7

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
    duration: still ? 0 : OUT,
    ease: EASE,
  }
  const draw = {
    pathLength: {
      duration: still ? 0 : DRAW,
      ease: EASE,
      delay: still || !copied ? 0 : DRAW_DELAY,
    },
    opacity: {
      duration: still ? 0 : 0.08,
      delay: still || !copied ? 0 : DRAW_DELAY,
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
      duration: still ? 0 : DRAW,
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
      <motion.g initial={false} animate={{ opacity: copied ? 0 : 1 }} transition={out}>
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </motion.g>
      <motion.path d={CHECK} initial={false} animate={{ pathLength: copied ? 1 : 0, opacity: copied ? 1 : 0 }} transition={draw} />
    </MarkSvg>
  )
}

/**
 * Two labels in one slot. The idle line leaves upward with the mark; the
 * confirmation rises into the same window as the check is drawn, so the pair
 * reads as one step rather than an icon change and a caption change.
 */
export function CopyFace({
  copied,
  idle,
  done,
}: {
  copied: boolean
  idle: string
  done: string
}) {
  const still = useStill()
  const travel = still ? 0 : TRAVEL

  return (
    <span className="grid justify-items-start overflow-hidden">
      <motion.span
        aria-hidden={copied}
        className="col-start-1 row-start-1"
        initial={false}
        animate={{ opacity: copied ? 0 : 1, y: copied ? -travel : 0 }}
        transition={{ duration: still ? 0 : OUT, ease: EASE }}
      >
        {idle}
      </motion.span>
      <motion.span
        aria-hidden={!copied}
        className="col-start-1 row-start-1"
        initial={false}
        animate={{ opacity: copied ? 1 : 0, y: copied ? 0 : travel }}
        transition={{
          duration: still ? 0 : 0.2,
          ease: EASE,
          delay: still || !copied ? 0 : LABEL_IN_DELAY,
        }}
      >
        {done}
      </motion.span>
    </span>
  )
}
