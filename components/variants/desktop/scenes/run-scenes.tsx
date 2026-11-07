"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"

import { ApprovalGate } from "@/registry/components/approval-gate"
import { StatusTimeline } from "@/registry/components/status-timeline"
import { ToolTrace } from "@/registry/components/tool-trace"
import { cn } from "@/lib/utils"

import { AppIcon } from "../app-icon"
import { GATE, deployStatus, deploySteps, traceStatus, traceSteps, useRun } from "../run"

/*
 * The three faces of the one run — see `run.tsx` for why they share it.
 */

export function AgentRunScene({
  size = "md",
  onShowRequest,
  requestHidden = false,
  className,
}: {
  size?: "sm" | "md"
  /** Brings the notification back when it was dismissed while still waiting. */
  onShowRequest?: () => void
  requestHidden?: boolean
  className?: string
}) {
  const run = useRun()
  const steps = traceSteps(run.phase)
  const done = steps.filter((step) => step.state === "done").length
  const over = run.phase === "done" || run.phase === "denied" || run.phase === "expired"

  return (
    <ToolTrace
      label="Agent run"
      status={traceStatus(run.phase)}
      steps={steps}
      variant="plain"
      size={size}
      maxConsoleHeight="7.5rem"
      lineSpeed={110}
      className={cn("px-4 pt-3.5 pb-3", className)}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] text-[var(--d-ink-3)] tabular-nums">
            {done} of {steps.length} done
          </span>
          {run.phase === "awaiting" && requestHidden && onShowRequest ? (
            <button type="button" className="d-btn" data-tone="blue" onClick={onShowRequest}>
              Show request
            </button>
          ) : (
            <button type="button" className="d-btn" onClick={run.restart} disabled={!over}>
              <RotateCcw aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
              Run again
            </button>
          )}
        </div>
      }
    />
  )
}

export function ApprovalNotice({
  hotkeys,
  className,
  onClose,
}: {
  hotkeys: "global" | "focus"
  className?: string
  onClose?: () => void
}) {
  const run = useRun()
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-1">
        <AppIcon id="approval-gate" className="size-[18px]" />
        <span className="text-[11px] font-semibold tracking-[0.02em] text-[var(--d-ink-2)] uppercase">
          Approval Gate
        </span>
        <span className="ml-auto text-[12px] text-[var(--d-ink-3)]">now</span>
      </div>
      <ApprovalGate
        key={run.take}
        variant="plain"
        size="sm"
        className="px-4 pt-1.5 pb-4"
        title={GATE.title}
        reason={GATE.reason}
        tool={GATE.tool}
        meta={GATE.meta}
        prefix={GATE.prefix}
        command={GATE.command}
        risk="medium"
        timeout={GATE.timeout}
        decision={run.decision}
        onDecision={run.decide}
        hotkeys={hotkeys}
        shortcuts={{ allow: ["y"], deny: ["n"] }}
        label="Approval request"
      />
      {onClose ? (
        <button type="button" className="d-banner-close" aria-label="Dismiss notification" onClick={onClose}>
          <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
            <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}

export function DeployWidget({ className, compact = false }: { className?: string; compact?: boolean }) {
  const run = useRun()
  const steps = deploySteps(run.phase)
  return (
    <div className={cn("flex flex-col px-4 pt-4 pb-3", className)}>
      <StatusTimeline
        label="Deploy · acme-app"
        steps={
          compact
            ? steps.map((step) =>
                step.state === "current" || step.state === "waiting" || step.state === "blocked"
                  ? step
                  : { ...step, description: undefined, timestamp: undefined }
              )
            : steps
        }
        status={deployStatus(run.phase)}
        variant="plain"
        size="sm"
      />
    </div>
  )
}
