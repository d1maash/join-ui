"use client"

import { ApprovalGate } from "@/registry/components/approval-gate"

import { useBeats, useThumbnail } from "./clock"

/* The request waits with its clock draining, then gets its answer. */
const BEATS = [3000, 2200] as const

export default function ApprovalGateThumbnail() {
  const { session } = useThumbnail()
  const clock = useBeats(BEATS)

  /*
   * Every other take is refused, so a long hover shows both answers: the tick
   * in the ring, and the strike drawn through the command.
   */
  const answer = clock && clock.take % 2 === 1 ? "deny" : "allow"

  /*
   * At rest the request simply waits, with no clock. Each hover is a fresh
   * gate — keyed on the session — so its clock starts full rather than
   * picking up wherever the last hover left it.
   */
  return (
    <ApprovalGate
      key={session}
      size="sm"
      className="w-full max-w-80"
      title="Reinstall dependencies"
      tool="bash"
      meta="~/join-ui"
      prefix="$"
      command="rm -rf node_modules && pnpm i"
      risk="high"
      timeout={clock ? 9_000 : undefined}
      decision={clock && clock.beat === 1 ? answer : null}
      announce={false}
    />
  )
}
