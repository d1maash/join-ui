"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const PULSE_CSS = `
@keyframes joinway-status-pulse {
  0%   { transform: scale(0.85); opacity: 0.65; }
  70%  { transform: scale(2.1);  opacity: 0; }
  100% { transform: scale(2.1);  opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  [data-joinway-status-ring] { animation: none !important; opacity: 0.35 !important; }
}
`

export type StatusPulseTone =
  | "operational"
  | "degraded"
  | "outage"
  | "maintenance"
  | "idle"

const TONES: Record<StatusPulseTone, { dot: string; text: string; defaultLabel: string }> =
  {
    operational: {
      dot: "bg-success",
      text: "text-success",
      defaultLabel: "All systems operational",
    },
    degraded: {
      dot: "bg-warning",
      text: "text-warning",
      defaultLabel: "Degraded performance",
    },
    outage: {
      dot: "bg-destructive",
      text: "text-destructive",
      defaultLabel: "Major outage",
    },
    maintenance: {
      dot: "bg-primary",
      text: "text-primary",
      defaultLabel: "Under maintenance",
    },
    idle: {
      dot: "bg-muted-foreground",
      text: "text-muted-foreground",
      defaultLabel: "Idle",
    },
  }

const SIZES = {
  sm: { dot: "size-1.5", text: "text-xs", gap: "gap-1.5", pad: "px-2 py-1" },
  md: { dot: "size-2", text: "text-sm", gap: "gap-2", pad: "px-2.5 py-1.5" },
  lg: { dot: "size-2.5", text: "text-sm", gap: "gap-2.5", pad: "px-3 py-2" },
} as const

export interface StatusPulseProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  tone?: StatusPulseTone
  /** Overrides the tone's default label. */
  label?: React.ReactNode
  size?: keyof typeof SIZES
  /** Draw the expanding ring. Automatically off for `idle`. */
  pulse?: boolean
  /** Wrap in a bordered chip instead of bare text. */
  variant?: "bare" | "chip"
  /**
   * Announce changes to assistive technology. Leave on for live dashboards;
   * turn it off when many indicators share one page.
   */
  live?: boolean
  /** Timestamp or secondary detail rendered after the label. */
  detail?: React.ReactNode
}

/**
 * A status indicator with an expanding ring — the small piece every dashboard
 * and status page ends up rewriting.
 *
 * Meaning is never carried by colour alone: the label is always rendered as
 * text. When `live` is set the wrapper is a polite `role="status"` region, so
 * transitions from operational to degraded are announced without interrupting.
 */
export function StatusPulse({
  tone = "operational",
  label,
  size = "md",
  pulse = true,
  variant = "bare",
  live = true,
  detail,
  className,
  ...props
}: StatusPulseProps) {
  const toneStyles = TONES[tone]
  const sizeStyles = SIZES[size]
  const shouldPulse = pulse && tone !== "idle"

  return (
    <div
      role={live ? "status" : undefined}
      aria-live={live ? "polite" : undefined}
      className={cn(
        "inline-flex items-center",
        sizeStyles.gap,
        variant === "chip" &&
          cn(
            "rounded-full border border-border bg-card shadow-[var(--shadow-subtle)]",
            sizeStyles.pad
          ),
        className
      )}
      {...props}
    >
      <style href="joinway-status-pulse" precedence="default">
        {PULSE_CSS}
      </style>

      <span className="relative flex shrink-0 items-center justify-center">
        {shouldPulse ? (
          <span
            data-joinway-status-ring=""
            aria-hidden="true"
            style={{
              animation: "joinway-status-pulse 2s var(--ease-out-soft, ease-out) infinite",
            }}
            className={cn("absolute rounded-full", sizeStyles.dot, toneStyles.dot)}
          />
        ) : null}
        <span
          aria-hidden="true"
          className={cn("relative rounded-full", sizeStyles.dot, toneStyles.dot)}
        />
      </span>

      <span className={cn("font-medium", sizeStyles.text, toneStyles.text)}>
        {label ?? toneStyles.defaultLabel}
      </span>

      {detail ? (
        <span className={cn("text-muted-foreground", sizeStyles.text)}>{detail}</span>
      ) : null}
    </div>
  )
}
