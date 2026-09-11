"use client"

import * as React from "react"
import { Check, Hourglass, X } from "lucide-react"
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
 * waits in the page's own ink — a monochrome clock, a muted word — and the
 * two warmer families are reserved for one that might, or will. Everything
 * reads the component palette rather than a literal colour, so a consumer can
 * retint the whole family in `globals.css`.
 */
const RISK_TONES: Record<
  ApprovalGateRisk,
  { ink: string; stroke: string; word: string; pip: string }
> = {
  low: {
    ink: "text-foreground",
    stroke: "stroke-foreground",
    word: "text-muted-foreground",
    pip: "bg-muted-foreground",
  },
  medium: {
    ink: "text-caution",
    stroke: "stroke-caution",
    word: "text-caution",
    pip: "bg-caution",
  },
  high: {
    ink: "text-critical",
    stroke: "stroke-critical",
    word: "text-critical",
    pip: "bg-critical",
  },
}

/** And one per outcome. `ring` is the marker's outline and tint together. */
const DECISION_TONES: Record<ApprovalGateDecision, { ink: string; ring: string }> = {
  allow: { ring: "border-positive/35 bg-positive-soft", ink: "text-positive" },
  deny: { ring: "border-critical/40 bg-critical-soft", ink: "text-critical" },
  expire: { ring: "border-dashed border-border bg-muted/40", ink: "text-muted-foreground" },
}

/** The track the clock runs on: a hairline, so the arc over it is the only mark. */
const WAITING_RING = "border-border"

/**
 * The command's surface: a wash of the theme's own ink over whatever is
 * behind it, which is the one formulation that survives both themes.
 */
const SURFACE =
  "var(--approval-gate-command, color-mix(in oklab, var(--foreground) 4%, transparent))"

/* The status word, set in the host's interface face — a status is read, not decoded. */
const MICRO_LABEL = "leading-none font-medium tracking-[-0.005em]"

const DEFAULT_ALLOW = ["y"]
const DEFAULT_DENY = ["n", "Escape"]

/*
 * The vocabulary, shared with the rest of the family. A move that nothing can
 * countermand half way through — a strike drawing, a row folding — is a tween
 * on a decisive curve. A ring blooming or a glyph landing can be overtaken by
 * the next state a fraction of a second later, so those ride springs, which
 * carry the velocity they already had into the new target.
 */
const EASE = [0.22, 1, 0.36, 1] as const
const RING = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } as const
const GLYPH = { type: "spring", stiffness: 620, damping: 26, mass: 0.6 } as const
const PRESS = { type: "spring", stiffness: 700, damping: 30, mass: 0.5 } as const

/**
 * The most the clock is allowed to lose in one frame. The countdown rides the
 * frame loop, which stops in a background tab and restarts with one very long
 * frame when the tab comes back; capping the step turns that into a pause
 * rather than an expiry the reader never saw coming.
 */
const MAX_STEP = 120

const SIZES = {
  sm: {
    marker: "size-6",
    glyph: "size-3",
    pip: "size-1.5",
    count: "text-[0.5625rem]",
    row: "min-h-6",
    title: "text-[0.8125rem]",
    word: "text-[0.625rem]",
    reason: "text-xs",
    command: "px-2.5 py-1.5 text-[0.6875rem]",
    caption: "text-[0.625rem]",
    button: "h-6 gap-1.5 px-2 text-[0.6875rem]",
    hint: "text-[0.625rem]",
    gap: "gap-2.5",
    stack: "gap-2",
    padding: "p-3.5",
    footer: "mt-3 pt-3",
  },
  md: {
    marker: "size-7",
    glyph: "size-3.5",
    pip: "size-1.5",
    count: "text-[0.625rem]",
    row: "min-h-7",
    title: "text-sm",
    word: "text-[0.6875rem]",
    reason: "text-[0.8125rem]",
    command: "px-3 py-2 text-xs",
    caption: "text-[0.6875rem]",
    button: "h-7 gap-2 px-2.5 text-xs",
    hint: "text-[0.6875rem]",
    gap: "gap-3",
    stack: "gap-2.5",
    padding: "p-4",
    footer: "mt-3.5 pt-3.5",
  },
} as const

type Scale = (typeof SIZES)[keyof typeof SIZES]

/**
 * The moment an agent stops and asks. Where `ToolTrace` is what a run looks
 * like from the inside, this is the one step in it that cannot happen without
 * a person: the tool it wants, the command it would give, and two ways to
 * answer.
 *
 * At rest it is a still card, and a quiet one — a title, a word beside it, the
 * command on a wash of the page's own ink, and the two answers. The one thing
 * that moves while it waits is the clock: a hairline ring around the marker,
 * draining clockwise from twelve with the seconds left set inside it. It
 * holds whenever the reader is plainly reading — pointer over the card, focus
 * inside it, the card scrolled out of view — because a timeout is a safety
 * net for a gate nobody is looking at, not a race against the person in front
 * of it. A decision is one move each way: allowing lets the buttons go and
 * sets a tick in the ring; denying draws a strike through the command, left
 * to right, and takes the ink out of it as it goes; letting the clock run out
 * does neither — the ring goes dashed, the command dims, and the word says so.
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
   */
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const inView = useInView(root, { amount: 0.4, initial: true })
  const held = !inView || (pauseWhileReading && (hovered || focused))

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
        "relative flex w-full flex-col text-foreground outline-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        chrome && "rounded-soft-lg border border-border bg-card",
        chrome && scale.padding,
        className
      )}
      {...props}
    >
      <div className={cn("flex items-start", scale.gap)}>
        <Marker
          phase={phase}
          counting={counting}
          held={held}
          progress={progress}
          count={count}
          wholeSeconds={wholeSeconds}
          icon={icon}
          ink={pending ? riskTone.ink : DECISION_TONES[phase].ink}
          ring={pending ? WAITING_RING : DECISION_TONES[phase].ring}
          stroke={riskTone.stroke}
          pip={riskTone.pip}
          animate={animate}
          scale={scale}
        />

        <div className={cn("flex min-w-0 flex-1 flex-col", scale.stack)}>
          <div className={cn("flex items-center gap-3", scale.row)}>
            <p
              id={titleId}
              className={cn(
                "min-w-0 flex-1 leading-5 font-medium tracking-[-0.006em]",
                scale.title
              )}
            >
              <span className="sr-only">{label}: </span>
              {title}
            </p>

            {/*
              Stacked in a single grid cell so the outgoing and incoming words
              overlap instead of shunting the row mid-cross-fade.
            */}
            <span className="grid shrink-0">
              <Swap
                token={word}
                animate={animate}
                className={cn(
                  MICRO_LABEL,
                  "col-start-1 row-start-1 whitespace-nowrap",
                  scale.word,
                  pending ? riskTone.word : DECISION_TONES[phase].ink
                )}
              >
                {word}
              </Swap>
            </span>
          </div>

          {reason ? (
            <div className={cn("leading-relaxed text-muted-foreground", scale.reason)}>
              {reason}
            </div>
          ) : null}

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
                        height: { duration: 0.24, ease: EASE, delay: 0.12 },
                        opacity: { duration: 0.12, ease: "linear", delay: 0.08 },
                      }
                    : { duration: 0 },
                }}
              >
                <div className={cn("flex items-center justify-between gap-3", scale.row)}>
                  {caption ? (
                    <span
                      className={cn(
                        "min-w-0 truncate font-mono text-muted-foreground",
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
                        className="flex shrink-0 items-center gap-1"
                        initial={false}
                        /*
                         * The answers leave the way the gate opens: a step to
                         * the right and gone. Nothing else on the card moves.
                         */
                        exit={{
                          opacity: 0,
                          x: 6,
                          transition: animate
                            ? { duration: 0.16, ease: EASE }
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
                            "text-muted-foreground hover:bg-muted hover:text-foreground",
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
                          className={cn(
                            "bg-primary text-primary-foreground hover:bg-primary/90",
                            scale.button
                          )}
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
        <div className={cn(chrome && "border-t border-border", scale.footer)}>{footer}</div>
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
 * The circle. Its ring is a separate layer keyed on the phase, so an outcome
 * cross-fades one whole marker into the next — the hairline track expands
 * away as the tinted ring blooms up from the centre — rather than snapping a
 * border colour. While the gate waits with a clock, the arc runs on top of
 * the track and the seconds sit inside; without one, a pip does.
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
  ring,
  stroke,
  pip,
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
  ring: string
  stroke: string
  pip: string
  animate: boolean
  scale: Scale
}) {
  const token = counting ? "clock" : phase === "pending" ? "pip" : phase

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
          key={phase}
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-0 rounded-full border", ring)}
          initial={{ opacity: 0, scale: 0.62 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.18 }}
          /*
           * Split, because the two properties are doing different jobs. The
           * scale is the move and wants the spring's carry; the opacity is
           * only the handover between rings, and a spring settling towards
           * zero would hold the old one on screen at 2% for as long again.
           */
          transition={
            animate
              ? { scale: RING, opacity: { duration: 0.24, ease: EASE } }
              : { duration: 0 }
          }
        />
      </AnimatePresence>

      {counting ? (
        /*
         * Flipped and quartered so the circle's path — which starts at three
         * o'clock and runs clockwise — starts at twelve and runs the other
         * way. The drawn arc is then the time left, measured from twelve, and
         * the gap grows clockwise from twelve the way a clock is read. The
         * length rides a motion value the frame loop writes to, so the ring
         * never re-renders the card.
         */
        <svg
          aria-hidden="true"
          viewBox="0 0 28 28"
          className={cn(
            "pointer-events-none absolute inset-0 size-full",
            "transition-opacity duration-[var(--duration-base,200ms)] ease-[var(--ease-out-soft,ease-out)]",
            held && "opacity-50"
          )}
          style={{ transform: "rotate(90deg) scaleX(-1)" }}
        >
          <motion.circle
            cx={14}
            cy={14}
            r={13.25}
            fill="none"
            strokeWidth={1.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={stroke}
            style={{ pathLength: progress }}
          />
        </svg>
      ) : null}

      <Swap
        token={token}
        animate={animate}
        className="relative flex items-center justify-center"
      >
        {counting ? (
          <span
            role="timer"
            className={cn("font-mono leading-none font-medium tabular-nums", scale.count)}
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
            <span aria-hidden="true" className={cn("rounded-full", scale.pip, pip)} />
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
  const body = cn("font-mono leading-relaxed break-words whitespace-pre-wrap", scale.command)

  return (
    <div className="relative overflow-hidden rounded-soft-sm" style={{ background: SURFACE }}>
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
                    clipPath: { duration: 0.46, ease: EASE, delay: 0.1 },
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
        <span aria-hidden="true" className="mr-2 inline-block opacity-50 select-none">
          {prefix}
        </span>
      ) : null}
      {line || " "}
    </span>
  ))
}

/**
 * One of the two answers. `whileTap` answers the pointer; `pressed` is the
 * same dip when the key did it, so the button is seen to go down either way.
 * The key is set after the label in mono, and takes its width whether or not
 * it is shown, so the button never changes size when the hints come on.
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
        "inline-flex cursor-pointer items-center rounded-soft font-medium whitespace-nowrap",
        "transition-colors duration-[var(--duration-fast,140ms)] ease-[var(--ease-out-soft,ease-out)]",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        className
      )}
      animate={{ scale: animate && pressed ? 0.96 : 1 }}
      /*
       * Always declared, because Motion marks anything with a tap gesture as
       * focusable in the markup it renders on the server; a prop that came and
       * went with the reduced-motion preference would render two different
       * buttons and fail to hydrate. Under the preference the dip is simply
       * nothing.
       */
      whileTap={{ scale: animate ? 0.96 : 1 }}
      transition={animate ? PRESS : { duration: 0 }}
    >
      {children}
      {key ? (
        <span
          aria-hidden="true"
          className={cn(
            "font-mono leading-none font-normal",
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
 * from performing. The outgoing glyph leaves upward and the incoming one
 * arrives from below on a loose spring, so a tick landing has a fraction of
 * overshoot on it: the difference between a mark being placed and two images
 * being dissolved into each other.
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
        initial={{ opacity: 0, scale: 0.5, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{
          opacity: 0,
          scale: 0.5,
          y: -4,
          transition: animate ? { duration: 0.12, ease: EASE } : { duration: 0 },
        }}
        transition={
          animate
            ? { scale: GLYPH, y: GLYPH, opacity: { duration: 0.14, ease: EASE } }
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
  return <Icon aria-hidden="true" className={cn("shrink-0", className)} />
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

/** Seconds inside a 28px circle: whole seconds, or minutes past the point two digits fit. */
function formatCount(seconds: number): string {
  const whole = Math.ceil(seconds)
  return whole >= 100 ? `${Math.ceil(whole / 60)}m` : String(whole)
}

/** What the hint beside a button shows for a key name. */
function keyLabel(key: string): string {
  if (key === "Escape") return "Esc"
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
