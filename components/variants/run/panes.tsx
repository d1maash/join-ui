"use client"

import * as React from "react"
import { motion, type MotionValue } from "motion/react"

import { MODELS } from "@/components/previews/fixtures/agent-hive"
import { MARKS } from "@/components/previews/fixtures/glass-crest"
import { cn } from "@/lib/utils"
import { AgentHive, type AgentHiveModel, type AgentHiveRun } from "@/registry/components/agent-hive"
import { ApprovalGate, type ApprovalGateDecision } from "@/registry/components/approval-gate"
import { CarbonCopy } from "@/registry/components/carbon-copy"
import { FocusStack } from "@/registry/components/focus-stack"
import { CrestAction, CrestQuiet, GlassCrest } from "@/registry/components/glass-crest"
import { StatusTimeline } from "@/registry/components/status-timeline"
import { ToolTrace, type ToolTraceStep } from "@/registry/components/tool-trace"

import { BRANCH, FEATURES, PUSH_COMMAND, RUN_NO, SITE, shipSteps, type Decision } from "./script"

export { MODELS }

export type PaneSize = "sm" | "md"

/* ─── 01 Pick ─────────────────────────────────────────────────────────────── */

export function PickPane({
  model,
  onModel,
  runs,
  onGenerate,
  size,
  cursor,
}: {
  model: string
  onModel: (id: string) => void
  runs: AgentHiveRun[]
  onGenerate: (model: AgentHiveModel) => void
  size: PaneSize
  /** A scripted pointer: which cell it rests on, or the action it presses. */
  cursor?: { target: string; pressed: boolean } | null
}) {
  const host = React.useRef<HTMLDivElement>(null)
  const [hand, setHand] = React.useState(false)
  return (
    <div
      ref={host}
      className="relative flex h-full w-full items-center justify-center px-6 py-5"
      onPointerEnter={() => setHand(true)}
      onPointerLeave={() => setHand(false)}
    >
      {cursor && !hand ? <ScriptedCursor host={host} target={cursor.target} pressed={cursor.pressed} /> : null}
      <AgentHive
        label="Model"
        models={MODELS}
        value={model}
        onValueChange={onModel}
        runs={runs}
        onGenerate={onGenerate}
        variant="plain"
        size={size}
        maxRuns={size === "sm" ? 2 : 3}
        className={cn("w-full", size === "sm" ? "max-w-[20rem]" : "max-w-[23rem]")}
      />
    </div>
  )
}

/**
 * The pointer a demo video would have. It goes to whatever the story is doing
 * — the cell the selection lands on, then the action — so the reader sees the
 * press instead of being told about it. It steps aside the moment a real
 * pointer comes into the pane.
 */
function ScriptedCursor({
  host,
  target,
  pressed,
}: {
  host: React.RefObject<HTMLDivElement | null>
  target: string
  pressed: boolean
}) {
  const [at, setAt] = React.useState<{ x: number; y: number } | null>(null)

  React.useLayoutEffect(() => {
    const root = host.current
    if (!root) return
    const measure = () => {
      const node =
        target === "generate"
          ? Array.from(root.querySelectorAll<HTMLElement>("button:not([role=radio])")).find(
              (button) => button.textContent?.trim() === "Generate"
            )
          : root.querySelector<HTMLElement>(`[role=radio][aria-label="${target}"]`)
      if (!node) return
      const box = root.getBoundingClientRect()
      const rect = node.getBoundingClientRect()
      const k = box.width / Math.max(1, root.offsetWidth)
      setAt({
        x: (rect.left + rect.width * 0.58 - box.left) / k,
        y: (rect.top + rect.height * 0.62 - box.top) / k,
      })
    }
    measure()
    const timer = window.setTimeout(measure, 420)
    return () => window.clearTimeout(timer)
  }, [host, target])

  if (!at) return null
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 z-20"
      initial={{ x: at.x + 40, y: at.y + 60, opacity: 0 }}
      animate={{ x: at.x, y: at.y, opacity: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 22, mass: 0.9 }}
    >
      <motion.svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        className="drop-shadow-[0_2px_4px_rgb(0_0_0/0.5)]"
        animate={pressed ? { scale: [1, 0.82, 1] } : { scale: 1 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        style={{ originX: 0.2, originY: 0.15 }}
      >
        <path
          d="M5.5 3.2v15.9l4.1-3.9 2.6 6 2.6-1.1-2.6-5.9h5.7z"
          fill="#fff"
          stroke="#000"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </motion.svg>
      {pressed ? (
        <motion.span
          key="ring"
          className="absolute -top-3 -left-3 size-8 rounded-full border border-white/70"
          initial={{ scale: 0.3, opacity: 0.9 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ) : null}
    </motion.div>
  )
}

/* ─── 02 Work ─────────────────────────────────────────────────────────────── */

export function WorkPane({ steps, size }: { steps: ToolTraceStep[]; size: PaneSize }) {
  return (
    <div
      className={cn(
        "flex h-full w-full justify-center",
        size === "sm" ? "items-start px-3 py-3" : "items-start px-8 pt-7 pb-6"
      )}
    >
      <ToolTrace
        steps={steps}
        label={RUN_NO}
        size={size}
        maxConsoleHeight="6.5rem"
        className={cn(size === "sm" ? "max-w-full" : "max-w-[32rem]")}
      />
    </div>
  )
}

/* ─── 03 Ask ──────────────────────────────────────────────────────────────── */

/**
 * The gate, as a sheet: it drops out from under the toolbar the way a Mac
 * dialog drops out of a window's title bar, attached to the window rather than
 * floating over the page.
 */
export function AskGate({
  decision,
  onDecision,
  hotkeys,
  size,
  sheet = true,
  className,
}: {
  decision: Decision
  onDecision: (decision: ApprovalGateDecision) => void
  hotkeys: "global" | "focus" | "off"
  size: PaneSize
  sheet?: boolean
  className?: string
}) {
  return (
    <ApprovalGate
      title={`Force-push to ${BRANCH}`}
      reason="The remote still has a commit from an earlier run. Overwriting it keeps the history straight."
      tool="git"
      command={PUSH_COMMAND}
      meta="~/lumen/web"
      prefix="$"
      risk="medium"
      riskLabel="Rewrites history"
      timeout={24000}
      decision={decision}
      onDecision={onDecision}
      hotkeys={hotkeys}
      size={size}
      className={cn(
        sheet &&
          "rounded-t-none border-t-0 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.85),0_0_0_1px_rgb(255_255_255/0.06)]",
        className
      )}
    />
  )
}

/* ─── 04 Ship ─────────────────────────────────────────────────────────────── */

export function ShipPane({
  active,
  safePath,
  size,
}: {
  active: number
  safePath: boolean
  size: PaneSize
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        size === "sm" ? "px-3 py-3" : "px-8 py-6"
      )}
    >
      <StatusTimeline
        label="Deploy"
        steps={shipSteps(active, safePath)}
        activeStep={active}
        size={size}
        status={active >= 4 ? "Live" : undefined}
        className={cn(size === "sm" ? "max-w-full" : "max-w-[27rem]")}
      />
    </div>
  )
}

/* ─── 05 Output ───────────────────────────────────────────────────────────── */

function LumenMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 2 21 7v10l-9 5-9-5V7z" fill="currentColor" opacity="0.18" />
      <path d="M12 6.5 16.8 9.2v5.6L12 17.5l-4.8-2.7V9.2z" fill="currentColor" />
    </svg>
  )
}

/**
 * What the agent built: a launch page for a made-up wallet, set on the light
 * tokens because it is somebody else's site. Glass Crest leads it, Carbon Copy
 * sets the second headline, Focus Stack turns through the features.
 *
 * `scroll` scrolls the page inside the browser when the stage drives it; the
 * stacked layout lets the page run its full height instead.
 */
export function OutputPage({
  scroll,
  size,
  live,
}: {
  scroll?: MotionValue<number>
  size: PaneSize
  /** Mounts the second section's headline, so it sets itself when it arrives. */
  live: boolean
}) {
  const compact = size === "sm"

  return (
    <div
      className={cn(
        "light relative w-full overflow-hidden bg-background text-foreground",
        scroll ? "absolute inset-0" : ""
      )}
    >
      <motion.div style={scroll ? { y: scroll } : undefined}>
        <div
          className={cn(
            "flex items-center justify-between border-b border-black/[0.06]",
            compact ? "h-10 px-4" : "h-11 px-6"
          )}
        >
          <span className="flex items-center gap-1.5 text-[13px] font-semibold tracking-[-0.01em]">
            <LumenMark className="size-4" />
            {SITE.name}
          </span>
          <span className="flex items-center gap-4 text-[12px] text-muted-foreground">
            <span className={cn(compact && "hidden")}>Assets</span>
            <span className={cn(compact && "hidden")}>Security</span>
            <span className="rounded-full bg-foreground px-2.5 py-1 text-[11px] font-medium text-background">
              Get Lumen
            </span>
          </span>
        </div>

        <div className={cn(compact ? "px-4 pt-6 pb-8" : "px-8 pt-6 pb-10")}>
          <GlassCrest
            size="sm"
            marks={MARKS}
            headingLevel={3}
            crestLabel="Supported assets"
            eyebrow="Lumen 2"
            headline={
              <>
                Every asset. <CrestQuiet>One quiet wallet.</CrestQuiet>
              </>
            }
            description="Hold, swap and send forty assets from one balance, with keys that stay on your device."
            actions={<CrestAction tabIndex={-1}>Get Lumen</CrestAction>}
            drag={false}
          />
        </div>

        <div
          className={cn(
            "grid items-center border-t border-black/[0.06]",
            compact ? "gap-6 px-5 py-10" : "grid-cols-[1fr_1fr] gap-6 px-10 py-12"
          )}
        >
          <div className="flex flex-col gap-3">
            {live ? (
              <CarbonCopy
                as="p"
                align="start"
                lines={["Hold it all.", "Move it all."]}
                className={cn(
                  "font-semibold tracking-[-0.03em]",
                  compact ? "text-[34px] leading-[1.05]" : "text-[44px] leading-[1.04]"
                )}
              />
            ) : (
              <p
                className={cn(
                  "font-semibold tracking-[-0.03em] opacity-0",
                  compact ? "text-[34px] leading-[1.05]" : "text-[44px] leading-[1.04]"
                )}
                aria-hidden="true"
              >
                Hold it all.
                <br />
                Move it all.
              </p>
            )}
            <p className="max-w-[17rem] text-[13px] leading-[1.5] text-muted-foreground">
              Swaps settle at the price you were quoted, or they don’t settle at all.
            </p>
          </div>
          <div className="flex justify-center">
            <FocusStack items={FEATURES} size="sm" label="Features" interval={2200} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
