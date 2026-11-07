"use client"

import * as React from "react"
import { useInView } from "motion/react"

import { cn } from "@/lib/utils"
import { ToolTrace, type ToolTraceStep } from "@/registry/components/tool-trace"

import { useReducedMotionPref } from "../plate-figure"

/*
 * Plate 07. An agent run playing itself out while the plate is on screen:
 * each tool turns solid as it starts, opens and writes its output, folds
 * away and hands the rail on. The finished run holds, then starts over.
 * Still, it is the same card with the third tool in flight.
 */
const SCRIPT: Array<{ step: ToolTraceStep; dwell: number }> = [
  {
    dwell: 1500,
    step: {
      id: "read",
      name: "read_file",
      summary: "app/checkout/page.tsx",
      meta: "0.2s",
      output: ["→ 214 lines, 7.9 kB", "export default function Checkout() {"],
    },
  },
  {
    dwell: 1700,
    step: {
      id: "grep",
      name: "grep_search",
      summary: "pattern: useCart",
      meta: "0.3s",
      output: ["app/checkout/page.tsx:12", "lib/cart.ts:4", "→ 2 matches"],
    },
  },
  {
    dwell: 1700,
    step: {
      id: "edit",
      name: "edit_file",
      summary: "lib/cart.ts",
      meta: "0.8s",
      output: ["+ 12 insertions", "- 4 deletions", "→ 1 file changed"],
    },
  },
  {
    dwell: 1900,
    step: {
      id: "test",
      name: "run_tests",
      summary: "pnpm test",
      meta: "2.1s",
      output: ["✓ 48 passed", "✓ 0 failed", "→ exit 0"],
    },
  },
]

const QUEUED = 1000
const HOLD = 3200
const STILL = 2

export default function ToolTraceScene() {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotionPref()
  const inView = useInView(ref, { amount: 0.3 })
  const [cursor, setCursor] = React.useState(-1)

  React.useEffect(() => {
    if (reduce || !inView) return
    const timer = window.setTimeout(
      () => setCursor((index) => (index >= SCRIPT.length ? -1 : index + 1)),
      cursor < 0 ? QUEUED : (SCRIPT[cursor]?.dwell ?? HOLD)
    )
    return () => window.clearTimeout(timer)
  }, [cursor, inView, reduce])

  const at = reduce ? STILL : cursor
  const steps = SCRIPT.map(({ step }, index) => ({
    ...step,
    state: index < at ? "done" : index === at ? "running" : "pending",
    meta: index < at ? step.meta : undefined,
  })) satisfies ToolTraceStep[]
  const done = Math.max(0, Math.min(at, SCRIPT.length))
  const open = at < 0 ? [] : [SCRIPT[Math.min(at, SCRIPT.length - 1)]?.step.id ?? ""]

  return (
    <div ref={ref} className="w-full max-w-[600px]">
      <ToolTrace
        label="Agent run"
        status={at >= SCRIPT.length ? "Done" : at < 0 ? "Queued" : "Running"}
        steps={steps}
        expanded={open}
        stream={!reduce}
        lineSpeed={150}
        announce={false}
        maxConsoleHeight="5.5rem"
        className="h-[500px]"
        footer={
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-muted-foreground tabular-nums">
              {done} of {SCRIPT.length} tools
            </span>
            <span className="relative h-1.5 w-32 overflow-hidden rounded-full bg-muted">
              <span
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full",
                  done === SCRIPT.length ? "bg-positive" : "bg-info",
                  !reduce &&
                    "transition-[width,background-color] duration-500 ease-[var(--ease-out-soft)]"
                )}
                style={{ width: `${(done / SCRIPT.length) * 100}%` }}
              />
            </span>
          </div>
        }
      />
    </div>
  )
}
