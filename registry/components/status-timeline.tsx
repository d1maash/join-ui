"use client"

import * as React from "react"
import { Check, Clock, X } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export type StatusTimelineState =
  "complete" | "current" | "waiting" | "pending" | "blocked"

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
 * Spelled out next to every step. Hue alone never carries the state — this is
 * the label a screen reader announces, and the one that keeps the component
 * legible for anyone who cannot separate green from red.
 */
const STATE_LABEL: Record<StatusTimelineState, string> = {
  complete: "Completed",
  current: "In progress",
  waiting: "Waiting",
  pending: "Not started",
  blocked: "Blocked",
}

/**
 * One hue per state, taken from the component palette rather than a literal
 * colour, so a consumer can retint the whole family in `globals.css`.
 */
const TONES: Record<
  StatusTimelineState,
  { marker: string; title: string; trail: string; chip: string; chipIcon: string }
> = {
  complete: {
    marker: "border-positive/25 bg-positive-soft text-positive",
    title: "text-foreground",
    trail: "bg-positive/35",
    chip: "bg-positive-soft text-positive",
    chipIcon: "bg-positive text-positive-foreground",
  },
  current: {
    marker: "border-info bg-info text-info-foreground",
    title: "text-foreground",
    trail: "bg-border",
    chip: "bg-info-soft text-info",
    chipIcon: "bg-info text-info-foreground",
  },
  waiting: {
    marker: "border-caution/25 bg-caution-soft text-caution",
    title: "text-foreground",
    trail: "bg-border",
    chip: "bg-caution-soft text-caution",
    chipIcon: "bg-caution text-caution-foreground",
  },
  pending: {
    marker: "border-dashed border-border bg-background text-muted-foreground",
    title: "text-muted-foreground",
    trail: "bg-border",
    chip: "bg-muted text-muted-foreground",
    chipIcon: "bg-muted-foreground/25 text-muted-foreground",
  },
  blocked: {
    marker: "border-critical/25 bg-critical-soft text-critical",
    title: "text-critical",
    trail: "bg-border",
    chip: "bg-critical-soft text-critical",
    chipIcon: "bg-critical text-critical-foreground",
  },
}

/*
 * The chip label. Set in whatever face the host app uses for its interface,
 * because an installed component has no business asserting a second family —
 * and because a status word ("In review", "Blocked") is read, not decoded.
 */
const MICRO_LABEL = "text-[0.6875rem] leading-none font-medium tracking-[-0.005em]"

const SIZES = {
  sm: {
    marker: "size-7",
    glyph: "size-3",
    pip: "size-1.5",
    title: "text-[0.8125rem]",
    meta: "text-[0.6875rem]",
    trail: "pb-4",
    columnGap: "gap-3",
    contentOffset: "pt-1.5",
    padding: "p-3.5",
  },
  md: {
    marker: "size-9",
    glyph: "size-4",
    pip: "size-2",
    title: "text-sm",
    meta: "text-xs",
    trail: "pb-6",
    columnGap: "gap-3.5",
    contentOffset: "pt-2",
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
  /** `plain` drops the card, so the list can sit in a surface you own. */
  variant?: "card" | "plain"
  showHeader?: boolean
  /** Rendered below a rule — an action, a note, a summary row. */
  footer?: React.ReactNode
}

/**
 * A step tracker for anything that moves through a fixed sequence: an order
 * being fulfilled, a deployment, an onboarding checklist.
 *
 * Each state gets its own hue — green behind a finished step, blue on the one
 * in flight, amber on one that is waiting, red on one that failed — and each
 * hue is backed by a glyph and a text label, so nothing depends on being able
 * to tell the colours apart.
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
  const summaryTone = TONES[summary.state]

  return (
    <div
      className={cn(
        "w-full text-foreground",
        chrome && "rounded-soft-lg border border-border bg-card",
        className
      )}
      {...props}
    >
      {showHeader ? (
        <div
          className={cn(
            "flex items-center gap-3",
            chrome ? "border-b border-border px-4 py-3" : "pb-3.5"
          )}
        >
          <span
            id={labelId}
            className={cn(
              MICRO_LABEL,
              "rounded-full border border-border px-2.5 py-1.5 text-muted-foreground"
            )}
          >
            {label}
          </span>

          <span
            aria-hidden="true"
            className="min-w-4 flex-1 border-t border-dashed border-border"
          />

          <span
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1",
              summaryTone.chip
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full",
                summaryTone.chipIcon
              )}
            >
              <StateGlyph
                state={summary.state}
                className="size-3"
                pipClassName="size-1.5"
              />
            </span>
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
          const tone = TONES[step.state]

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
                horizontal
                  ? cn("flex-col gap-2.5", !isLast && "flex-1")
                  : scale.columnGap
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
                  className={cn(scale.marker, tone.marker)}
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
                      "rounded-full",
                      tone.trail,
                      horizontal ? "h-0.5 flex-1" : "my-2 min-h-3 w-0.5 flex-1"
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
                        // stretches over it and the trail reaches the next step.
                        !isLast && scale.trail
                      )
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p
                    className={cn(
                      scale.title,
                      "font-medium tracking-tight",
                      tone.title
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
                      "shrink-0 text-muted-foreground tabular-nums"
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
        <div className={cn(chrome ? "border-t border-border px-4 py-3" : "pt-3.5")}>
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
        "relative flex shrink-0 items-center justify-center rounded-full border",
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
          className="pointer-events-none absolute -inset-0.5 rounded-full border-2 border-info"
          initial={{ opacity: 0.4, scale: 1 }}
          animate={{ opacity: 0, scale: 1.5 }}
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
  if (state === "waiting") {
    return <Clock aria-hidden="true" className={cn("shrink-0", className)} />
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "shrink-0 rounded-full",
        state === "current" ? "bg-current" : "bg-border",
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
  if (steps.some((step) => step.state === "waiting")) {
    return { state: "waiting", label: STATE_LABEL.waiting }
  }
  if (steps.length > 0 && steps.every((step) => step.state === "complete")) {
    return { state: "complete", label: STATE_LABEL.complete }
  }
  if (steps.some((step) => step.state === "current")) {
    return { state: "current", label: STATE_LABEL.current }
  }
  return { state: "pending", label: STATE_LABEL.pending }
}
