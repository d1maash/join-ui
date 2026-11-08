"use client"

import * as React from "react"
import { TerminalSquare } from "lucide-react"
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react"

import {
  ApprovalGate,
  type ApprovalGateDecision,
  type ApprovalGateProps,
} from "@/registry/components/approval-gate"

/*
 * The product shot: requests arriving one after another, stacked the way
 * notifications are. Each one's clock drains for a few seconds, then it is
 * answered — allowed, or denied and struck through — and the next one rises
 * into its place. Under reduced motion it is a single request, still, waiting.
 */

const SCENE = { width: 540, height: 340 }

type Request = Pick<
  ApprovalGateProps,
  "title" | "reason" | "tool" | "meta" | "command" | "risk"
> & { id: string; outcome: ApprovalGateDecision }

const REQUESTS: [Request, ...Request[]] = [
  {
    id: "reinstall",
    title: "Reinstall the dependencies",
    reason: "The lockfile no longer matches node_modules.",
    tool: "bash",
    meta: "~/join-ui",
    command: "rm -rf node_modules && pnpm install",
    risk: "high",
    outcome: "allow",
  },
  {
    id: "push",
    title: "Rewrite the remote history",
    reason: "Squash the last four commits on main.",
    tool: "git",
    meta: "main",
    command: "git push --force origin main",
    risk: "high",
    outcome: "deny",
  },
  {
    id: "publish",
    title: "Publish the package",
    reason: "Version 2.4.0 is built and tagged.",
    tool: "bash",
    meta: "~/join-ui",
    command: "pnpm publish --access public",
    risk: "medium",
    outcome: "allow",
  },
]

/** Milliseconds the request waits, and then how long its answer is held. */
const ASK = 2800
const ANSWERED = 1900
const EASE = [0.32, 0.72, 0, 1] as const

export default function Thumb() {
  const [ref, scale] = useFit(SCENE.width, SCENE.height)
  const reduceMotion = useReducedMotion()
  const inView = useInView(ref, { amount: 0.3 })
  const [turn, setTurn] = React.useState(0)
  const [answered, setAnswered] = React.useState(false)

  React.useEffect(() => {
    if (reduceMotion || !inView) return
    const timer = window.setTimeout(
      () => {
        if (answered) {
          setAnswered(false)
          setTurn((n) => n + 1)
        } else {
          setAnswered(true)
        }
      },
      answered ? ANSWERED : ASK
    )
    return () => window.clearTimeout(timer)
  }, [answered, turn, inView, reduceMotion])

  const request = REQUESTS[turn % REQUESTS.length] ?? REQUESTS[0]

  return (
    <div ref={ref} className="relative flex size-full items-center justify-center overflow-hidden">
      {scale === null ? null : (
        <div
          className="relative flex shrink-0 animate-fade-in items-center justify-center"
          style={{ width: SCENE.width, height: SCENE.height, transform: `scale(${scale})` }}
        >
          {/* A warm aura, the hue of a request with consequences. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-10 top-8 bottom-0 rounded-full opacity-70 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--critical) 16%, transparent), color-mix(in oklab, var(--caution) 10%, transparent) 60%, transparent)",
            }}
          />

          <div className="relative w-[468px]">
            {/* The stack behind: two requests still to come, peeking out below. */}
            <div
              aria-hidden="true"
              className="absolute inset-x-6 -bottom-[14px] h-16 rounded-soft-lg border border-border/60 bg-card opacity-50 shadow-[0_8px_24px_-10px_rgb(0_0_0/0.16)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-3 -bottom-[7px] h-16 rounded-soft-lg border border-border/60 bg-card opacity-80 shadow-[0_8px_24px_-10px_rgb(0_0_0/0.16)]"
            />

            {reduceMotion ? (
              <Gate request={REQUESTS[0]} decision={null} still />
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={turn}
                  initial={{ opacity: 0, y: 22, scale: 0.96, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{
                    opacity: 0,
                    y: -18,
                    scale: 0.98,
                    filter: "blur(4px)",
                    transition: { duration: 0.32, ease: EASE },
                  }}
                  transition={{ type: "spring", visualDuration: 0.5, bounce: 0.2 }}
                >
                  <Gate request={request} decision={answered ? request.outcome : null} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Gate({
  request,
  decision,
  still = false,
}: {
  request: Request
  decision: ApprovalGateDecision | null
  /** No clock: a still shot has nothing counting down in it. */
  still?: boolean
}) {
  return (
    <ApprovalGate
      title={request.title}
      reason={request.reason}
      tool={request.tool}
      meta={request.meta}
      command={request.command}
      risk={request.risk}
      prefix="$"
      timeout={still ? undefined : 12_000}
      icon={still ? <TerminalSquare /> : undefined}
      pauseWhileReading={false}
      hotkeys="off"
      announce={false}
      decision={decision}
      /* Opaque here: the stack behind would otherwise show through the material. */
      className="relative bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_20px_48px_-16px_rgb(0_0_0/0.22)]"
    />
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
