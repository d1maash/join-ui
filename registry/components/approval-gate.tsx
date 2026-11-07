"use client"

import * as React from "react"
import { Check, Hourglass, TriangleAlert, X } from "lucide-react"
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "motion/react"

import { cn } from "@/lib/utils"

/** What the reader decided — or, for `expire`, the decision nobody made. */
export type ApprovalGateDecision = "allow" | "deny" | "expire"

/** How much the request can break. Picks the hue, and the word set beside the title. */
export type ApprovalGateRisk = "low" | "medium" | "high"

/** Where the shortcut keys are listened for. */
export type ApprovalGateHotkeys = "focus" | "global" | "off"

export interface ApprovalGateShortcuts {
  /** Keys that allow. A single character matches in either case. */
  allow?: string[]
  /** Keys that deny. */
  deny?: string[]
}

export interface ApprovalGateProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children" | "title" | "autoFocus"
> {
  /** What the agent wants to do, in a few words. */
  title: string
  /** Why it wants to. One line under the title. */
  reason?: React.ReactNode
  /** The tool the agent would call. Set in mono under the command. */
  tool?: string
  /** The command itself. An array is one entry per line. */
  command?: string | string[]
  /** Set beside the tool — a working directory, a branch, a host. */
  meta?: string
  /** A prompt glyph set before each line, and kept out of the selection. */
  prefix?: string
  risk?: ApprovalGateRisk
  /** Overrides the word set beside the title while the gate is waiting. */
  riskLabel?: string
  /** Replaces the marker's pip while the gate waits without a clock. */
  icon?: React.ReactNode
  /** Milliseconds the reader has before the gate expires on its own. */
  timeout?: number
  /** Holds the clock while the pointer is over the gate or focus is inside it. */
  pauseWhileReading?: boolean
  /** Controlled outcome. `null` is a gate still waiting. */
  decision?: ApprovalGateDecision | null
  /** Where an uncontrolled gate starts. */
  defaultDecision?: ApprovalGateDecision | null
  /** Fires once, with what was decided — by hand, by key, or by the clock. */
  onDecision?: (decision: ApprovalGateDecision) => void
  allowLabel?: string
  denyLabel?: string
  shortcuts?: ApprovalGateShortcuts
  hotkeys?: ApprovalGateHotkeys
  /** Focuses the gate on mount, so the keys work at once. */
  autoFocus?: boolean
  /** The accessible name's first word, and the first thing announced. */
  label?: string
  /** Announces the request and its outcome through a polite live region. */
  announce?: boolean
  /** Rendered below a rule — a note, a link to the run. */
  footer?: React.ReactNode
  /** `plain` drops the card, so the gate can sit in a surface you own. */
  variant?: "card" | "plain"
  size?: "sm" | "md"
}

type Phase = "pending" | ApprovalGateDecision

/**
 * Set beside the title and said in the live region. Hue alone never carries
 * the outcome — this is the word a screen reader announces, and the one that
 * keeps the gate legible for anyone who cannot separate green from red.
 */
const DECISION_LABEL: Record<ApprovalGateDecision, string> = {
  allow: "Allowed",
  deny: "Denied",
  expire: "Expired",
}

/**
 * The word while the gate waits. For a request that can break something, the
 * most useful word on the card is how badly; for one that cannot, it is
 * simply that someone is waiting.
 */
const WAITING_LABEL: Record<ApprovalGateRisk, string> = {
  low: "Awaiting",
  medium: "Caution",
  high: "Destructive",
}

/**
 * Hue is spent only where there is risk. A request that cannot break anything
 * waits in the page's own ink — a monochrome clock, a grey capsule — and the
 * two warmer families are reserved for one that might, or will. Everything
 * reads the component palette rather than a literal colour, so a consumer can
 * retint the whole family in `globals.css`.
 *
 * `stroke` is the clock's arc and `track` the circle it drains from; `disc`
 * fills the marker while the gate waits without a clock. A destructive request
 * sets its answer in the destructive style — red, and tinted rather than
 * filled, because the system never gives the action that cannot be taken back
 * the most prominent button on the screen.
 */
const RISK_TONES: Record<
  ApprovalGateRisk,
  { ink: string; stroke: string; track: string; disc: string; chip: string; allow: string }
> = {
  low: {
    ink: "text-foreground",
    stroke: "stroke-foreground",
    track: "stroke-foreground/12",
    disc: "bg-muted",
    chip: "bg-muted text-muted-foreground",
    allow: "bg-primary text-primary-foreground hover:bg-primary/85",
  },
  medium: {
    ink: "text-caution",
    stroke: "stroke-caution",
    track: "stroke-caution/18",
    disc: "bg-caution-soft",
    chip: "bg-caution-soft text-caution",
    allow: "bg-primary text-primary-foreground hover:bg-primary/85",
  },
  high: {
    ink: "text-critical",
    stroke: "stroke-critical",
    track: "stroke-critical/16",
    disc: "bg-critical-soft",
    chip: "bg-critical-soft text-critical",
    allow: "bg-critical-soft text-critical hover:bg-critical/20",
  },
}

/** And one per outcome: the marker's fill, its ink, and the capsule's. */
const DECISION_TONES: Record<
  ApprovalGateDecision,
  { disc: string; ink: string; chip: string }
> = {
  allow: {
    disc: "bg-positive-soft",
    ink: "text-positive",
    chip: "bg-positive-soft text-positive",
  },
  deny: {
    disc: "bg-critical-soft",
    ink: "text-critical",
    chip: "bg-critical-soft text-critical",
  },
  expire: {
    disc: "bg-muted",
    ink: "text-muted-foreground",
    chip: "bg-muted text-muted-foreground",
  },
}

/** The clock's marker has no fill of its own: the track is the shape. */
const CLOCK_DISC = "bg-transparent"

/**
 * The command's surface: a wash of the theme's own ink over whatever is
 * behind it, which is the one formulation that survives both themes.
 */
const SURFACE =
  "var(--approval-gate-command, color-mix(in oklab, var(--foreground) 4%, transparent))"

const DEFAULT_ALLOW = ["y"]
const DEFAULT_DENY = ["n", "Escape"]

/*
 * The vocabulary, shared with the rest of the family. A move that nothing can
 * countermand half way through — a strike drawing, a row folding — is a tween
 * on the system's own deceleration curve. A disc blooming or a glyph landing
 * can be overtaken by the next state a fraction of a second later, so those
 * ride springs, which carry the velocity they already had into the new target.
 */
const EASE = [0.32, 0.72, 0, 1] as const
const DISC = { type: "spring", visualDuration: 0.4, bounce: 0.18 } as const
const GLYPH = { type: "spring", visualDuration: 0.3, bounce: 0.3 } as const
const PRESS = { type: "spring", visualDuration: 0.18, bounce: 0.25 } as const

/**
 * The most the clock is allowed to lose in one frame. The countdown rides the
 * frame loop, which stops in a background tab and restarts with one very long
 * frame when the tab comes back; capping the step turns that into a pause
 * rather than an expiry the reader never saw coming.
 */
const MAX_STEP = 120

/*
 * The two scales. `dial` is the marker's size in pixels and `weight` the
 * clock's stroke, so the ring can be drawn to the pixel rather than scaled.
 * `offset` is (marker - title line) / 2, which sets a one-line title on the
 * marker's centre, and the capsule beside it is exactly one line tall.
 */
const SIZES = {
  sm: {
    marker: "size-8",
    dial: 32,
    weight: 2.5,
    glyph: "size-3.5",
    pip: "size-2",
    count: "text-[0.6875rem]",
    row: "min-h-8",
    offset: "pt-1.5",
    title: "text-[0.9375rem] leading-5 tracking-[-0.016em]",
    chip: "h-5 gap-1 px-2 text-[0.6875rem]",
    chipGlyph: "size-3",
    reason: "text-[0.8125rem] leading-[1.125rem]",
    command: "px-3 py-2 text-xs",
    caption: "text-[0.6875rem]",
    button: "h-8 gap-1.5 px-3.5 text-[0.8125rem]",
    hint: "text-[0.6875rem]",
    gap: "gap-3",
    stack: "gap-2.5",
    padding: "p-3.5",
    footer: "mt-3.5 pt-3",
  },
  md: {
    marker: "size-9",
    dial: 36,
    weight: 3,
    glyph: "size-4",
    pip: "size-2",
    count: "text-xs",
    row: "min-h-9",
    offset: "pt-[0.4375rem]",
    title: "text-[1.0625rem] leading-[1.375rem] tracking-[-0.022em]",
    chip: "h-[1.375rem] gap-1 px-2.5 text-xs",
    chipGlyph: "size-3",
    reason: "text-[0.9375rem] leading-5 tracking-[-0.009em]",
    command: "px-3.5 py-2.5 text-[0.8125rem]",
    caption: "text-xs",
    button: "h-9 gap-2 px-4 text-[0.9375rem]",
    hint: "text-[0.8125rem]",
    gap: "gap-3.5",
    stack: "gap-3",
    padding: "p-4",
    footer: "mt-4 pt-3.5",
  },
} as const

type Scale = (typeof SIZES)[keyof typeof SIZES]

/**
 * The moment an agent stops and asks. Where `ToolTrace` is what a run looks
 * like from the inside, this is the one step in it that cannot happen without
 * a person: the tool it wants, the command it would give, and two ways to
 * answer.
 *
 * At rest it is a still card, and a quiet one — a title, a capsule beside it,
 * the command in a recessed well, and the two answers. The one thing that
 * moves while it waits is the clock: a ring around the marker, draining
 * clockwise from twelve with the seconds left set inside it. It holds whenever
 * the reader is plainly reading — pointer over the card, focus inside it, the
 * card scrolled out of view — because a timeout is a safety net for a gate
 * nobody is looking at, not a race against the person in front of it. A
 * decision is one move each way: allowing lets the buttons go and sets a tick
 * in the marker; denying draws a strike through the command, left to right,
 * and takes the ink out of it as it goes; letting the clock run out does
 * neither — the marker greys to an hourglass, the command dims, and the word
 * says so.
 *
 * The keys are declared on the buttons through `aria-keyshortcuts` and shown
 * beside the labels only while they would actually work, every outcome
 * carries a glyph and a spoken word as well as a hue, and the whole thing
 * resolves instantly under `prefers-reduced-motion`.
 */
export function ApprovalGate({
  title,
  reason,
  tool,
  command,
  meta,
  prefix,
  risk = "low",
  riskLabel,
  icon,
  timeout,
  pauseWhileReading = true,
  decision,
  defaultDecision = null,
  onDecision,
  allowLabel = "Allow",
  denyLabel = "Deny",
  shortcuts,
  hotkeys = "focus",
  autoFocus = false,
  label = "Approval",
  announce = true,
  footer,
  variant = "card",
  size = "md",
  className,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: ApprovalGateProps) {
  const reduceMotion = useReducedMotion()
  const animate = !reduceMotion
  const titleId = React.useId()
  const root = React.useRef<HTMLDivElement>(null)
  const scale = SIZES[size]
  const chrome = variant === "card"

  const controlled = decision !== undefined
  const [own, setOwn] = React.useState<ApprovalGateDecision | null>(defaultDecision)
  const phase: Phase = (controlled ? decision : own) ?? "pending"
  const pending = phase === "pending"

  const total = timeout !== undefined && timeout > 0 ? timeout : undefined
  const counting = pending && total !== undefined
  const wholeSeconds = total === undefined ? 0 : Math.ceil(total / 1000)

  const allowKeys = shortcuts?.allow ?? DEFAULT_ALLOW
  const denyKeys = shortcuts?.deny ?? DEFAULT_DENY

  /*
   * Whether the reader is plainly reading. The clock is a safety net for a
   * gate nobody is looking at, not a race against the person in front of it,
   * so it holds while the pointer is over the card or focus is inside it — and
   * whenever the card is off screen, which is the family's rule for anything
   * that runs on its own.
   *
   * The view starts out "not seen": a gate that mounts below the fold never
   * enters the viewport, so an observer that assumed it was visible would
   * never hear otherwise and the clock would run out unwatched. Only the
   * reader's own hold dims the ring — the off-screen one is never seen, and
   * dimming for it would flash the ring on every mount.
   */
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const inView = useInView(root, { amount: 0.4 })
  const reading = pauseWhileReading && (hovered || focused)
  const held = !inView || reading

  /*
   * The key hints are shown only while the keys would work: always for global
   * keys, and otherwise once focus is inside the gate — a click on the card
   * puts it there. A hint for a key that does nothing yet is a small lie.
   */
  const hints = hotkeys === "global" || (hotkeys === "focus" && focused)

  /** The button a shortcut key pressed, so it can be seen to go down. */
  const [pressed, setPressed] = React.useState<ApprovalGateDecision | null>(null)

  const decide = React.useCallback(
    (next: ApprovalGateDecision, byKey = false) => {
      if (byKey) setPressed(next)
      if (!controlled) setOwn(next)
      onDecision?.(next)

      /*
       * The buttons are about to leave. Focus that was on one of them would
       * otherwise fall to the document, so it is handed to the card, which is
       * focusable for exactly this reason and for the keys.
       */
      const node = root.current
      const active = document.activeElement
      if (node && active && active !== node && node.contains(active)) {
        node.focus({ preventScroll: true })
      }
    },
    [controlled, onDecision]
  )

  const { progress, count } = useCountdown(total, pending, held, !animate, () =>
    decide("expire")
  )

  React.useEffect(() => {
    if (autoFocus) root.current?.focus({ preventScroll: true })
  }, [autoFocus])

  /*
   * Global keys are listened for at the document while the gate waits, with
   * anything typed into a field left alone. The card's own handler steps back
   * in that mode, so a key pressed inside it is never answered twice.
   */
  const latest = React.useRef<(event: KeyboardEvent) => void>(() => {})
  React.useEffect(() => {
    latest.current = (event) => {
      const hit = matchKey(event, allowKeys, denyKeys)
      if (!hit) return
      event.preventDefault()
      decide(hit, true)
    }
  })
  React.useEffect(() => {
    if (hotkeys !== "global" || !pending) return
    const onKey = (event: KeyboardEvent) => latest.current(event)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [hotkeys, pending])

  const waitingWord = riskLabel ?? WAITING_LABEL[risk]
  const word = pending ? waitingWord : DECISION_LABEL[phase]

  /*
   * The one thing said out loud. A live region announces changes and not
   * arrivals, so the text is written a frame after it is decided — which is
   * what makes a gate that appears mid-conversation get announced at all.
   */
  const spoken = pending
    ? `${label}: ${title}. ${waitingWord}.${
        total === undefined ? "" : ` ${wholeSeconds} seconds to answer.`
      }`
    : phase === "expire"
      ? `${DECISION_LABEL.expire}: no answer${
          total === undefined ? "" : ` in ${wholeSeconds} seconds`
        }.`
      : `${DECISION_LABEL[phase]}.`
  const [live, setLive] = React.useState("")
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setLive(spoken))
    return () => cancelAnimationFrame(frame)
  }, [spoken])

  const lines = command === undefined ? [] : Array.isArray(command) ? command : [command]
  const riskTone = RISK_TONES[risk]
  const caption = Boolean(tool || meta)
  /* A warning sign rides in the capsule only while there is a risk to warn of. */
  const warn = pending && risk !== "low"

  /*
   * The last row holds the caption on the left and the answers on the right,
   * and stays once the answers have gone, so the card does not change height
   * under a decision. Only a gate with nothing to caption folds the row away.
   */
  const showRow = caption || pending

  return (
    <div
      ref={root}
      role="group"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (hotkeys !== "focus" || !pending) return
        const hit = matchKey(event, allowKeys, denyKeys)
        if (!hit) return
        event.preventDefault()
        decide(hit, true)
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        setHovered(true)
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        setHovered(false)
      }}
      onFocus={(event) => {
        onFocus?.(event)
        setFocused(true)
      }}
      onBlur={(event) => {
        onBlur?.(event)
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
      className={cn(
        "relative flex w-full flex-col font-sans text-foreground outline-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        /*
         * A request arrives over the conversation rather than in it, so the
         * card is a material — the page shows faintly through — lifted on a
         * shadow wide and weak enough never to read as an edge.
         */
        chrome &&
          "rounded-soft-lg border border-border/60 bg-card/85 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_10px_30px_-8px_rgb(0_0_0/0.1)] backdrop-blur-xl backdrop-saturate-150",
        chrome && scale.padding,
        className
      )}
      {...props}
    >
      <div className={cn("flex items-start", scale.gap)}>
        <Marker
          phase={phase}
          counting={counting}
          held={reading}
          progress={progress}
          count={count}
          wholeSeconds={wholeSeconds}
          icon={icon}
          ink={pending ? riskTone.ink : DECISION_TONES[phase].ink}
          disc={
            pending ? (counting ? CLOCK_DISC : riskTone.disc) : DECISION_TONES[phase].disc
          }
          stroke={riskTone.stroke}
          track={riskTone.track}
          animate={animate}
          scale={scale}
        />

        {/* `offset` sets the title's first line on the marker's centre line. */}
        <div className={cn("flex min-w-0 flex-1 flex-col", scale.stack, scale.offset)}>
          <div className="flex flex-col gap-0.5">
            {/*
              The capsule rides beside the title while there is room for both,
              and drops under it on a narrow card rather than squeezing the
              title into a column.
            */}
            <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
              <p id={titleId} className={cn("min-w-0 grow basis-40 font-semibold", scale.title)}>
                <span className="sr-only">{label}: </span>
                {title}
              </p>

              {/*
                Stacked in a single grid cell so the outgoing and incoming
                capsules overlap instead of shunting the row mid-cross-fade.
              */}
              <span className="grid shrink-0">
                <Swap
                  token={word}
                  animate={animate}
                  className={cn(
                    "col-start-1 row-start-1 inline-flex items-center justify-self-end rounded-full leading-none font-medium tracking-[-0.004em] whitespace-nowrap",
                    scale.chip,
                    pending ? riskTone.chip : DECISION_TONES[phase].chip
                  )}
                >
                  {warn ? (
                    <TriangleAlert
                      aria-hidden="true"
                      strokeWidth={2.5}
                      className={cn("shrink-0", scale.chipGlyph)}
                    />
                  ) : null}
                  {word}
                </Swap>
              </span>
            </div>

            {reason ? (
              <div className={cn("text-muted-foreground", scale.reason)}>{reason}</div>
            ) : null}
          </div>

          {lines.length > 0 ? (
            <Command
              lines={lines}
              prefix={prefix}
              phase={phase}
              animate={animate}
              scale={scale}
            />
          ) : null}

          <AnimatePresence initial={false}>
            {showRow ? (
              <motion.div
                key="row"
                className={cn(!caption && "overflow-hidden")}
                initial={false}
                animate={{ height: "auto", opacity: 1 }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: animate
                    ? {
                        height: { duration: 0.28, ease: EASE, delay: 0.12 },
                        opacity: { duration: 0.12, ease: "linear", delay: 0.08 },
                      }
                    : { duration: 0 },
                }}
              >
                {/*
                  The caption gives way first; only when even six characters of
                  it would not fit do the answers wrap under it, to the right.
                */}
                <div
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-x-3 gap-y-2",
                    scale.row
                  )}
                >
                  {caption ? (
                    <span
                      className={cn(
                        "min-w-0 grow basis-24 truncate font-mono text-muted-foreground",
                        scale.caption
                      )}
                    >
                      {tool}
                      {tool && meta ? (
                        <span aria-hidden="true" className="mx-1.5 opacity-50">
                          ·
                        </span>
                      ) : null}
                      {meta}
                    </span>
                  ) : (
                    <span />
                  )}

                  <AnimatePresence initial={false} onExitComplete={() => setPressed(null)}>
                    {pending ? (
                      <motion.div
                        key="actions"
                        className="ml-auto flex shrink-0 items-center gap-2"
                        initial={false}
                        /*
                         * The answers leave the way a sheet's buttons do: a
                         * slight shrink and a soft fade, in place. Nothing
                         * else on the card moves.
                         */
                        exit={{
                          opacity: 0,
                          scale: 0.94,
                          filter: "blur(2px)",
                          transition: animate
                            ? { duration: 0.18, ease: EASE }
                            : { duration: 0 },
                        }}
                      >
                        <Action
                          onClick={() => decide("deny")}
                          keys={denyKeys}
                          hint={hints}
                          pressed={pressed === "deny"}
                          animate={animate}
                          className={cn(
                            "bg-muted/70 text-foreground hover:bg-muted",
                            scale.button
                          )}
                          hintClassName={scale.hint}
                        >
                          {denyLabel}
                        </Action>

                        <Action
                          onClick={() => decide("allow")}
                          keys={allowKeys}
                          hint={hints}
                          pressed={pressed === "allow"}
                          animate={animate}
                          className={cn(riskTone.allow, scale.button)}
                          hintClassName={scale.hint}
                        >
                          {allowLabel}
                        </Action>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {footer ? (
        <div className={cn("relative", scale.footer)}>
          {chrome ? (
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-border/70"
            />
          ) : null}
          {footer}
        </div>
      ) : null}

      {announce ? (
        <span aria-live="polite" className="sr-only">
          {live}
        </span>
      ) : null}
    </div>
  )
}

/**
 * The circle. Its fill is a separate layer keyed on the phase, so an outcome
 * cross-fades one whole marker into the next — the clock's face swells away
 * as the tinted disc blooms up from the centre — rather than snapping a
 * colour. While the gate waits with a clock, a ring runs round the edge, its
 * arc draining over a faint track of the same hue, and the seconds sit
 * inside; without one, a pip or your icon does, on a tint of the risk.
 */
function Marker({
  phase,
  counting,
  held,
  progress,
  count,
  wholeSeconds,
  icon,
  ink,
  disc,
  stroke,
  track,
  animate,
  scale,
}: {
  phase: Phase
  counting: boolean
  held: boolean
  progress: ReturnType<typeof useMotionValue<number>>
  count: ReturnType<typeof useMotionValue<string>>
  wholeSeconds: number
  icon?: React.ReactNode
  ink: string
  disc: string
  stroke: string
  track: string
  animate: boolean
  scale: Scale
}) {
  const token = counting ? "clock" : phase === "pending" ? "pip" : phase
  const radius = scale.dial / 2 - scale.weight / 2

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full",
        "transition-colors duration-[var(--duration-base,200ms)] ease-[var(--ease-out-soft,ease-out)]",
        scale.marker,
        ink
      )}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={counting ? "clock" : phase}
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-0 rounded-full", disc)}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.12 }}
          /*
           * Split, because the two properties are doing different jobs. The
           * scale is the move and wants the spring's carry; the opacity is
           * only the handover between discs, and a spring settling towards
           * zero would hold the old one on screen at 2% for as long again.
           */
          transition={
            animate
              ? { scale: DISC, opacity: { duration: 0.22, ease: EASE } }
              : { duration: 0 }
          }
        />
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {counting ? (
          /*
           * Flipped and quartered so the circle's path — which starts at three
           * o'clock and runs clockwise — starts at twelve and runs the other
           * way. The drawn arc is then the time left, measured from twelve, and
           * the gap grows clockwise from twelve the way a clock is read. The
           * length rides a motion value the frame loop writes to, so the ring
           * never re-renders the card.
           */
          <motion.span
            key="dial"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            initial={false}
            animate={{ opacity: held ? 0.55 : 1 }}
            exit={{ opacity: 0, scale: 1.12 }}
            transition={animate ? { duration: 0.2, ease: EASE } : { duration: 0 }}
          >
            {/* A literal transform: Motion would compose the two the other way round. */}
            <svg
              viewBox={`0 0 ${scale.dial} ${scale.dial}`}
              className="size-full"
              style={{ transform: "rotate(90deg) scaleX(-1)" }}
            >
              <circle
                cx={scale.dial / 2}
                cy={scale.dial / 2}
                r={radius}
                fill="none"
                strokeWidth={scale.weight}
                className={track}
              />
              <motion.circle
                cx={scale.dial / 2}
                cy={scale.dial / 2}
                r={radius}
                fill="none"
                strokeWidth={scale.weight}
                strokeLinecap="round"
                className={stroke}
                style={{ pathLength: progress }}
              />
            </svg>
          </motion.span>
        ) : null}
      </AnimatePresence>

      <Swap
        token={token}
        animate={animate}
        className="relative flex items-center justify-center"
      >
        {counting ? (
          <span
            role="timer"
            className={cn("leading-none font-semibold tabular-nums", scale.count)}
          >
            <motion.span>{count}</motion.span>
            <span className="sr-only"> of {wholeSeconds} seconds left</span>
          </span>
        ) : phase === "pending" ? (
          icon ? (
            <span
              aria-hidden="true"
              className={cn(
                "flex items-center justify-center [&_svg]:size-full [&_svg]:shrink-0",
                scale.glyph
              )}
            >
              {icon}
            </span>
          ) : (
            <span aria-hidden="true" className={cn("rounded-full bg-current", scale.pip)} />
          )
        ) : (
          <OutcomeGlyph decision={phase} className={scale.glyph} />
        )}
      </Swap>
    </span>
  )
}

/**
 * The command, and what a refusal does to it.
 *
 * A denied command is struck through and its ink taken out, left to right,
 * as if by a pen. The stroke is a second copy of the text laid exactly over
 * the first, set struck and muted, and revealed by a clip that travels the
 * width of the block — so it follows every wrapped line rather than drawing
 * one rule through the middle of a paragraph. It is hidden from assistive
 * technology; the plain copy underneath is what gets read.
 */
function Command({
  lines,
  prefix,
  phase,
  animate,
  scale,
}: {
  lines: string[]
  prefix?: string
  phase: Phase
  animate: boolean
  scale: Scale
}) {
  /* `anywhere` rather than `break-word`: a long URL then cannot widen the column it sits in. */
  const body = cn(
    "font-mono leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]",
    scale.command
  )

  return (
    <div className="relative overflow-hidden rounded-soft" style={{ background: SURFACE }}>
      <div
        className={cn(
          body,
          "transition-colors duration-[var(--duration-slow,320ms)] ease-[var(--ease-out-soft,ease-out)]",
          phase === "expire" ? "text-muted-foreground" : "text-foreground"
        )}
      >
        <Lines lines={lines} prefix={prefix} />
      </div>

      <AnimatePresence initial={false}>
        {phase === "deny" ? (
          <motion.div
            key="strike"
            aria-hidden="true"
            className={cn(
              body,
              "pointer-events-none absolute inset-0 text-muted-foreground line-through decoration-critical/70"
            )}
            initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ opacity: 0 }}
            transition={
              animate
                ? {
                    clipPath: { duration: 0.5, ease: EASE, delay: 0.1 },
                    opacity: { duration: 0.12, ease: EASE },
                  }
                : { duration: 0 }
            }
          >
            <Lines lines={lines} prefix={prefix} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/**
 * One block per line. The prompt glyph is an inline block, which keeps a
 * strike from running through it, and is kept out of the selection so a
 * copied command does not arrive with a `$` on the front.
 */
function Lines({ lines, prefix }: { lines: string[]; prefix?: string }) {
  return lines.map((line, index) => (
    <span key={index} className="block">
      {prefix ? (
        <span aria-hidden="true" className="mr-2 inline-block opacity-40 select-none">
          {prefix}
        </span>
      ) : null}
      {line || " "}
    </span>
  ))
}

/**
 * One of the two answers, a capsule. `whileTap` answers the pointer;
 * `pressed` is the same dip when the key did it, so the button is seen to go
 * down either way. The key is set after the label, and takes its width whether
 * or not it is shown, so the button never changes size when the hints come on.
 */
function Action({
  onClick,
  keys,
  hint,
  pressed,
  animate,
  className,
  hintClassName,
  children,
}: {
  onClick: () => void
  keys: string[]
  hint: boolean
  pressed: boolean
  animate: boolean
  className: string
  hintClassName: string
  children: React.ReactNode
}) {
  const key = keys[0]

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-keyshortcuts={keys.length > 0 ? keys.join(" ") : undefined}
      className={cn(
        "inline-flex cursor-pointer items-center rounded-full font-semibold tracking-[-0.01em] whitespace-nowrap",
        "transition-colors duration-[var(--duration-fast,140ms)] ease-[var(--ease-out-soft,ease-out)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
      animate={{ scale: animate && pressed ? 0.95 : 1 }}
      /*
       * Always declared, because Motion marks anything with a tap gesture as
       * focusable in the markup it renders on the server; a prop that came and
       * went with the reduced-motion preference would render two different
       * buttons and fail to hydrate. Under the preference the dip is simply
       * nothing.
       */
      whileTap={{ scale: animate ? 0.95 : 1 }}
      transition={animate ? PRESS : { duration: 0 }}
    >
      {children}
      {key ? (
        <span
          aria-hidden="true"
          className={cn(
            "leading-none font-medium tabular-nums",
            "transition-opacity duration-[var(--duration-base,200ms)] ease-[var(--ease-out-soft,ease-out)]",
            hint ? "opacity-55" : "opacity-0",
            hintClassName
          )}
        >
          {keyLabel(key)}
        </span>
      ) : null}
    </motion.button>
  )
}

/**
 * Swaps whatever it wraps whenever `token` changes, and stays perfectly still
 * otherwise — including on mount, which is what keeps a freshly rendered gate
 * from performing. The way a symbol replaces another: the outgoing glyph
 * shrinks and softens out of focus, the incoming one arrives from below on a
 * loose spring, so a tick landing has a fraction of overshoot on it — the
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

function OutcomeGlyph({
  decision,
  className,
}: {
  decision: ApprovalGateDecision
  className?: string
}) {
  const Icon = decision === "allow" ? Check : decision === "deny" ? X : Hourglass
  return (
    <Icon
      aria-hidden="true"
      strokeWidth={decision === "expire" ? 2.25 : 3}
      className={cn("shrink-0", className)}
    />
  )
}

/**
 * The clock.
 *
 * Driven by the frame loop rather than by an interval, so it stops with the
 * tab and cannot fire while nobody could have seen it. Nothing here is React
 * state: the ring's length and the seconds inside it are motion values the
 * loop writes to, so the card does not re-render once a frame for as long as
 * it waits. Both are put back to full the moment the gate resolves, which is
 * what lets a gate that is asked again start from the top with no first frame
 * showing the old count.
 */
function useCountdown(
  total: number | undefined,
  pending: boolean,
  held: boolean,
  stepped: boolean,
  onEnd: () => void
) {
  const progress = useMotionValue(1)
  const count = useMotionValue(formatCount(total === undefined ? 0 : total / 1000))
  const left = React.useRef<number | null>(null)
  const end = React.useRef(onEnd)

  React.useEffect(() => {
    end.current = onEnd
  }, [onEnd])

  React.useEffect(() => {
    if (!pending || total === undefined) return

    if (left.current === null) left.current = total
    if (held) return

    let frame = 0
    let last: number | null = null

    const tick = (now: number) => {
      const step = last === null ? 0 : Math.min(now - last, MAX_STEP)
      last = now
      const remaining = Math.max(0, (left.current ?? total) - step)
      left.current = remaining

      const seconds = Math.ceil(remaining / 1000)
      /* With motion turned down the ring steps once a second instead of sweeping. */
      progress.set(stepped ? Math.min(1, (seconds * 1000) / total) : remaining / total)
      count.set(formatCount(seconds))

      if (remaining <= 0) {
        end.current()
        return
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [pending, total, held, stepped, progress, count])

  /* Disarm as the gate resolves, so the next wait starts full. */
  React.useEffect(() => {
    if (pending) return
    left.current = null
    progress.set(1)
    count.set(formatCount(total === undefined ? 0 : total / 1000))
  }, [pending, total, progress, count])

  return { progress, count }
}

/** Seconds inside the dial: whole seconds, or minutes past the point two digits fit. */
function formatCount(seconds: number): string {
  const whole = Math.ceil(seconds)
  return whole >= 100 ? `${Math.ceil(whole / 60)}m` : String(whole)
}

/** What the hint beside a button shows for a key name. */
function keyLabel(key: string): string {
  if (key === "Escape") return "esc"
  if (key === "Enter") return "↵"
  if (key === " ") return "Space"
  if (key === "ArrowUp") return "↑"
  if (key === "ArrowDown") return "↓"
  if (key === "ArrowLeft") return "←"
  if (key === "ArrowRight") return "→"
  return key.length === 1 ? key.toUpperCase() : key
}

/**
 * Which answer a key press is, if any. Modified keys and repeats are left
 * alone, and so is anything typed into a field; a key that would activate the
 * focused button anyway is left to the button, so it is never answered twice.
 */
function matchKey(
  event: Pick<
    KeyboardEvent,
    "key" | "repeat" | "metaKey" | "ctrlKey" | "altKey" | "defaultPrevented" | "target"
  >,
  allow: string[],
  deny: string[]
): ApprovalGateDecision | null {
  if (event.defaultPrevented || event.repeat) return null
  if (event.metaKey || event.ctrlKey || event.altKey) return null

  const target = event.target
  if (target instanceof HTMLElement) {
    if (target.isContentEditable) return null
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return null
    if (
      (event.key === "Enter" || event.key === " ") &&
      /^(BUTTON|A)$/.test(target.tagName)
    ) {
      return null
    }
  }

  const hit = (keys: string[]) =>
    keys.some((key) =>
      key.length === 1 ? key.toLowerCase() === event.key.toLowerCase() : key === event.key
    )

  if (hit(allow)) return "allow"
  if (hit(deny)) return "deny"
  return null
}
