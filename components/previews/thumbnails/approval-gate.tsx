"use client"

import { ApprovalGate } from "@/registry/components/approval-gate"

import { useBeats } from "./clock"

/* The request waits with its clock draining, then gets its answer. */
const BEATS = [3200, 2200] as const

export default function ApprovalGateThumbnail() {
  const { beat, take } = useBeats(BEATS)

  /*
   * Every other take is refused, so the loop shows both answers: the tick in
   * the ring, and the strike drawn through the command.
   */
  const answer = take % 2 === 0 ? "allow" : "deny"

  return (
    <ApprovalGate
      size="sm"
      className="w-full max-w-80"
      title="Reinstall dependencies"
      tool="bash"
      meta="~/join-ui"
      prefix="$"
      command="rm -rf node_modules && pnpm i"
      risk="high"
      timeout={9_000}
      decision={beat === 0 ? null : answer}
      announce={false}
    />
  )
}
