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
  /** Trailing meta, set with tabular figures — e.g. `17 Nov, 13:45`. */
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
 * `disc` is the marker's fill. The step in flight is the one solid shape in
 * the sequence, haloed in its own tint; everything else sits on a tint of its
 * own hue — the same rule the header chip follows.
 */
const TONES: Record<
  StatusTimelineState,
  { disc: string; ink: string; title: string; chip: string }
> = {
  complete: {
    disc: "bg-positive-soft",
    ink: "text-positive",
    title: "text-foreground",
    chip: "bg-positive-soft text-positive",
  },
  current: {
    disc: "bg-info ring-4 ring-info-soft",
    ink: "text-info-foreground",
    title: "text-foreground",
    chip: "bg-info-soft text-info",
  },
  waiting: {
    disc: "bg-caution-soft",
    ink: "text-caution",
    title: "text-foreground",
    chip: "bg-caution-soft text-caution",
  },
  pending: {
    disc: "bg-muted",
    ink: "text-muted-foreground",
    title: "text-muted-foreground",
    chip: "bg-muted text-muted-foreground",
  },
  blocked: {
    disc: "bg-critical-soft",
    ink: "text-critical",
    title: "text-critical",
    chip: "bg-critical-soft text-critical",
  },
}

/** The colour the connector takes once the step above it has been cleared. */
const TRAIL_FILL = "bg-positive/60"

/*
 * The hairline. A rule is a whisper of the border colour, not the border
 * itself, so the card reads as one surface rather than as a stack of boxes.
 */
const HAIRLINE = "bg-border/70"

/*
 * The motion vocabulary.
 *
 * Which of these a move gets is decided by one question: can anything
 * countermand it half way through? A connector drawing down its lane cannot —
 * it is a finished statement, it takes the time it takes — so it is a tween on
 * the system's own deceleration curve. A disc blooming or a glyph landing can
 * be overtaken by the next state a fraction of a second later, and a spring
 * carries the velocity it already had into the new target, which is the
 * difference between a marker that stutters through a fast sequence and one
 * that flows through it.
 *
 * `DISC` is held to a small bounce, because a disc that overshoots reads as a
 * wobble. `GLYPH` is deliberately looser: a tick arriving in a cleared step is
 * allowed to land with a little weight behind it.
 */
const EASE = [0.32, 0.72, 0, 1] as const
const DISC = { type: "spring", visualDuration: 0.4, bounce: 0.18 } as const
const GLYPH = { type: "spring", visualDuration: 0.3, bounce: 0.3 } as const

/*
 * The beats of an advance, in seconds.
 *
 * Everything used to move at once, which read as a single flash rather than as
 * a sequence: the eye was given three simultaneous events and could follow
 * none of them. Spacing them by a tenth of a second each is enough to make the
 * order legible — the cleared step turns, the line runs down to the next one,
 * and only then does that one announce itself — without the whole thing
 * feeling slow. Two frames of overlap keep it a single gesture rather than
 * three separate ones.
 */
const TRAIL_DELAY = 0.1
const ARRIVAL_DELAY = 0.3

/**
 * The pulse that leaves a step as it takes over: two rings rather than one,
 * the second a beat behind and travelling further. One ring is a blip; two
 * that are visibly the same event at two removes read as something spreading
 * out from the marker.
 */
const RIPPLES = [
  { id: "near", scale: 1.6, opacity: 0.45, duration: 0.85, delay: 0 },
  { id: "far", scale: 2.1, opacity: 0.22, duration: 1, delay: 0.13 },
] as const

/*
 * The two scales. `offset` sets the title's first line on the marker's centre
 * line: (marker - title line) / 2.
 */
const SIZES = {
  sm: {
    marker: "size-7",
    glyph: "size-3.5",
    pip: "size-1.5",
    title: "text-[0.9375rem] leading-5 tracking-[-0.016em]",
    description: "text-[0.8125rem] leading-[1.125rem]",
    meta: "text-xs leading-5",
    trail: "pb-4",
    columnGap: "gap-3",
    contentOffset: "pt-1",
    lane: "my-1",
    header: "px-3.5 pt-3.5 pb-1",
    heading: "text-[0.9375rem] leading-5 tracking-[-0.016em]",
    chip: "h-6 gap-1 px-2 text-xs",
    chipGlyph: "size-3",
    body: "px-3.5 pb-3.5",
    bodyTop: { header: "pt-3", bare: "pt-3.5" },
    footer: "px-3.5 py-3",
  },
  md: {
    marker: "size-9",
    glyph: "size-4",
    pip: "size-2",
    title: "text-[1.0625rem] leading-[1.375rem] tracking-[-0.022em]",
    description: "text-[0.9375rem] leading-5 tracking-[-0.009em]",
    meta: "text-[0.8125rem] leading-[1.375rem]",
    trail: "pb-6",
    columnGap: "gap-3.5",
    contentOffset: "pt-[0.4375rem]",
    lane: "my-1.5",
    header: "px-4 pt-4 pb-1",
    heading: "text-[1.0625rem] leading-[1.375rem] tracking-[-0.022em]",
    chip: "h-7 gap-1.5 px-2.5 text-[0.8125rem]",
    chipGlyph: "size-3.5",
    body: "px-4 pb-4",
    bodyTop: { header: "pt-3.5", bare: "pt-4" },
    footer: "px-4 py-3",
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
  /** Header title, and the accessible name of the list. */
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
 * At rest it is a still drawing — tinted discs for what has happened or is
 * yet to, one solid disc for the step in flight, a rounded rail running
 * between them. Nothing loops and nothing breathes. The motion is spent
 * entirely on the one moment worth showing, and it is spent as a sequence
 * rather than as a flash: when `activeStep` moves on, the cleared step's disc
 * turns first, a tenth of a second later the connector below it runs down to
 * the next one, and only when it arrives does that step announce itself with a
 * pair of rings spreading out of it. Three beats, a tenth of a second apart,
 * which is the difference between an order you can follow and three things
 * happening at once.
 *
 * Each state gets its own hue — green behind a finished step, blue on the one
 * in flight, orange on one that is waiting, red on one that failed — and each
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
        "flex w-full flex-col font-sans text-foreground",
        chrome && "rounded-soft-lg border border-border/60 bg-card",
        className
      )}
      {...props}
    >
      {showHeader ? (
        <div className={cn("flex items-center gap-3", chrome ? scale.header : "pb-3")}>
          <span
            id={labelId}
            className={cn("min-w-0 flex-1 truncate font-semibold", scale.heading)}
          >
            {label}
          </span>

          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full leading-none font-medium tracking-[-0.006em]",
              "transition-colors duration-[var(--duration-base,200ms)] ease-[var(--ease-out-soft,ease-out)]",
              scale.chip,
              summaryTone.chip
            )}
          >
            <Swap
              token={glyphKey(summary.state)}
              animate={animate}
              className="flex items-center justify-center"
            >
              <StateGlyph
                state={summary.state}
                className={scale.chipGlyph}
                pipClassName="size-1.5 bg-current"
              />
            </Swap>

            {/*
              Stacked in a single grid cell so the outgoing and incoming words
              overlap instead of shunting the capsule sideways mid-cross-fade.
            */}
            <span className="grid">
              <Swap
                token={summaryLabel}
                animate={animate}
                className="col-start-1 row-start-1 whitespace-nowrap"
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
          chrome && scale.body,
          chrome && (showHeader ? scale.bodyTop.header : scale.bodyTop.bare)
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
                  horizontal ? "w-full items-center" : "flex-col items-center"
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
                    ? cn("flex-col gap-0.5", !isLast && "pr-4")
                    : cn(
                        "flex-1 items-baseline gap-3",
                        scale.contentOffset,
                        // Spacing lives on the content so the marker column
                        // stretches over it and the trail reaches the next step.
                        !isLast && scale.trail
                      )
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p
                    className={cn(
                      scale.title,
                      "font-semibold",
                      "transition-colors duration-[var(--duration-base,200ms)] ease-[var(--ease-out-soft,ease-out)]",
                      tone.title
                    )}
                  >
                    {step.title}
                    <span className="sr-only">{`, ${STATE_LABEL[step.state]}`}</span>
                  </p>
                  {step.description ? (
                    <p className={cn(scale.description, "text-muted-foreground")}>
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
        <div className={cn(chrome ? cn("relative", scale.footer) : "pt-3")}>
          {chrome ? (
            <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-px", HAIRLINE)} />
          ) : null}
          {footer}
        </div>
      ) : null}
    </div>
  )
}

/**
 * The disc. Its fill is a separate absolutely-positioned layer keyed on the
 * state, so advancing cross-fades one whole disc into the next — the old fill
 * swells away as the new one blooms up from the centre — rather than snapping
 * a colour. `initial={false}` keeps all of that off the first paint: a
 * timeline that is merely rendered does not animate.
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
        "transition-colors duration-[var(--duration-base,200ms)] ease-[var(--ease-out-soft,ease-out)]",
        sizeClassName,
        tone.ink
      )}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={state}
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-0 rounded-full", tone.disc)}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.12 }}
          /*
           * Split, because the two properties are doing different jobs. The
           * scale is the move and wants the spring's carry; the opacity is
           * only the handover between the outgoing disc and the incoming one,
           * and a spring settling asymptotically towards zero would hold a
           * disc that has finished swelling on screen at 2% for as long again.
           */
          transition={
            animate
              ? { scale: DISC, opacity: { duration: 0.22, ease: EASE } }
              : { duration: 0 }
          }
        />
      </AnimatePresence>

      {/*
        One pulse, once, on arrival — not a loop. It plays only when a step
        becomes current after the first render, which is exactly the moment the
        eye needs pointing at, and it waits out `ARRIVAL_DELAY` so it lands
        after the connector above has finished running down to it.
      */}
      <AnimatePresence initial={false}>
        {state === "current"
          ? RIPPLES.map((ripple) => (
              <motion.span
                key={ripple.id}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-info"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: [0, ripple.opacity, 0], scale: ripple.scale }}
                exit={{ opacity: 0, transition: { duration: 0 } }}
                transition={
                  animate
                    ? {
                        duration: ripple.duration,
                        delay: ARRIVAL_DELAY + ripple.delay,
                        ease: EASE,
                        /* Up to full within the first eighth, out over the rest. */
                        times: [0, 0.12, 1],
                      }
                    : { duration: 0 }
                }
              />
            ))
          : null}
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
            pipClassName={cn(state === "current" ? "bg-current" : "bg-current opacity-50", pipClassName)}
          />
        </Swap>
      )}
    </span>
  )
}

/**
 * The rail between two discs: a rounded track with a tinted overlay that
 * draws from the disc above down to the one below the instant its step is
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
        "relative overflow-hidden rounded-full bg-border/70",
        horizontal
          ? "mx-1.5 h-0.5 min-w-3 flex-1"
          : cn("min-h-3 w-0.5 flex-1", laneClassName)
      )}
    >
      <motion.span
        className={cn("absolute inset-0 rounded-full", TRAIL_FILL)}
        style={{ transformOrigin: horizontal ? "left center" : "center top" }}
        initial={false}
        animate={
          horizontal
            ? { scaleX: filled ? 1 : 0 }
            : { scaleY: filled ? 1 : 0 }
        }
        /*
         * Delayed on the way out only. Filling waits a beat so the disc above
         * has visibly turned before the line leaves it; emptying — which only
         * happens when a timeline is wound backwards — has nothing to wait
         * for, and a lag there just reads as the component being slow.
         */
        transition={
          animate
            ? { duration: 0.5, ease: EASE, delay: filled ? TRAIL_DELAY : 0 }
            : { duration: 0 }
        }
      />
    </span>
  )
}

/**
 * Swaps whatever it wraps whenever `token` changes, and stays perfectly still
 * otherwise — including on mount, which is what keeps a freshly rendered
 * timeline from performing.
 *
 * The way a symbol replaces another: the outgoing glyph shrinks and softens
 * out of focus, the incoming one arrives from below on a loose spring, so a
 * tick landing in a cleared step has a fraction of overshoot on it — the whole
 * difference between a mark being placed and two images being dissolved into
 * each other.
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
        initial={{ opacity: 0, scale: 0.6, y: 3, filter: "blur(2px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        /*
         * The way out is a tween and not the spring, because `mode="wait"`
         * holds the incoming glyph until this one has finished: a spring
         * settling on its own terms would put a quarter of a second of empty
         * disc between the two.
         */
        exit={{
          opacity: 0,
          scale: 0.6,
          y: -3,
          filter: "blur(2px)",
          transition: animate ? { duration: 0.12, ease: EASE } : { duration: 0 },
        }}
        transition={
          animate
            ? {
                scale: GLYPH,
                y: GLYPH,
                opacity: { duration: 0.16, ease: EASE },
                filter: { duration: 0.2, ease: EASE },
              }
            : { duration: 0 }
        }
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
    return <Check aria-hidden="true" strokeWidth={3} className={cn("shrink-0", className)} />
  }
  if (state === "blocked") {
    return <X aria-hidden="true" strokeWidth={3} className={cn("shrink-0", className)} />
  }
  if (state === "waiting") {
    return <Clock aria-hidden="true" strokeWidth={2.5} className={cn("shrink-0", className)} />
  }
  return <span aria-hidden="true" className={cn("shrink-0 rounded-full", pipClassName)} />
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
