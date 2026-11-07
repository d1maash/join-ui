"use client"

import * as React from "react"
import { useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { ToolTrace, type ToolTraceStep } from "@/registry/components/tool-trace"

/*
 * The product shot: an agent run playing itself out. Each tool turns solid as
 * it starts, opens and writes its output, then folds away and hands the rail
 * on; the finished run holds for a moment and starts over. Under reduced
 * motion it is the same card, still, with the third tool in flight.
 */

const SCENE = { width: 500, height: 380 }

const SCRIPT: Array<{ step: ToolTraceStep; dwell: number }> = [
  {
    dwell: 1300,
    step: {
      id: "read",
      name: "read_file",
      summary: "app/checkout/page.tsx",
      meta: "0.2s",
      output: ["→ 214 lines, 7.9 kB", "export default function Checkout() {"],
    },
  },
  {
    dwell: 1500,
    step: {
      id: "grep",
      name: "grep_search",
      summary: 'pattern: "useCart"',
      meta: "0.3s",
      output: ["app/checkout/page.tsx:12", "lib/cart.ts:4", "→ 2 matches"],
    },
  },
  {
    dwell: 1500,
    step: {
      id: "edit",
      name: "edit_file",
      summary: "lib/cart.ts",
      meta: "0.8s",
      output: ["+ 12 insertions", "- 4 deletions", "→ 1 file changed"],
    },
  },
  {
    dwell: 1700,
    step: {
      id: "test",
      name: "run_tests",
      summary: "pnpm test",
      meta: "2.1s",
      output: ["✓ 48 passed", "✓ 0 failed", "→ exit 0"],
    },
  },
]

/** How long the queued run, and then the finished one, are held. */
const QUEUED = 900
const HOLD = 2600
const STILL = 2

export default function Thumb() {
  const [ref, scale] = useFit(SCENE.width, SCENE.height)
  const reduceMotion = useReducedMotion()
  const inView = useInView(ref, { amount: 0.3 })
  /*
   * -1 is the run queued, so no tool is already in flight when the card
   * mounts — a step that mounts running is drawn as finished text, and the
   * first tool would never get to write itself out.
   */
  const [cursor, setCursor] = React.useState(-1)

  React.useEffect(() => {
    if (reduceMotion || !inView) return
    const timer = window.setTimeout(
      () => setCursor((index) => (index >= SCRIPT.length ? -1 : index + 1)),
      cursor < 0 ? QUEUED : (SCRIPT[cursor]?.dwell ?? HOLD)
    )
    return () => window.clearTimeout(timer)
  }, [cursor, inView, reduceMotion])

  const at = reduceMotion ? STILL : cursor
  const steps = SCRIPT.map(({ step }, index) => ({
    ...step,
    state: index < at ? "done" : index === at ? "running" : "pending",
    meta: index < at ? step.meta : undefined,
  })) satisfies ToolTraceStep[]
  const done = Math.max(0, Math.min(at, SCRIPT.length))

  return (
    <div ref={ref} className="relative flex size-full items-center justify-center overflow-hidden">
      {scale === null ? null : (
        <div
          className="relative flex shrink-0 animate-fade-in items-start justify-center pt-1"
          style={{ width: SCENE.width, height: SCENE.height, transform: `scale(${scale})` }}
        >
          {/* A soft aura of the running hue, so the card reads on any surface. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-4 top-16 bottom-2 rounded-full opacity-70 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--info) 24%, transparent), transparent)",
            }}
          />
          <ToolTrace
            label="Agent run"
            steps={steps}
            size="sm"
            stream={!reduceMotion}
            lineSpeed={150}
            announce={false}
            maxConsoleHeight="4.5rem"
            className="relative h-[372px] w-[436px] overflow-hidden shadow-[0_1px_2px_rgb(0_0_0/0.04),0_18px_44px_-14px_rgb(0_0_0/0.18)]"
            footer={
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {done} of {SCRIPT.length} tools
                </span>
                <span className="relative h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                  <span
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full",
                      done === SCRIPT.length ? "bg-positive" : "bg-info",
                      !reduceMotion &&
                        "transition-[width,background-color] duration-500 ease-[var(--ease-out-soft)]"
                    )}
                    style={{ width: `${(done / SCRIPT.length) * 100}%` }}
                  />
                </span>
              </div>
            }
          />
        </div>
      )}
    </div>
  )
}

/**
 * Scales a fixed-size scene to fit its parent. Nothing is drawn until the
 * parent has been measured, so the shot never flashes at the wrong size.
 */
function useFit(width: number, height: number, fill = 0.94) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState<number | null>(null)

  React.useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const measure = () => {
      const w = node.clientWidth
      const h = node.clientHeight
      if (w > 0 && h > 0) setScale(Math.min(w / width, h / height) * fill)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [width, height, fill])

  return [ref, scale] as const
}
