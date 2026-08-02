"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export type StatusTimelineState = "complete" | "current" | "pending" | "blocked"

export interface StatusTimelineStep {
  /** Stable identity for the rendered list item. */
  id: string
  title: string
  description?: string
  /** Trailing meta, set in mono — e.g. `17 Nov, 13:45`. */
  timestamp?: string
  /** Pins the state instead of deriving it from `activeStep`. */
  state?: StatusTimelineState
  /** Replaces the default state glyph inside the marker. */
  icon?: React.ReactNode
}

/**
 * Spelled out next to every step so the state never rests on the marker's fill
 * alone. Visually hidden where the marker already reads unambiguously.
 */
const STATE_LABEL: Record<StatusTimelineState, string> = {
  complete: "Completed",
  current: "In progress",
  pending: "Not started",
  blocked: "Blocked",
}

const MICRO_LABEL =
  "font-mono text-[0.6875rem] leading-none font-medium tracking-[0.12em] uppercase"

const SIZES = {
  sm: {
    marker: "size-6",
    glyph: "size-3",
    pip: "size-1",
    title: "text-[0.8125rem]",
    meta: "text-[0.6875rem]",
    trail: "pb-4",
    columnGap: "gap-2.5",
    contentOffset: "pt-0.5",
    padding: "p-3",
  },
  md: {
    marker: "size-8",
    glyph: "size-3.5",
    pip: "size-1.5",
    title: "text-sm",
    meta: "text-xs",
    trail: "pb-6",
    columnGap: "gap-3",
    contentOffset: "pt-1",
    padding: "p-4",
  },
} as const

export interface StatusTimelineProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> {
  steps: StatusTimelineStep[]
  /**
   * Index of the step in flight. Everything before it reads as complete,
   * everything after as pending. Ignored for steps that set `state` themselves.
   */
  activeStep?: number
  orientation?: "vertical" | "horizontal"
  size?: "sm" | "md"
  /** Header eyebrow, and the accessible name of the list. */
  label?: string
  /** Header chip copy. Derived from the resolved steps when omitted. */
  status?: string
  /** `plain` drops the card rule and padding so the list sits in your own layout. */
  variant?: "card" | "plain"
  showHeader?: boolean
  /** Rendered below a rule — an action, a note, a summary row. */
  footer?: React.ReactNode
}

/**
 * A step tracker for anything that moves through a fixed sequence: an order
 * being fulfilled, a deployment, an onboarding checklist.
 *
 * State is carried by the marker's fill, a glyph and a text label together, so
 * the component reads the same in the achromatic palette as it would in colour.
 */
export function StatusTimeline({
  steps,
  activeStep = 0,
  orientation = "vertical",
  size = "md",
  label = "Timeline",
  status,
  variant = "card",
  showHeader = true,
  footer,
  className,
  ...props
}: StatusTimelineProps) {
  const reduceMotion = useReducedMotion()
  const labelId = React.useId()
  const scale = SIZES[size]
  const chrome = variant === "card"
  const horizontal = orientation === "horizontal"

  const resolved = steps.map((step, index) => ({
    ...step,
    state:
      step.state ??
      (index < activeStep ? "complete" : index === activeStep ? "current" : "pending"),
  }))

  const summary = summarise(resolved)

  return (
    <div
      className={cn(
        "w-full text-foreground",
        chrome && "border border-border bg-card",
        className
      )}
      {...props}
    >
      {showHeader ? (
        <div
          className={cn(
            "flex items-center gap-3",
            chrome ? "border-b border-border px-4 py-2.5" : "pb-3"
          )}
        >
          <span id={labelId} className={cn(MICRO_LABEL, "text-muted-foreground")}>
            {label}
          </span>
          <span
            aria-hidden="true"
            className="min-w-4 flex-1 border-t border-dashed border-border"
          />
          <span
            className={cn(
              "flex shrink-0 items-center gap-1.5 border px-2 py-1",
              summary.state === "pending"
                ? "border-border text-muted-foreground"
                : "border-foreground text-foreground"
            )}
          >
            <StateGlyph
              state={summary.state}
              className={scale.glyph}
              pipClassName={scale.pip}
            />
            <span className={MICRO_LABEL}>{status ?? summary.label}</span>
          </span>
        </div>
      ) : null}

      <ol
        aria-labelledby={showHeader ? labelId : undefined}
        aria-label={showHeader ? undefined : label}
        className={cn(
          "flex",
          horizontal ? "flex-row" : "flex-col",
          chrome && scale.padding
        )}
      >
        {resolved.map((step, index) => {
          const isLast = index === resolved.length - 1
          const filled = step.state === "complete"

          return (
            <motion.li
              key={step.id}
              aria-current={step.state === "current" ? "step" : undefined}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.32,
                delay: index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "flex min-w-0",
                horizontal ? cn("flex-col gap-2", !isLast && "flex-1") : scale.columnGap
              )}
            >
              <div
                className={cn(
                  "flex shrink-0",
                  horizontal ? "w-full items-center gap-2" : "flex-col items-center"
                )}
              >
                <Marker
                  state={step.state}
                  icon={step.icon}
                  className={scale.marker}
                  glyphClassName={scale.glyph}
                  pipClassName={scale.pip}
                  animate={!reduceMotion}
                />

                {!isLast ? (
                  <motion.span
                    aria-hidden="true"
                    initial={
                      reduceMotion ? false : horizontal ? { scaleX: 0 } : { scaleY: 0 }
                    }
                    animate={{ scaleX: 1, scaleY: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.06 + 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      transformOrigin: horizontal ? "left center" : "top center",
                    }}
                    className={cn(
                      filled ? "bg-foreground" : "bg-border",
                      horizontal ? "h-px flex-1" : "my-2 min-h-3 w-px flex-1"
                    )}
                  />
                ) : null}
              </div>

              <div
                className={cn(
                  "flex min-w-0",
                  horizontal
                    ? cn("flex-col gap-1", !isLast && "pr-4")
                    : cn(
                        "flex-1 items-baseline gap-3",
                        scale.contentOffset,
                        // Spacing lives on the content so the marker column
                        // stretches over it and the connector reaches the next step.
                        !isLast && scale.trail
                      )
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p
                    className={cn(
                      scale.title,
                      "font-medium tracking-tight",
                      step.state === "pending" && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                    <span className="sr-only">{`, ${STATE_LABEL[step.state]}`}</span>
                  </p>
                  {step.description ? (
                    <p
                      className={cn(
                        scale.meta,
                        "leading-relaxed text-muted-foreground"
                      )}
                    >
                      {step.description}
                    </p>
                  ) : null}
                </div>

                {step.timestamp ? (
                  <span
                    className={cn(
                      scale.meta,
                      "shrink-0 font-mono text-muted-foreground tabular-nums"
                    )}
                  >
                    {step.timestamp}
                  </span>
                ) : null}
              </div>
            </motion.li>
          )
        })}
      </ol>

      {footer ? (
        <div className={cn(chrome ? "border-t border-border px-4 py-3" : "pt-3")}>
          {footer}
        </div>
      ) : null}
    </div>
  )
}

function Marker({
  state,
  icon,
  className,
  glyphClassName,
  pipClassName,
  animate,
}: {
  state: StatusTimelineState
  icon?: React.ReactNode
  className?: string
  glyphClassName?: string
  pipClassName?: string
  animate: boolean
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center border",
        state === "complete" && "border-foreground bg-foreground text-background",
        state === "current" && "border-foreground bg-background text-foreground",
        state === "blocked" && "border-foreground bg-background text-foreground",
        state === "pending" && "border-border bg-background text-muted-foreground",
        className
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className={cn(
            "flex items-center justify-center [&_svg]:size-full [&_svg]:shrink-0",
            glyphClassName
          )}
        >
          {icon}
        </span>
      ) : (
        <StateGlyph
          state={state}
          className={glyphClassName}
          pipClassName={pipClassName}
        />
      )}

      {state === "current" && animate ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px border border-foreground"
          initial={{ opacity: 0.45, scale: 1 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      ) : null}
    </span>
  )
}

function StateGlyph({
  state,
  className,
  pipClassName,
}: {
  state: StatusTimelineState
  className?: string
  pipClassName?: string
}) {
  if (state === "complete") {
    return <Check aria-hidden="true" className={cn("shrink-0", className)} />
  }
  if (state === "blocked") {
    return <X aria-hidden="true" className={cn("shrink-0", className)} />
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "shrink-0",
        state === "current" ? "bg-foreground" : "bg-border",
        pipClassName
      )}
    />
  )
}

/** Rolls the resolved steps up into the single state the header chip reports. */
function summarise(steps: Array<{ state: StatusTimelineState }>): {
  state: StatusTimelineState
  label: string
} {
  if (steps.some((step) => step.state === "blocked")) {
    return { state: "blocked", label: STATE_LABEL.blocked }
  }
  if (steps.length > 0 && steps.every((step) => step.state === "complete")) {
    return { state: "complete", label: STATE_LABEL.complete }
  }
  if (steps.some((step) => step.state === "current")) {
    return { state: "current", label: STATE_LABEL.current }
  }
  return { state: "pending", label: STATE_LABEL.pending }
}
