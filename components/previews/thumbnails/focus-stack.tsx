"use client"

import * as React from "react"

import { FocusStack } from "@/registry/components/focus-stack"
import { SYSTEM } from "@/components/previews/fixtures/focus-stack"

import { useThumbnail } from "./clock"

/* The first turn comes quickly, so the hover is answered; the rest at the stack's own pace. */
const LEAD = 450
const EVERY = 1600

/**
 * The stack turns while the card is pointed at and stops where it is when the
 * pointer leaves — there is no position to go back to, so it does not reset.
 *
 * The turns are driven from here rather than by the stack's own timer, which
 * waits a whole interval before the first one.
 */
export default function FocusStackThumbnail() {
  const { playing, session } = useThumbnail()
  const [turn, setTurn] = React.useState({ index: 0, session })

  React.useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(
      () => setTurn(({ index }) => ({ index: index + 1, session })),
      turn.session === session ? EVERY : LEAD
    )
    return () => window.clearTimeout(timer)
  }, [playing, session, turn])

  return (
    <FocusStack
      label="Design system"
      items={SYSTEM}
      mode="auto"
      size="sm"
      depth={2}
      paused
      index={turn.index % SYSTEM.length}
      interactive={false}
      className="w-full"
    />
  )
}
