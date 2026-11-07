"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"
import { motion, useScroll, useTransform } from "motion/react"

import {
  ApprovalGate,
  type ApprovalGateDecision,
} from "@/registry/components/approval-gate"
import { ToolTrace, type ToolTraceStep } from "@/registry/components/tool-trace"
import { cn } from "@/lib/utils"

/*
 * The hero object: two real components sharing one run. An agent has read,
 * edited and tested, and now wants to push — so the trace waits on the gate,
 * and whatever you answer the gate, the trace carries on from it. It sits in
 * a window lit from above, and the window settles flat as it scrolls into the
 * middle of the screen, the way a lid opens on apple.com.
 */

const DONE: ToolTraceStep[] = [
  {
    id: "read",
    name: "read_file",
    summary: "registry/components/approval-gate.tsx",
    state: "done",
    meta: "0.2s",
    output: ["→ 640 lines, 24.1 kB"],
  },
  {
    id: "edit",
    name: "edit_file",
    summary: "Hold the clock while the card is read",
    state: "done",
    meta: "1.4s",
    output: ["+ 18 lines, − 6"],
  },
  {
    id: "test",
    name: "run_tests",
    summary: "pnpm check",
    state: "done",
    meta: "29s",
    output: ["✓ registry:validate", "✓ typecheck", "✓ lint"],
  },
]

type Push = "waiting" | "running" | "done" | "skipped"

export function HeroStage() {
  const ref = React.useRef<HTMLDivElement>(null)
  const [decision, setDecision] = React.useState<ApprovalGateDecision | null>(null)
  const [landed, setLanded] = React.useState(false)
  const [take, setTake] = React.useState(0)

  // Allowing starts the push; it lands a couple of seconds later.
  React.useEffect(() => {
    if (decision !== "allow") return
    const id = window.setTimeout(() => setLanded(true), 2200)
    return () => window.clearTimeout(id)
  }, [decision])

  const push: Push =
    decision === null
      ? "waiting"
      : decision !== "allow"
        ? "skipped"
        : landed
          ? "done"
          : "running"

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 55%"] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [16, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1])
  const glow = useTransform(scrollYProgress, [0, 1], [0.35, 1])

  const steps: ToolTraceStep[] = [
    ...DONE,
    {
      id: "push",
      name: "git_push",
      summary:
        push === "waiting"
          ? "Waiting for approval"
          : push === "skipped"
            ? "Not approved"
            : "origin feat/approval-gate",
      state:
        push === "waiting"
          ? "pending"
          : push === "running"
            ? "running"
            : push === "done"
              ? "done"
              : "skipped",
      meta: push === "done" ? "1.1s" : undefined,
      output: ["→ 3 files, 1 commit", "→ feat/approval-gate pushed"],
    },
  ]

  function reset() {
    setDecision(null)
    setLanded(false)
    setTake((value) => value + 1)
  }

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[1120px] [perspective:2400px]">
      {/* The key light behind the object. */}
      <motion.div
        aria-hidden="true"
        data-pro-parallax
        style={{ opacity: glow }}
        className="pointer-events-none absolute -inset-x-[20%] -top-[30%] bottom-[10%] bg-[radial-gradient(50%_50%_at_50%_45%,rgb(41_151_255/0.16)_0%,rgb(191_90_242/0.07)_40%,transparent_70%)]"
      />

      <motion.div
        data-pro-parallax
        style={{ rotateX, scale, transformOrigin: "50% 100%" }}
        className="pro-window relative overflow-hidden rounded-[22px] sm:rounded-[30px]"
      >
        <div className="flex h-11 items-center gap-2 border-b border-white/[0.06] px-4 sm:px-5">
          <span aria-hidden="true" className="flex gap-2">
            <span className="size-3 rounded-full bg-[#ff5f57]/90" />
            <span className="size-3 rounded-full bg-[#febc2e]/90" />
            <span className="size-3 rounded-full bg-[#28c840]/90" />
          </span>
          <p className="flex-1 text-center text-[12px] font-medium text-[#86868b]">
            Agent run — join-ui
          </p>
          <span aria-hidden="true" className="w-[52px]" />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 p-3 sm:p-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-8 lg:p-10">
          <ToolTrace
            className="order-2 lg:order-1"
            label="Agent run"
            status={
              push === "done" ? "Finished" : push === "skipped" ? "Stopped" : "Waiting on you"
            }
            steps={steps}
          />

          <div className="order-1 flex flex-col gap-4 lg:order-2 lg:pt-10">
            <ApprovalGate
              key={take}
              title="Push the branch"
              reason="Three files changed. Every check passed."
              tool="bash"
              meta="~/join-ui"
              prefix="$"
              command="git push origin feat/approval-gate"
              risk="medium"
              timeout={45_000}
              decision={decision}
              onDecision={setDecision}
            />
            <div className="flex h-8 items-center justify-between gap-3 px-1">
              <p className="text-[13px] text-[#86868b]">
                {decision === null
                  ? "This is the real component. Answer it."
                  : decision === "allow"
                    ? "Allowed. The trace picks it up."
                    : decision === "deny"
                      ? "Denied. The push is skipped."
                      : "Timed out. Nothing was run."}
              </p>
              <button
                type="button"
                onClick={reset}
                className={cn(
                  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-white/[0.08] px-3.5 text-[13px] text-[#e8e8ed]",
                  "transition-[opacity,background-color] hover:bg-white/[0.14]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2997ff]",
                  decision === null && "pointer-events-none opacity-0"
                )}
                tabIndex={decision === null ? -1 : 0}
                aria-hidden={decision === null ? true : undefined}
              >
                <RotateCcw aria-hidden="true" className="size-3.5" />
                Run again
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* The floor: a pool of light and the faint reflection under the window. */}
      <div
        aria-hidden="true"
        className="pro-floor pointer-events-none absolute -bottom-20 left-1/2 h-28 w-[78%] -translate-x-1/2"
      />
    </div>
  )
}
