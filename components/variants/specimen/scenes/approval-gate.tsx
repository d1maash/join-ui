"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ApprovalGate,
  type ApprovalGateDecision,
} from "@/registry/components/approval-gate"

/*
 * Plate 02, drawn as a state diagram. One request on the left, live — its
 * clock runs, its keys work — and the three ways out of it on the right,
 * each a still of the same request in its final state. Connectors carry the
 * trigger for each: Y, N or Esc, or the clock reaching zero. Answer the live
 * gate and the path it took is inked in orange.
 */

const REQUEST = {
  title: "Reinstall the dependencies",
  reason: "The lockfile no longer matches node_modules.",
  tool: "bash",
  meta: "~/join-ui",
  prefix: "$",
  command: "rm -rf node_modules && pnpm install",
  risk: "high" as const,
}

const OUTCOMES: Array<{
  decision: ApprovalGateDecision
  keys: string[]
  trigger: string
}> = [
  { decision: "allow", keys: ["Y"], trigger: "allow" },
  { decision: "deny", keys: ["N", "Esc"], trigger: "deny" },
  { decision: "expire", keys: ["0:00"], trigger: "expire" },
]

export default function ApprovalGateScene() {
  const [decision, setDecision] = React.useState<ApprovalGateDecision | null>(null)
  const root = React.useRef<HTMLDivElement>(null)
  const live = React.useRef<HTMLDivElement>(null)
  const targets = React.useRef<Array<HTMLDivElement | null>>([])
  const paths = React.useRef<Array<SVGPathElement | null>>([])
  const heads = React.useRef<Array<SVGPathElement | null>>([])
  const tags = React.useRef<Array<HTMLDivElement | null>>([])
  const [inView, setInView] = React.useState(false)

  React.useEffect(() => {
    const node = root.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), {
      rootMargin: "80px 0px",
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const container = root.current
    const source = live.current
    if (!container || !source) return

    const measure = () => {
      const c = container.getBoundingClientRect()
      const s = source.getBoundingClientRect()
      const sx = s.right - c.left
      const sy = s.top - c.top + Math.min(s.height / 2, 120)
      OUTCOMES.forEach((_, index) => {
        const target = targets.current[index]
        const path = paths.current[index]
        const head = heads.current[index]
        const tag = tags.current[index]
        if (!target || !path || !head) return
        const t = target.getBoundingClientRect()
        const tx = t.left - c.left - 10
        const ty = t.top - c.top + 34
        const mid = sx + Math.min(28, (tx - sx) * 0.25)
        const r = Math.min(10, Math.abs(ty - sy) / 2)
        const dir = ty > sy ? 1 : -1
        const d =
          Math.abs(ty - sy) < 1
            ? `M${sx} ${sy} H${tx}`
            : `M${sx} ${sy} H${mid - r} Q${mid} ${sy} ${mid} ${sy + r * dir} V${ty - r * dir} Q${mid} ${ty} ${mid + r} ${ty} H${tx}`
        path.setAttribute("d", d)
        head.setAttribute("d", `M${tx - 7} ${ty - 4.5} L${tx} ${ty} L${tx - 7} ${ty + 4.5}`)
        if (tag) {
          tag.style.left = `${mid + 16}px`
          tag.style.top = `${ty - 32}px`
          tag.style.width = `${Math.max(0, tx - mid - 20)}px`
        }
      })
    }

    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(container)
    let frame = 0
    if (inView) {
      const tick = () => {
        measure()
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
    }
  }, [inView])

  return (
    <div
      ref={root}
      className="relative grid w-full max-w-[1080px] grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-[clamp(96px,11vw,168px)]"
    >
      <div className="flex flex-col gap-3">
        <span className="sp-label">State 0 — waiting</span>
        <div data-legend-top="" className="mt-5 mb-6 hidden lg:block" />
        <div ref={live} data-live="">
          <ApprovalGate
            {...REQUEST}
            timeout={30_000}
            decision={decision}
            onDecision={setDecision}
            className="bg-card shadow-[0_1px_0_rgb(17_17_17/0.04),0_24px_48px_-24px_rgb(17_17_17/0.28)]"
          />
        </div>
        <div className="flex min-h-8 items-center justify-between gap-3 px-1">
          <p className="sp-mono text-[12px] text-[var(--sp-ink-2)]">
            {decision === null ? "onDecision — waiting" : `onDecision("${decision}")`}
          </p>
          {decision !== null ? (
            <button
              type="button"
              onClick={() => setDecision(null)}
              className="sp-label inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[2px] px-2 !text-[var(--sp-ink)] transition-colors hover:bg-[rgb(17_17_17/0.06)]"
            >
              <RotateCcw aria-hidden="true" className="size-3" strokeWidth={2.5} />
              Ask again
            </button>
          ) : (
            <span className="sp-label hidden sm:inline">Click the card, then Y or N</span>
          )}
        </div>
        <div data-legend-bottom="" className="mt-8 hidden lg:block" />
      </div>

      <ol className="flex flex-col gap-7">
        {OUTCOMES.map((outcome, index) => {
          const taken = decision === outcome.decision
          return (
            <li
              key={outcome.decision}
              className="flex flex-col gap-2"
              data-outcome={outcome.decision}
            >
              <div className="flex items-center gap-2 lg:hidden">
                {outcome.keys.map((key) => (
                  <kbd key={key} className="sp-keycap sp-keycap--sm">
                    {key}
                  </kbd>
                ))}
                <span className="sp-label">{outcome.trigger}</span>
              </div>
              <div
                ref={(node) => {
                  targets.current[index] = node
                }}
                className={cn(
                  "relative rounded-[18px] transition-[box-shadow] duration-300",
                  taken
                    ? "shadow-[0_0_0_1.5px_#ff4f00,0_0_0_6px_rgb(255_79_0/0.1)]"
                    : "shadow-[0_0_0_1px_transparent]"
                )}
              >
                <ApprovalGate
                  {...REQUEST}
                  size="sm"
                  decision={outcome.decision}
                  announce={false}
                  hotkeys="off"
                  className="bg-card/80"
                />
              </div>
            </li>
          )
        })}
      </ol>

      {/* The connectors, and the trigger written on each. Desktop only. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block"
      >
        {OUTCOMES.map((outcome, index) => {
          const taken = decision === outcome.decision
          return (
            <g
              key={outcome.decision}
              className="transition-[stroke] duration-300"
              stroke={taken ? "#ff4f00" : "rgb(17 17 17 / 0.55)"}
              strokeWidth={taken ? 1.5 : 1}
              fill="none"
            >
              <path
                ref={(node) => {
                  paths.current[index] = node
                }}
                d="M0 0"
                strokeDasharray={outcome.decision === "expire" ? "4 4" : undefined}
              />
              <path
                ref={(node) => {
                  heads.current[index] = node
                }}
                d="M0 0"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )
        })}
      </svg>
      {OUTCOMES.map((outcome, index) => (
        <div
          key={outcome.decision}
          ref={(node) => {
            tags.current[index] = node
          }}
          aria-hidden="true"
          className="pointer-events-none absolute hidden items-center gap-1.5 lg:flex"
        >
          {outcome.keys.map((key) => (
            <kbd key={key} className="sp-keycap sp-keycap--sm">
              {key}
            </kbd>
          ))}
          <span
            className={cn(
              "sp-label truncate transition-colors",
              decision === outcome.decision && "!text-[var(--sp-ink)]"
            )}
          >
            {outcome.trigger}
          </span>
        </div>
      ))}
    </div>
  )
}
