"use client"

import * as React from "react"
import { Check, Clock, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

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
 *
 * `ring` is the marker's outline and tint together, because the two cross-fade
 * as one shape when a step advances — a dashed grey circle turning into a
 * tinted one is a single move, not two.
 */
const TONES: Record<
  StatusTimelineState,
  { ring: string; ink: string; title: string; chip: string; chipIcon: string }
> = {
  complete: {
    ring: "border-positive/35 bg-positive-soft",
    ink: "text-positive",
    title: "text-foreground",
    chip: "bg-positive-soft text-positive",
    chipIcon: "bg-positive text-positive-foreground",
  },
  current: {
    ring: "border-info/50 bg-info-soft ring-[3px] ring-info/12",
    ink: "text-info",
    title: "text-foreground",
    chip: "bg-info-soft text-info",
    chipIcon: "bg-info text-info-foreground",
  },
  waiting: {
    ring: "border-dashed border-caution/45 bg-caution-soft",
    ink: "text-caution",
    title: "text-foreground",
    chip: "bg-caution-soft text-caution",
    chipIcon: "bg-caution text-caution-foreground",
  },
  pending: {
    ring: "border-dashed border-border bg-muted/40",
    ink: "text-muted-foreground",
    title: "text-muted-foreground",
    chip: "bg-muted text-muted-foreground",
    chipIcon: "bg-muted-foreground/25 text-muted-foreground",
  },
  blocked: {
    ring: "border-critical/40 bg-critical-soft",
    ink: "text-critical",
    title: "text-critical",
    chip: "bg-critical-soft text-critical",
    chipIcon: "bg-critical text-critical-foreground",
  },
}

/** The colour the connector takes once the step above it has been cleared. */
const TRAIL_FILL = "bg-positive/70"

/*
 * The chip label. Set in whatever face the host app uses for its interface,
 * because an installed component has no business asserting a second family —
 * and because a status word ("In review", "Blocked") is read, not decoded.
 */
const MICRO_LABEL = "text-[0.6875rem] leading-none font-medium tracking-[-0.005em]"

const EASE = [0.22, 1, 0.36, 1] as const

const SIZES = {
  sm: {
    marker: "size-8",
    glyph: "size-3.5",
    pip: "size-1.5",
    title: "text-[0.8125rem]",
    meta: "text-xs",
    trail: "pb-5",
    columnGap: "gap-3",
    contentOffset: "pt-1.5",
    padding: "p-4",
    lane: "my-2",
  },
  md: {
    marker: "size-10",
    glyph: "size-[1.125rem]",
    pip: "size-2",
    title: "text-[0.9375rem]",
    meta: "text-[0.8125rem]",
    trail: "pb-7",
    columnGap: "gap-4",
    contentOffset: "pt-2.5",
    padding: "p-5",
    lane: "my-2.5",
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
 * At rest it is a still drawing — dashed rings for what has not happened yet,
 * tinted ones for what has, a hairline running between them. Nothing loops and
 * nothing breathes. The motion is spent entirely on the one moment worth
 * showing: when `activeStep` moves on, the connector above the cleared step
 * draws downward, the marker it reaches cross-fades into its new ring, and a
 * single pulse leaves the step now in flight.
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
  const animate = !reduceMotion

  const resolved = steps.map((step, index) => ({
    ...step,
    state:
      step.state ??
      (index < activeStep ? "complete" : index === activeStep ? "current" : "pending"),
  }))

  const summary = summarise(resolved)
  const summaryTone = TONES[summary.state]
  const summaryLabel = status ?? summary.label

  return (
    <div
      className={cn(
        // A column, so a card given a height taller than its steps keeps the
        // footer on the bottom rule rather than floating it under the list.
        "flex w-full flex-col text-foreground",
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
              "rounded-full border border-dashed border-border px-2.5 py-1.5 text-muted-foreground"
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
              "transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
              summaryTone.chip
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full",
                "transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
                summaryTone.chipIcon
              )}
            >
              <Swap
                token={glyphKey(summary.state)}
                animate={animate}
                className="flex items-center justify-center"
              >
                <StateGlyph
                  state={summary.state}
                  className="size-3"
                  pipClassName="size-1.5"
                />
              </Swap>
            </span>

            {/*
              Stacked in a single grid cell so the outgoing and incoming words
              overlap instead of shunting the pill sideways mid-cross-fade.
            */}
            <span className="grid">
              <Swap
                token={summaryLabel}
                animate={animate}
                className={cn(
                  MICRO_LABEL,
                  "col-start-1 row-start-1 whitespace-nowrap"
                )}
              >
                {summaryLabel}
              </Swap>
            </span>
          </span>
        </div>
      ) : null}

      <ol
        aria-labelledby={showHeader ? labelId : undefined}
        aria-label={showHeader ? undefined : label}
        className={cn(
          "flex flex-1",
          horizontal ? "flex-row" : "flex-col",
          chrome && scale.padding
        )}
      >
        {resolved.map((step, index) => {
          const isLast = index === resolved.length - 1
          const tone = TONES[step.state]

          return (
            <li
              key={step.id}
              aria-current={step.state === "current" ? "step" : undefined}
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
                  tone={tone}
                  sizeClassName={scale.marker}
                  glyphClassName={scale.glyph}
                  pipClassName={scale.pip}
                  animate={animate}
                />

                {!isLast ? (
                  <Trail
                    /* The connector belongs to the step above it, and fills
                       the moment that step is cleared. */
                    filled={step.state === "complete"}
                    horizontal={horizontal}
                    laneClassName={scale.lane}
                    animate={animate}
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
                      "font-semibold tracking-tight",
                      "transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
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
            </li>
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

/**
 * The circle. Its ring is a separate absolutely-positioned layer keyed on the
 * state, so advancing cross-fades one whole marker into the next — the old ring
 * expands away as the new one blooms up from the centre — rather than snapping
 * a dashed border to a solid one. `initial={false}` keeps all of that off the
 * first paint: a timeline that is merely rendered does not animate.
 */
function Marker({
  state,
  icon,
  tone,
  sizeClassName,
  glyphClassName,
  pipClassName,
  animate,
}: {
  state: StatusTimelineState
  icon?: React.ReactNode
  tone: (typeof TONES)[StatusTimelineState]
  sizeClassName?: string
  glyphClassName?: string
  pipClassName?: string
  animate: boolean
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full",
        "transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
        sizeClassName,
        tone.ink
      )}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={state}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full border",
            tone.ring
          )}
          initial={{ opacity: 0, scale: 0.62 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.18 }}
          transition={animate ? { duration: 0.34, ease: EASE } : { duration: 0 }}
        />
      </AnimatePresence>

      {/*
        One pulse, once, on arrival — not a loop. It plays only when a step
        becomes current after the first render, which is exactly the moment the
        eye needs pointing at.
      */}
      <AnimatePresence initial={false}>
        {state === "current" ? (
          <motion.span
            key="arrival"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-info"
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 1.7 }}
            exit={{ opacity: 0, scale: 1.7 }}
            transition={animate ? { duration: 0.7, ease: "easeOut" } : { duration: 0 }}
          />
        ) : null}
      </AnimatePresence>

      {icon ? (
        <span
          aria-hidden="true"
          className={cn(
            "relative flex items-center justify-center [&_svg]:size-full [&_svg]:shrink-0",
            glyphClassName
          )}
        >
          {icon}
        </span>
      ) : (
        <Swap
          token={glyphKey(state)}
          animate={animate}
          className={cn("relative flex items-center justify-center", glyphClassName)}
        >
          <StateGlyph
            state={state}
            className={glyphClassName}
            pipClassName={pipClassName}
          />
        </Swap>
      )}
    </span>
  )
}

/**
 * The hairline between two markers: a static rule with a tinted overlay that
 * draws from the marker above down to the one below the instant its step is
 * cleared. This is the move that reads as progress.
 */
function Trail({
  filled,
  horizontal,
  laneClassName,
  animate,
}: {
  filled: boolean
  horizontal: boolean
  laneClassName?: string
  animate: boolean
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative bg-border",
        horizontal ? "mx-1 h-px min-w-3 flex-1" : cn("w-px min-h-3 flex-1", laneClassName)
      )}
    >
      <motion.span
        className={cn("absolute inset-0", TRAIL_FILL)}
        style={{ transformOrigin: horizontal ? "left center" : "center top" }}
        initial={false}
        animate={
          horizontal
            ? { scaleX: filled ? 1 : 0 }
            : { scaleY: filled ? 1 : 0 }
        }
        transition={animate ? { duration: 0.42, ease: EASE } : { duration: 0 }}
      />
    </span>
  )
}

/**
 * Cross-fades whatever it wraps whenever `token` changes, and stays perfectly
 * still otherwise — including on mount, which is what keeps a freshly rendered
 * timeline from performing.
 */
function Swap({
  token,
  animate,
  className,
  children,
}: {
  token: string
  animate: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.span
        key={token}
        className={className}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={animate ? { duration: 0.16, ease: EASE } : { duration: 0 }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
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

/**
 * Which drawing a state uses. Two states that share a glyph share a key, so
 * moving between them recolours in place instead of swapping like for like.
 */
function glyphKey(state: StatusTimelineState): string {
  if (state === "complete") return "check"
  if (state === "blocked") return "cross"
  if (state === "waiting") return "clock"
  return "pip"
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
