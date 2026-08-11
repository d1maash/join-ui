"use client"

import * as React from "react"
import { Check, ChevronRight, LoaderCircle, Minus, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export type ToolTraceStepState =
  "pending" | "running" | "done" | "failed" | "skipped"

export interface ToolTraceStep {
  /** Stable identity for the rendered list item. */
  id: string
  /** The tool that ran. Set in mono, because it is an identifier. */
  name: string
  /** Its arguments in one line — `pattern: "useEffect", glob: "*.tsx"`. */
  summary?: string
  state?: ToolTraceStepState
  /** Trailing meta, set in mono with tabular figures — a duration, a token count. */
  meta?: string
  /** Markup revealed under the row, above the console. */
  detail?: React.ReactNode
  /** The console body. Revealed a line at a time while the step is running. */
  output?: string[]
  /** Replaces the state glyph inside the marker. */
  icon?: React.ReactNode
  /** Opens the step on first render. */
  defaultOpen?: boolean
}

/**
 * Spelled out beside every step. Hue alone never carries the state — this is
 * the word a screen reader announces, and the one that keeps the trace legible
 * for anyone who cannot separate green from red.
 */
const STATE_LABEL: Record<ToolTraceStepState, string> = {
  pending: "Queued",
  running: "Running",
  done: "Done",
  failed: "Failed",
  skipped: "Skipped",
}

/**
 * One hue per state, taken from the component palette rather than a literal
 * colour, so a consumer can retint the whole family in `globals.css`.
 *
 * `ring` is the marker's outline and tint together, because the two cross-fade
 * as one shape when a step resolves — a dashed grey square turning into a
 * tinted one is a single move, not two.
 */
const TONES: Record<
  ToolTraceStepState,
  { ring: string; ink: string; name: string; chip: string; chipIcon: string }
> = {
  pending: {
    ring: "border-dashed border-border bg-muted/40",
    ink: "text-muted-foreground",
    name: "text-muted-foreground",
    chip: "bg-muted text-muted-foreground",
    chipIcon: "bg-muted-foreground/25 text-muted-foreground",
  },
  running: {
    ring: "border-info/50 bg-info-soft ring-[3px] ring-info/12",
    ink: "text-info",
    name: "text-foreground",
    chip: "bg-info-soft text-info",
    chipIcon: "bg-info text-info-foreground",
  },
  done: {
    ring: "border-positive/35 bg-positive-soft",
    ink: "text-positive",
    name: "text-foreground",
    chip: "bg-positive-soft text-positive",
    chipIcon: "bg-positive text-positive-foreground",
  },
  failed: {
    ring: "border-critical/40 bg-critical-soft",
    ink: "text-critical",
    name: "text-critical",
    chip: "bg-critical-soft text-critical",
    chipIcon: "bg-critical text-critical-foreground",
  },
  skipped: {
    ring: "border-dashed border-border bg-transparent",
    ink: "text-muted-foreground/70",
    name: "text-muted-foreground/70",
    chip: "bg-muted text-muted-foreground",
    chipIcon: "bg-muted-foreground/25 text-muted-foreground",
  },
}

/** The colour the rail takes once the step above it has resolved. */
const TRAIL_FILL = "bg-positive/60"
const TRAIL_FAILED = "bg-critical/50"

/**
 * The console surface.
 *
 * A wash of the theme's own ink over whatever is behind it, which is the one
 * formulation that survives both themes: 4% of near-black on paper reads as a
 * recessed panel, and 4% of near-white on charcoal reads as the same thing. A
 * literal grey would work in exactly one of them.
 */
const CONSOLE =
  "var(--tool-trace-console, color-mix(in oklab, var(--foreground) 4%, transparent))"

/*
 * The chip and status labels. Set in whatever face the host app uses for its
 * interface — an installed component has no business asserting a second family,
 * and a status word ("Running", "Failed") is read, not decoded. Mono is spent
 * on the two things that really are identifiers: the tool name and its output.
 */
const MICRO_LABEL = "text-[0.6875rem] leading-none font-medium tracking-[-0.005em]"

const EASE = [0.22, 1, 0.36, 1] as const

/*
 * The two scales.
 *
 * `line`, `lead` and `lane` are one calculation rather than three settings. The
 * marker is a square in a column of its own, so nothing centres it against the
 * row beside it — `lead` does that by hand, and it can only be right if the
 * row's line box is a known height, which is what `line` pins down:
 *
 *   lead = row padding + line / 2 - marker / 2
 *
 * `lane` then gives the same amount back off its bottom margin, because every
 * marker below this one has been pushed down by its own `lead`. Without that
 * the rail hangs high in the gap it is meant to bridge.
 */
const SIZES = {
  sm: {
    marker: "size-6",
    glyph: "size-3",
    pip: "size-1.5",
    name: "text-[0.8125rem]",
    summary: "text-xs",
    meta: "text-[0.6875rem]",
    console: "text-[0.6875rem]",
    row: "py-2",
    line: "leading-5",
    lead: "pt-1.5",
    columnGap: "gap-2.5",
    lane: "mt-1.5 mb-0",
    padding: "p-4",
    panel: "pt-1 pb-2.5",
  },
  md: {
    marker: "size-7",
    glyph: "size-3.5",
    pip: "size-2",
    name: "text-[0.875rem]",
    summary: "text-[0.8125rem]",
    meta: "text-xs",
    console: "text-xs",
    row: "py-2.5",
    line: "leading-5",
    lead: "pt-1.5",
    columnGap: "gap-3",
    lane: "mt-2 mb-0.5",
    padding: "p-5",
    panel: "pt-1.5 pb-3.5",
  },
} as const

export interface ToolTraceProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> {
  steps: ToolTraceStep[]
  /** Header eyebrow, and the accessible name of the list. */
  label?: string
  /** Header chip copy. Derived from the resolved steps when omitted. */
  status?: string
  /** `plain` drops the card, so the list can sit in a surface you own. */
  variant?: "card" | "plain"
  showHeader?: boolean
  size?: "sm" | "md"
  /** Controlled disclosure — the ids of the steps that are open. */
  expanded?: string[]
  /** Open unless the reader says otherwise. Falls back to the steps' `defaultOpen`. */
  defaultExpanded?: string[]
  /** Fires when the reader opens or closes a step. `follow` does not fire it. */
  onExpandedChange?: (expanded: string[]) => void
  /** Allows more than one step to be open at a time. */
  multiple?: boolean
  /**
   * Opens the step that starts running and closes it again when it resolves,
   * so an unattended trace shows the work in flight. Ignored while `expanded`
   * is controlled, and yields permanently on any step you open or close.
   */
  follow?: boolean
  /** Reveals a running step's output a line at a time. */
  stream?: boolean
  /** Milliseconds per revealed line. */
  lineSpeed?: number
  /** Height the console scrolls within. */
  maxConsoleHeight?: string
  /** Announces each step's state change through a polite live region. */
  announce?: boolean
  /** Rendered below a rule — an action, a note, a summary row. */
  footer?: React.ReactNode
}

/**
 * The log of an agent run: every tool it reached for, in order, and what came
 * back. Where `AgentHive` dispatches the work and queues it, this is what one
 * of those runs looks like from the inside.
 *
 * At rest it is a still drawing — a hairline rail through a column of markers,
 * dashed for what has not happened yet and tinted for what has. The motion is
 * spent on the one thing worth showing: the step in flight. It opens itself as
 * it starts, writes its output into the console a line at a time, and folds
 * away again the moment it resolves, handing the rail down to the next step.
 * Everything above it goes still.
 *
 * Each state gets its own hue — blue while running, green when it lands, red
 * when it does not, grey for what was queued or skipped — and each hue is
 * backed by a glyph and a text label, so nothing depends on being able to tell
 * the colours apart.
 */
export function ToolTrace({
  steps,
  label = "Run",
  status,
  variant = "card",
  showHeader = true,
  size = "md",
  expanded,
  defaultExpanded,
  onExpandedChange,
  multiple = true,
  follow = true,
  stream = true,
  lineSpeed = 90,
  maxConsoleHeight = "11rem",
  announce = true,
  footer,
  className,
  ...props
}: ToolTraceProps) {
  const reduceMotion = useReducedMotion()
  const labelId = React.useId()
  const scale = SIZES[size]
  const chrome = variant === "card"
  const animate = !reduceMotion

  const resolved = steps.map((step) => ({ ...step, state: step.state ?? "pending" }))

  const controlled = expanded !== undefined

  /**
   * Steps the reader has opened or closed themselves, and which way.
   *
   * This is the only disclosure state the component keeps, because `follow` is
   * a rule rather than an event: the step that is running is open *because* it
   * is running, so there is nothing to switch on when it starts and nothing to
   * switch off when it lands. It falls out of the steps you already pass, and
   * an entry here simply outranks it — which is what makes a panel the reader
   * opened stay open for good.
   */
  const [claimed, setClaimed] = React.useState<Record<string, boolean>>({})

  const derived = resolved
    .filter((step) => {
      const own = claimed[step.id]
      if (own !== undefined) return own
      if (follow && step.state === "running") return true
      return defaultExpanded ? defaultExpanded.includes(step.id) : Boolean(step.defaultOpen)
    })
    .map((step) => step.id)

  /*
   * One panel at a time, decided in a fixed order so the answer never depends
   * on which of two reasons to be open arrived first: what the reader opened
   * wins, then what is running, then whatever was open by default.
   */
  const single =
    derived.find((id) => claimed[id]) ??
    derived.find((id) => resolved.find((step) => step.id === id)?.state === "running") ??
    derived[0]

  const open = controlled
    ? expanded
    : multiple || derived.length < 2
      ? derived
      : single
        ? [single]
        : []

  function toggle(id: string) {
    const isOpen = open.includes(id)
    const next = isOpen
      ? open.filter((entry) => entry !== id)
      : multiple
        ? [...open, id]
        : [id]

    if (!controlled) {
      /* Closing keeps the other claims; opening alone clears them, because the
         panel that was open has just been closed by this one. */
      setClaimed((current) =>
        isOpen || multiple ? { ...current, [id]: !isOpen } : { [id]: true }
      )
    }
    onExpandedChange?.(next)
  }

  const summary = summarise(resolved)
  const summaryTone = TONES[summary.state]
  const summaryLabel = status ?? summary.label

  /*
   * The one thing said out loud: the tool that is in flight, and the outcome
   * once nothing is. Both are read straight off the steps, so the live region's
   * text changes exactly when the run does — a console writing itself a line at
   * a time is unreadable through a screen reader, but "run_tests, Running" is
   * precisely what someone following along needs, and it is said once.
   */
  const inFlight = resolved.find((step) => step.state === "running")
  const spoken = inFlight
    ? `${inFlight.name}, ${STATE_LABEL.running}`
    : `${label}, ${summaryLabel}`

  /** Toggle buttons, in document order, for the roving arrow keys. */
  const buttons = React.useRef<Array<HTMLButtonElement | null>>([])

  function handleKeyDown(event: React.KeyboardEvent<HTMLOListElement>) {
    /*
     * Sparse by design: a step with nothing to show never registers, so the
     * slots between the toggles are empty rather than null, and a step that
     * stopped being expandable can leave a detached node behind.
     */
    const order = buttons.current.filter(
      (node): node is HTMLButtonElement => node instanceof HTMLElement && node.isConnected
    )
    if (order.length === 0) return

    const from = order.indexOf(document.activeElement as HTMLButtonElement)
    if (from === -1) return

    let next: number | null = null
    if (event.key === "ArrowDown") next = from + 1
    else if (event.key === "ArrowUp") next = from - 1
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = order.length - 1
    if (next === null) return

    event.preventDefault()
    order[Math.min(order.length - 1, Math.max(0, next))]?.focus()
  }

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
                  animate={animate}
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
                className={cn(MICRO_LABEL, "col-start-1 row-start-1 whitespace-nowrap")}
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
        onKeyDown={handleKeyDown}
        className={cn("flex flex-1 flex-col", chrome && scale.padding)}
      >
        {resolved.map((step, index) => (
          <Step
            key={step.id}
            step={step}
            last={index === resolved.length - 1}
            open={open.includes(step.id)}
            onToggle={toggle}
            register={(node) => {
              buttons.current[index] = node
            }}
            stream={stream}
            lineSpeed={lineSpeed}
            maxConsoleHeight={maxConsoleHeight}
            animate={animate}
            scale={scale}
          />
        ))}
      </ol>

      {footer ? (
        <div className={cn(chrome ? "border-t border-border px-4 py-3" : "pt-3.5")}>
          {footer}
        </div>
      ) : null}

      {announce ? (
        <span aria-live="polite" className="sr-only">
          {spoken}
        </span>
      ) : null}
    </div>
  )
}

/**
 * One tool call: the marker and the rail on the left, the row and whatever it
 * hides on the right.
 *
 * A step with neither `detail` nor `output` renders as a plain row rather than
 * as a button that opens onto nothing, which is what keeps the tab order down
 * to the steps that actually have something to show.
 */
function Step({
  step,
  last,
  open,
  onToggle,
  register,
  stream,
  lineSpeed,
  maxConsoleHeight,
  animate,
  scale,
}: {
  step: ToolTraceStep & { state: ToolTraceStepState }
  last: boolean
  open: boolean
  onToggle: (id: string) => void
  register: (node: HTMLButtonElement | null) => void
  stream: boolean
  lineSpeed: number
  maxConsoleHeight: string
  animate: boolean
  scale: (typeof SIZES)[keyof typeof SIZES]
}) {
  const panelId = React.useId()
  const buttonId = React.useId()
  const tone = TONES[step.state]
  const output = step.output ?? []
  const expandable = Boolean(step.detail) || output.length > 0

  /*
   * Captured at mount, the way `AgentHive` captures an arriving run: a step
   * that was already running when the page loaded is finished text, and only
   * one that *starts* running under the reader's eyes writes itself out.
   */
  const [mountedRunning] = React.useState(step.state === "running")
  const streaming = stream && step.state === "running" && !mountedRunning
  const revealed = useRevealedCount(output.length, streaming, lineSpeed)

  const row = (
    <>
      <span
        className={cn(
          "min-w-0 flex-1 truncate font-mono tracking-tight",
          "transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
          /* Pins the row's height, which is what `lead` is measured against —
             an inherited line-height would slide the marker off centre. */
          scale.line,
          scale.name,
          tone.name,
          step.state === "skipped" && "line-through decoration-border-strong"
        )}
      >
        {step.name}
        {step.summary ? (
          <span
            className={cn(
              "ml-2 font-sans font-normal text-muted-foreground",
              scale.summary
            )}
          >
            {step.summary}
          </span>
        ) : null}
        <span className="sr-only">{`, ${STATE_LABEL[step.state]}`}</span>
      </span>

      {step.meta ? (
        <span
          className={cn(
            "shrink-0 font-mono text-muted-foreground tabular-nums",
            scale.meta
          )}
        >
          {step.meta}
        </span>
      ) : null}

      {expandable ? (
        <motion.span
          aria-hidden="true"
          className="flex shrink-0 items-center text-muted-foreground"
          animate={{ rotate: open ? 90 : 0 }}
          initial={false}
          transition={animate ? { duration: 0.22, ease: EASE } : { duration: 0 }}
        >
          <ChevronRight className="size-4" />
        </motion.span>
      ) : null}
    </>
  )

  return (
    <li
      aria-current={step.state === "running" ? "step" : undefined}
      className={cn("flex min-w-0 items-stretch", scale.columnGap)}
    >
      {/* `lead` drops the square onto the centre of the row's first line. */}
      <div className={cn("flex shrink-0 flex-col items-center", scale.lead)}>
        <Marker
          state={step.state}
          icon={step.icon}
          tone={tone}
          animate={animate}
          sizeClassName={scale.marker}
          glyphClassName={scale.glyph}
          pipClassName={scale.pip}
        />

        {!last ? (
          <Trail
            /* The rail belongs to the step above it, and fills the moment that
               step resolves — which is the move that reads as progress. */
            state={step.state}
            laneClassName={scale.lane}
            animate={animate}
          />
        ) : null}
      </div>

      <div className={cn("flex min-w-0 flex-1 flex-col", !last && "pb-1")}>
        {expandable ? (
          <button
            type="button"
            id={buttonId}
            ref={register}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => onToggle(step.id)}
            className={cn(
              "-mx-2 flex w-full cursor-pointer items-center gap-3 rounded-soft-sm px-2 text-left",
              "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
              "hover:bg-muted/50",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
              scale.row
            )}
          >
            {row}
          </button>
        ) : (
          <div className={cn("flex items-center gap-3", scale.row)}>{row}</div>
        )}

        {/*
          `initial={false}` keeps anything open on the first paint simply open:
          a trace that is merely rendered does not unfold itself.
        */}
        <AnimatePresence initial={false}>
          {expandable && open ? (
            <motion.div
              key="panel"
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={animate ? { duration: 0.26, ease: EASE } : { duration: 0 }}
            >
              <div className={cn("flex flex-col gap-2.5", scale.panel)}>
                {step.detail ? (
                  <div
                    className={cn(
                      "leading-relaxed text-muted-foreground",
                      scale.summary
                    )}
                  >
                    {step.detail}
                  </div>
                ) : null}

                {output.length > 0 ? (
                  <Console
                    lines={output}
                    revealed={streaming ? revealed : output.length}
                    running={step.state === "running"}
                    failed={step.state === "failed"}
                    maxHeight={maxConsoleHeight}
                    animate={animate}
                    scale={scale}
                  />
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </li>
  )
}

/**
 * The square. Its ring is a separate absolutely-positioned layer keyed on the
 * state, so resolving cross-fades one whole marker into the next — the old ring
 * expands away as the new one blooms up from the centre — rather than snapping
 * a dashed border to a solid one. `initial={false}` keeps all of that off the
 * first paint.
 */
function Marker({
  state,
  icon,
  tone,
  animate,
  sizeClassName,
  glyphClassName,
  pipClassName,
}: {
  state: ToolTraceStepState
  icon?: React.ReactNode
  tone: (typeof TONES)[ToolTraceStepState]
  animate: boolean
  sizeClassName?: string
  glyphClassName?: string
  pipClassName?: string
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-soft-sm",
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
            "pointer-events-none absolute inset-0 rounded-soft-sm border",
            tone.ring
          )}
          initial={{ opacity: 0, scale: 0.62 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.18 }}
          transition={animate ? { duration: 0.34, ease: EASE } : { duration: 0 }}
        />
      </AnimatePresence>

      {/*
        The one loop in the component, and it runs only while a tool is
        genuinely in flight — a step that is working is not at rest, and this is
        the single mark on the page that says so.
      */}
      <AnimatePresence initial={false}>
        {state === "running" && animate ? (
          <motion.span
            key="ping"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-soft-sm border border-info"
            initial={{ opacity: 0.45, scale: 1 }}
            animate={{ opacity: [0.45, 0], scale: [1, 1.55] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
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
            animate={animate}
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
 * draws downward the instant the step above it resolves. It stretches with the
 * row, so a step that opens carries the rail past its own console.
 */
function Trail({
  state,
  laneClassName,
  animate,
}: {
  state: ToolTraceStepState
  laneClassName?: string
  animate: boolean
}) {
  const filled = state === "done" || state === "failed" || state === "skipped"

  return (
    <span
      aria-hidden="true"
      className={cn("relative w-px min-h-3 flex-1 bg-border", laneClassName)}
    >
      <motion.span
        className={cn(
          "absolute inset-0",
          state === "failed" ? TRAIL_FAILED : TRAIL_FILL
        )}
        style={{ transformOrigin: "center top" }}
        initial={false}
        animate={{ scaleY: filled ? 1 : 0 }}
        transition={animate ? { duration: 0.42, ease: EASE } : { duration: 0 }}
      />
    </span>
  )
}

/**
 * What the tool wrote.
 *
 * Lines already on screen when the panel opened are static text; only the ones
 * that land afterwards fade in, so opening a finished step is instant while a
 * running one keeps writing itself. The view follows the last line as it grows,
 * and stops following the moment the reader scrolls up.
 */
function Console({
  lines,
  revealed,
  running,
  failed,
  maxHeight,
  animate,
  scale,
}: {
  lines: string[]
  revealed: number
  running: boolean
  failed: boolean
  maxHeight: string
  animate: boolean
  scale: (typeof SIZES)[keyof typeof SIZES]
}) {
  const viewport = React.useRef<HTMLDivElement>(null)
  /* Whatever was already written when this panel opened. */
  const [base] = React.useState(revealed)
  const visible = lines.slice(0, revealed)

  React.useEffect(() => {
    const node = viewport.current
    if (!node) return
    /* Only chase the bottom while the reader is already there. */
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight
    if (distance < 48) node.scrollTop = node.scrollHeight
  }, [revealed])

  return (
    <div
      ref={viewport}
      className={cn(
        "overflow-y-auto rounded-soft-sm border border-border/70 px-3 py-2.5",
        "font-mono leading-relaxed whitespace-pre-wrap",
        failed ? "text-critical" : "text-muted-foreground",
        scale.console
      )}
      style={{ background: CONSOLE, maxHeight }}
    >
      {visible.map((line, index) => (
        <motion.span
          key={index}
          className="block"
          initial={index < base || !animate ? false : { opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: EASE }}
        >
          {line || " "}
          {running && index === visible.length - 1 ? (
            <Caret animate={animate} />
          ) : null}
        </motion.span>
      ))}

      {running && visible.length === 0 ? <Caret animate={animate} /> : null}
    </div>
  )
}

/** The block that says the tool has not finished talking. */
function Caret({ animate }: { animate: boolean }) {
  return (
    <motion.span
      aria-hidden="true"
      className="ml-px inline-block h-[1.05em] w-[0.45em] translate-y-[0.2em] bg-current align-baseline"
      animate={animate ? { opacity: [1, 1, 0, 0] } : { opacity: 1 }}
      transition={
        animate
          ? { duration: 1.05, times: [0, 0.49, 0.5, 1], repeat: Infinity, ease: "linear" }
          : { duration: 0 }
      }
    />
  )
}

/**
 * Cross-fades whatever it wraps whenever `token` changes, and stays perfectly
 * still otherwise — including on mount, which is what keeps a freshly rendered
 * trace from performing.
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
  animate,
  className,
  pipClassName,
}: {
  state: ToolTraceStepState
  animate: boolean
  className?: string
  pipClassName?: string
}) {
  if (state === "done") {
    return <Check aria-hidden="true" className={cn("shrink-0", className)} />
  }
  if (state === "failed") {
    return <X aria-hidden="true" className={cn("shrink-0", className)} />
  }
  if (state === "skipped") {
    return <Minus aria-hidden="true" className={cn("shrink-0", className)} />
  }
  if (state === "running") {
    return (
      <motion.span
        aria-hidden="true"
        className={cn("flex shrink-0 items-center justify-center", className)}
        animate={animate ? { rotate: 360 } : { rotate: 0 }}
        transition={
          animate
            ? { duration: 1.1, repeat: Infinity, ease: "linear" }
            : { duration: 0 }
        }
      >
        <LoaderCircle className="size-full" />
      </motion.span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn("shrink-0 rounded-full bg-border", pipClassName)}
    />
  )
}

/**
 * Which drawing a state uses. Two states that share a glyph share a key, so
 * moving between them recolours in place instead of swapping like for like.
 */
function glyphKey(state: ToolTraceStepState): string {
  if (state === "done") return "check"
  if (state === "failed") return "cross"
  if (state === "skipped") return "dash"
  if (state === "running") return "spinner"
  return "pip"
}

/**
 * How many lines of output are on screen.
 *
 * Driven by the frame clock rather than by an interval, so the console fills at
 * the same rate on a slow tab as on a fast one and the step re-renders only
 * when a line actually lands. A step that is not streaming is simply whole —
 * no state, and no first frame.
 */
function useRevealedCount(total: number, active: boolean, speed: number): number {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!active) return

    let frame = 0
    let start = 0
    const step = (now: number) => {
      if (!start) start = now
      const next = Math.min(total, Math.floor((now - start) / Math.max(16, speed)) + 1)
      setCount((current) => (current === next ? current : next))
      if (next < total) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [active, speed, total])

  return active ? Math.min(count, total) : total
}

/** Rolls the steps up into the single state the header chip reports. */
function summarise(steps: Array<{ state: ToolTraceStepState }>): {
  state: ToolTraceStepState
  label: string
} {
  if (steps.some((step) => step.state === "running")) {
    return { state: "running", label: STATE_LABEL.running }
  }
  if (steps.some((step) => step.state === "failed")) {
    return { state: "failed", label: STATE_LABEL.failed }
  }
  if (
    steps.length > 0 &&
    steps.every((step) => step.state === "done" || step.state === "skipped")
  ) {
    return { state: "done", label: STATE_LABEL.done }
  }
  return { state: "pending", label: STATE_LABEL.pending }
}
