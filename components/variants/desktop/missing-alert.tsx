"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"

import { stripVariant } from "@/lib/variants"

import { AppIcon } from "./app-icon"
import { vh } from "./apps"
import { useStill } from "./hooks"

/*
 * The 404: a macOS alert, centred over a dimmed desktop. The caution
 * triangle badges the app's own icon, the message names the exact path
 * that was asked for, and the default button — Go Home, in the accent —
 * has focus, so Return takes you there.
 */
export function MissingAlert() {
  const pathname = usePathname()
  const still = useStill()
  const home = React.useRef<HTMLAnchorElement>(null)
  const path = stripVariant(pathname)

  React.useEffect(() => {
    home.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="d-alert-scrim">
      <motion.div
        role="alertdialog"
        aria-labelledby="missing-title"
        aria-describedby="missing-text"
        className="d-alert d-glass"
        initial={still ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 520, damping: 34 }}
      >
        <div className="relative mx-auto size-16">
          <AppIcon id="about" className="size-16 drop-shadow-[0_6px_12px_rgb(0_0_0/0.4)]" />
          <CautionBadge />
        </div>
        <h1 id="missing-title" className="mt-4 text-[15px] leading-snug font-semibold tracking-[-0.01em] text-balance">
          The page “{path}” can’t be found.
        </h1>
        <p id="missing-text" className="mt-2 text-[13px] leading-[1.45] text-[var(--d-ink-2)] text-pretty">
          It may have moved, or the link is wrong. Everything Join UI ships is in the Catalog.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link href={vh("/components")} className="d-btn h-8">
            Open Catalog
          </Link>
          <Link ref={home} href={vh("/")} className="d-btn h-8" data-tone="blue">
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

function CautionBadge() {
  return (
    <svg viewBox="0 0 32 30" className="absolute -right-3 -bottom-2 h-[30px] w-8 drop-shadow-[0_2px_3px_rgb(0_0_0/0.45)]" aria-hidden="true">
      <path
        d="M13.4 2.6a3 3 0 0 1 5.2 0l12 21.2A3 3 0 0 1 28 28.3H4a3 3 0 0 1-2.6-4.5Z"
        fill="#ffd60a"
        stroke="#b38600"
        strokeWidth="0.8"
      />
      <path d="M16 10v8.5" stroke="#1c1c1e" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="23" r="1.8" fill="#1c1c1e" />
    </svg>
  )
}
