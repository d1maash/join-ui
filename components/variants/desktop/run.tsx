"use client"

import * as React from "react"

import type { ApprovalGateDecision } from "@/registry/components/approval-gate"
import type { StatusTimelineStep } from "@/registry/components/status-timeline"
import type { ToolTraceStep } from "@/registry/components/tool-trace"

/*
 * The story the desktop tells.
 *
 * Three components on the screen are one agent session seen from three
 * places: Tool Trace is the run from the inside, Approval Gate is the moment
 * it stops to ask, and Status Timeline is what the deploy looks like from the
 * outside. They read one phase, so answering the notification moves the trace
 * and the widget together — which is the argument for the library, made by
 * the library.
 */

export type RunPhase =
  | "idle"
  | "editing"
  | "testing"
  | "awaiting"
  | "pushing"
  | "opening"
  | "done"
  | "denied"
  | "expired"

const NEXT: Partial<Record<RunPhase, RunPhase>> = {
  editing: "testing",
  testing: "awaiting",
  pushing: "opening",
  opening: "done",
}

/* Long enough for each step's console to finish writing before it folds. */
const DWELL: Partial<Record<RunPhase, number>> = {
  editing: 1500,
  testing: 1700,
  pushing: 1300,
  opening: 1500,
}

const ORDER: RunPhase[] = ["idle", "editing", "testing", "awaiting", "pushing", "opening", "done"]

function reached(phase: RunPhase, target: RunPhase) {
  if (phase === "denied" || phase === "expired") {
    return ORDER.indexOf(target) <= ORDER.indexOf("awaiting")
  }
  return ORDER.indexOf(phase) >= ORDER.indexOf(target)
}

interface RunValue {
  phase: RunPhase
  /** Bumped on every restart, so a fresh gate is mounted for a fresh request. */
  take: number
  decision: ApprovalGateDecision | null
  start: () => void
  hold: () => void
  restart: () => void
  decide: (decision: ApprovalGateDecision) => void
}

const RunContext = React.createContext<RunValue | null>(null)

export function RunProvider({ children }: { children: React.ReactNode }) {
  /*
   * The first render waits at the gate. That is the frame the phone renders
   * on the server — a lock screen with a request on it — and the desktop
   * winds it back to the start before its windows open.
   */
  const [phase, setPhase] = React.useState<RunPhase>("awaiting")
  const [take, setTake] = React.useState(0)

  React.useEffect(() => {
    const next = NEXT[phase]
    if (!next) return
    const timer = window.setTimeout(() => setPhase(next), DWELL[phase] ?? 1200)
    return () => window.clearTimeout(timer)
  }, [phase])

  const value = React.useMemo<RunValue>(() => {
    const decision: ApprovalGateDecision | null =
      phase === "denied"
        ? "deny"
        : phase === "expired"
          ? "expire"
          : reached(phase, "pushing")
            ? "allow"
            : null
    return {
      phase,
      take,
      decision,
      start: () => setPhase((current) => (current === "idle" ? "editing" : current)),
      hold: () => setPhase("idle"),
      restart: () => {
        setTake((n) => n + 1)
        setPhase("editing")
      },
      decide: (next) =>
        setPhase((current) => {
          if (current !== "awaiting") return current
          return next === "allow" ? "pushing" : next === "deny" ? "denied" : "expired"
        }),
    }
  }, [phase, take])

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>
}

export function useRun(): RunValue {
  const value = React.useContext(RunContext)
  if (!value) throw new Error("useRun must be used inside RunProvider")
  return value
}

/* ── What each component draws for a phase ─────────────────────────────── */

export const GATE = {
  title: "Push the branch",
  reason: "Tests pass. Three files changed in app/agent.",
  tool: "git",
  meta: "feat/approval-gate",
  prefix: "$",
  command: "git push -u origin feat/approval-gate",
  timeout: 45_000,
} as const

export function traceSteps(phase: RunPhase): ToolTraceStep[] {
  const stopped = phase === "denied" || phase === "expired"
  const state = (
    runningAt: RunPhase,
    doneAt: RunPhase
  ): NonNullable<ToolTraceStep["state"]> => {
    if (reached(phase, doneAt) && !(stopped && ORDER.indexOf(doneAt) > ORDER.indexOf("awaiting")))
      return "done"
    if (stopped && ORDER.indexOf(runningAt) >= ORDER.indexOf("awaiting")) return "skipped"
    if (phase === runningAt) return "running"
    return "pending"
  }

  const edit = state("editing", "testing")
  const test = state("testing", "awaiting")
  const push = state("pushing", "opening")
  const pr = state("opening", "done")

  return [
    {
      id: "read",
      name: "read_file",
      summary: "components/joinui/approval-gate.tsx",
      meta: "0.2s",
      state: "done",
    },
    {
      id: "grep",
      name: "grep_search",
      summary: 'pattern: "requestApproval"',
      meta: "0.3s",
      state: "done",
    },
    {
      id: "edit",
      name: "edit_file",
      summary: "app/agent/approvals.tsx",
      meta: edit === "done" ? "0.9s" : undefined,
      state: edit,
      output: [
        "+ <ApprovalGate",
        "+   command={step.command}",
        "+   onDecision={resume} />",
        "→ 1 file changed",
      ],
    },
    {
      id: "test",
      name: "run_tests",
      summary: "pnpm test approvals",
      meta: test === "done" ? "1.4s" : undefined,
      state: test,
      output: ["✓ allows on Y", "✓ denies on N", "✓ expires after 45s", "→ 3 passed"],
    },
    {
      id: "push",
      name: "git_push",
      summary:
        phase === "denied"
          ? "denied by you"
          : phase === "expired"
            ? "no answer in 45s"
            : phase === "awaiting"
              ? "waiting for approval"
              : "origin feat/approval-gate",
      meta: push === "done" ? "1.1s" : undefined,
      state: push,
      output: ["Enumerating objects: 9, done.", "→ 3 commits, 4.1 kB"],
    },
    {
      id: "pr",
      name: "open_pull_request",
      summary: "feat/approval-gate → main",
      meta: pr === "done" ? "#128" : undefined,
      state: pr,
      output: ["Title: Ask before pushing", "→ #128 opened, preview queued"],
    },
  ]
}

export function traceStatus(phase: RunPhase): string {
  switch (phase) {
    case "idle":
      return "Queued"
    case "awaiting":
      return "Waiting for you"
    case "done":
      return "Done"
    case "denied":
      return "Stopped"
    case "expired":
      return "Timed out"
    default:
      return "Running"
  }
}

export function deploySteps(phase: RunPhase): StatusTimelineStep[] {
  const checks: StatusTimelineStep =
    phase === "idle" || phase === "editing"
      ? { id: "checks", title: "Checks", description: "Waiting for the edit", state: "pending" }
      : phase === "testing"
        ? { id: "checks", title: "Checks", description: "Running 3 tests", state: "current" }
        : { id: "checks", title: "Checks", description: "3 passed", timestamp: "1.4s", state: "complete" }

  const push: StatusTimelineStep =
    phase === "awaiting"
      ? { id: "push", title: "Push", description: "Needs your approval", state: "waiting" }
      : phase === "pushing"
        ? { id: "push", title: "Push", description: "feat/approval-gate", state: "current" }
        : phase === "opening" || phase === "done"
          ? { id: "push", title: "Push", description: "3 commits", timestamp: "1.1s", state: "complete" }
          : phase === "denied"
            ? { id: "push", title: "Push", description: "Denied by you", state: "blocked" }
            : phase === "expired"
              ? { id: "push", title: "Push", description: "Nobody answered", state: "blocked" }
              : { id: "push", title: "Push", state: "pending" }

  const preview: StatusTimelineStep =
    phase === "opening"
      ? { id: "preview", title: "Preview", description: "Building #128", state: "current" }
      : phase === "done"
        ? { id: "preview", title: "Preview", description: "Ready to review", timestamp: "38s", state: "complete" }
        : { id: "preview", title: "Preview", state: "pending" }

  return [
    checks,
    push,
    preview,
    { id: "production", title: "Production", description: "After review", state: "pending" },
  ]
}
