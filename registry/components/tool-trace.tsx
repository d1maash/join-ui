"use client"

import * as React from "react"
import { Check, ChevronRight, Minus, X } from "lucide-react"
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
  /** Trailing meta, set with tabular figures — a duration, a token count. */
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
 * `tile` is the marker's fill. The step in flight is the one solid shape in
 * the list; everything that has happened, or has yet to, sits on a tint of
 * its own hue — the same rule the header chip follows.
 */
const TONES: Record<
  ToolTraceStepState,
  { tile: string; ink: string; name: string; chip: string }
> = {
  pending: {
    tile: "bg-muted",
    ink: "text-muted-foreground",
    name: "text-muted-foreground",
    chip: "bg-muted text-muted-foreground",
  },
  running: {
    tile: "bg-info",
    ink: "text-info-foreground",
    name: "text-foreground",
    chip: "bg-info-soft text-info",
  },
  done: {
    tile: "bg-positive-soft",
    ink: "text-positive",
    name: "text-foreground",
    chip: "bg-positive-soft text-positive",
  },
  failed: {
    tile: "bg-critical-soft",
    ink: "text-critical",
    name: "text-critical",
    chip: "bg-critical-soft text-critical",
  },
  skipped: {
    tile: "bg-muted/60",
    ink: "text-muted-foreground/70",
    name: "text-muted-foreground/70",
    chip: "bg-muted text-muted-foreground",
  },
}

/** The colour the rail takes once the step above it has resolved. */
const TRAIL_FILL = "bg-positive/55"
const TRAIL_FAILED = "bg-critical/50"

/**
 * The console surface.
 *
 * A wash of the theme's own ink over whatever is behind it, which is the one
 * formulation that survives both themes: a few percent of near-black on white
 * reads as a recessed well, and the same of near-white on graphite reads as the
 * same thing. A literal grey would work in exactly one of them.
 */
const CONSOLE =
  "var(--tool-trace-console, color-mix(in oklab, var(--foreground) 4%, transparent))"

/*
 * The hairline. A separator is a whisper of the border colour, not the border
 * itself, so a list of eight rows does not read as a table.
 */
const HAIRLINE = "bg-border/70"

/*
 * The motion vocabulary.
 *
 * Which of these a move gets is decided by one question: can anything
 * countermand it half way through? A rail drawing down its lane cannot — it is
 * a finished statement, it takes the time it takes — so it is a tween on the
 * system's own deceleration curve. A tile blooming, a glyph landing, a chevron
 * turning: all of those can be overtaken by the next state or the next click a
 * fraction of a second later, and a spring carries the velocity it already had
 * into the new target, which is the difference between a trace that stutters
 * through a fast sequence and one that flows through it.
 */
const EASE = [0.32, 0.72, 0, 1] as const
const TILE = { type: "spring", visualDuration: 0.38, bounce: 0.18 } as const
const GLYPH = { type: "spring", visualDuration: 0.3, bounce: 0.3 } as const
const CHEVRON = { type: "spring", visualDuration: 0.32, bounce: 0.12 } as const

/*
 * A step resolving is three events, and they used to be one flash. The rail
 * waits a beat so the marker above it has visibly turned before the line
 * leaves it, which is enough to make the order legible without making the
 * whole thing feel slow.
 */
const TRAIL_DELAY = 0.1

/*
 * The two scales.
 *
 * `row`, `lead` and `reach` are one calculation rather than three settings.
 * Every row is the same fixed height, so the marker — which sits in a column
 * of its own — is centred against it by hand:
 *
 *   lead  = (row - marker) / 2
 *   reach = lead - gap
 *
 * The rail starts `gap` below its marker and runs `reach` past the bottom of
 * its own item, so it stops exactly `gap` short of the next marker however
 * tall the item has grown with its panel open.
 */
const SIZES = {
  sm: {
    marker: "size-6",
    glyph: "size-3",
    pip: "size-1.5",
    name: "text-[0.8125rem] leading-4",
    summary: "text-xs leading-4",
    meta: "text-xs",
    detail: "text-[0.8125rem] leading-[1.125rem]",
    console: "text-[0.6875rem]",
    row: "h-12",
    lead: "pt-3",
    reach: "-mb-2",
    columnGap: "gap-3",
    inset: "pl-3.5",
    trailing: "pr-3.5",
    rowTrailing: "mr-1.5 pr-2",
    header: "px-3.5 pt-3.5 pb-1",
    title: "text-[0.9375rem] leading-5 tracking-[-0.016em]",
    chip: "h-6 gap-1 px-2 text-xs",
    chipGlyph: "size-3",
    chipPip: "size-1.5",
    panel: "pb-3",
    footer: "px-3.5 py-3",
  },
  md: {
    marker: "size-7",
    glyph: "size-3.5",
    pip: "size-1.5",
    name: "text-sm leading-[1.125rem]",
    summary: "text-[0.8125rem] leading-4",
    meta: "text-[0.8125rem]",
    detail: "text-sm leading-5",
    console: "text-xs",
    row: "h-14",
    lead: "pt-3.5",
    reach: "-mb-2.5",
    columnGap: "gap-3.5",
    inset: "pl-4",
    trailing: "pr-4",
    rowTrailing: "mr-2 pr-2",
    header: "px-4 pt-4 pb-1",
    title: "text-[1.0625rem] leading-[1.375rem] tracking-[-0.022em]",
    chip: "h-7 gap-1.5 px-2.5 text-[0.8125rem]",
    chipGlyph: "size-3.5",
    chipPip: "size-1.5",
    panel: "pb-3.5",
    footer: "px-4 py-3",
  },
} as const

type Scale = (typeof SIZES)[keyof typeof SIZES]

export interface ToolTraceProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> {
  steps: ToolTraceStep[]
  /** Header title, and the accessible name of the list. */
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
 * At rest it is a still list — a column of rounded tiles joined by a rail,
 * each row a tool and its arguments, separated by hairlines inset to the text.
 * The motion is spent on the one thing worth showing: the step in flight. Its
 * tile turns solid, it opens itself as it starts, writes its output into the
 * console a line at a time, and folds away again the moment it resolves,
 * handing the rail down to the next step. Everything above it goes still.
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
        "flex w-full flex-col font-sans text-foreground",
        chrome && "rounded-soft-lg border border-border/60 bg-card",
        className
      )}
      {...props}
    >
      {showHeader ? (
        <div className={cn("flex items-center gap-3", chrome ? scale.header : "pb-2")}>
          <span
            id={labelId}
            className={cn("min-w-0 flex-1 truncate font-semibold", scale.title)}
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
                animate={animate}
                className={scale.chipGlyph}
                pipClassName={cn("bg-current opacity-60", scale.chipPip)}
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
        onKeyDown={handleKeyDown}
        className={cn(
          "flex flex-1 flex-col",
          chrome && scale.inset,
          chrome && (showHeader ? "pb-1" : "py-1")
        )}
      >
        {resolved.map((step, index) => (
          <Step
            key={step.id}
            step={step}
            first={index === 0}
            last={index === resolved.length - 1}
            open={open.includes(step.id)}
            onToggle={toggle}
            register={(node) => {
              buttons.current[index] = node
            }}
            stream={stream}
            lineSpeed={lineSpeed}
            maxConsoleHeight={maxConsoleHeight}
            inset={chrome}
            animate={animate}
            scale={scale}
          />
        ))}
      </ol>

      {footer ? (
        <div className={cn(chrome ? "relative" : "pt-3", chrome && scale.footer)}>
          {chrome ? (
            <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-px", HAIRLINE)} />
          ) : null}
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
 * One tool call: the tile and the rail on the left, the row and whatever it
 * hides on the right.
 *
 * A step with neither `detail` nor `output` renders as a plain row rather than
 * as a button that opens onto nothing, which is what keeps the tab order down
 * to the steps that actually have something to show.
 */
function Step({
  step,
  first,
  last,
  open,
  onToggle,
  register,
  stream,
  lineSpeed,
  maxConsoleHeight,
  inset,
  animate,
  scale,
}: {
  step: ToolTraceStep & { state: ToolTraceStepState }
  first: boolean
  last: boolean
  open: boolean
  onToggle: (id: string) => void
  register: (node: HTMLButtonElement | null) => void
  stream: boolean
  lineSpeed: number
  maxConsoleHeight: string
  /** Inside the card: separators run to its edge, so the row pads itself. */
  inset: boolean
  animate: boolean
  scale: Scale
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

  /*
   * Title over subtitle, the way a list cell sets them. The whitespace between
   * the two spans is dropped by the flex layout but kept in the text, so the
   * button's accessible name still reads "read_file lib/…, Done".
   */
  const row = (
    <>
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <span
          className={cn(
            "truncate font-mono font-medium tracking-[-0.01em]",
            "transition-colors duration-[var(--duration-base,200ms)] ease-[var(--ease-out-soft,ease-out)]",
            scale.name,
            tone.name,
            step.state === "skipped" && "line-through decoration-muted-foreground/40"
          )}
        >
          {step.name}
        </span>{" "}
        {step.summary ? (
          <span className={cn("truncate text-muted-foreground", scale.summary)}>
            {step.summary}
          </span>
        ) : null}
        <span className="sr-only">{`, ${STATE_LABEL[step.state]}`}</span>
      </span>

      {step.meta ? (
        <span className={cn("shrink-0 text-muted-foreground tabular-nums", scale.meta)}>
          {step.meta}
        </span>
      ) : null}

      {expandable ? (
        <motion.span
          aria-hidden="true"
          className="flex shrink-0 items-center text-muted-foreground/60"
          animate={{ rotate: open ? 90 : 0 }}
          initial={false}
          /*
           * Sprung, because this is the one thing in the component a reader can
           * hammer. Clicking a step twice inside a fifth of a second with a
           * tween on the chevron plays the second turn from wherever the first
           * had got to and takes the full duration to do it, so the arrow
           * visibly falls behind the panel it is describing.
           */
          transition={animate ? CHEVRON : { duration: 0 }}
        >
          <ChevronRight className="size-3.5" strokeWidth={2.75} />
        </motion.span>
      ) : null}
    </>
  )

  return (
    <li
      aria-current={step.state === "running" ? "step" : undefined}
      className={cn("flex min-w-0 items-stretch", scale.columnGap)}
    >
      {/* `lead` drops the tile onto the centre of the fixed-height row. */}
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
            className={scale.reach}
            animate={animate}
          />
        ) : null}
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* The separator, inset to the text the way a grouped list sets it. */}
        {!first ? (
          <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-px", HAIRLINE)} />
        ) : null}

        {expandable ? (
          <button
            type="button"
            id={buttonId}
            ref={register}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => onToggle(step.id)}
            className={cn(
              "-ml-2 flex cursor-pointer items-center gap-2.5 rounded-soft pl-2 text-left",
              "transition-colors duration-[var(--duration-fast,140ms)] ease-[var(--ease-out-soft,ease-out)]",
              "hover:bg-muted/50 active:bg-muted",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
              inset ? scale.rowTrailing : "-mr-2 pr-2",
              scale.row
            )}
          >
            {row}
          </button>
        ) : (
          <div
            className={cn(
              "flex items-center gap-2.5",
              inset && scale.trailing,
              scale.row
            )}
          >
            {row}
          </div>
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
              /*
               * Opening and closing are not each other's reverse. On the way
               * out the panel is a shape being folded away, so the height is
               * the whole move and it goes quickly; on the way in the content
               * waits two frames behind the box, which is what stops a console
               * from appearing to be squeezed out of a slot. Height stays a
               * tween in both directions — it is the one property here that
               * must land exactly on `auto`, and a spring's overshoot past
               * `auto` is a panel that visibly bounces open.
               */
              exit={{
                height: 0,
                opacity: 0,
                transition: animate
                  ? {
                      height: { duration: 0.26, ease: EASE },
                      opacity: { duration: 0.12, ease: "linear" },
                    }
                  : { duration: 0 },
              }}
              transition={
                animate
                  ? {
                      height: { duration: 0.38, ease: EASE },
                      opacity: { duration: 0.24, ease: EASE, delay: 0.06 },
                    }
                  : { duration: 0 }
              }
            >
              <motion.div
                className={cn("flex flex-col gap-2.5", scale.panel, inset && scale.trailing)}
                /*
                 * The contents rise the last few pixels into place rather than
                 * arriving where the box left them. Held on its own element so
                 * the panel measuring itself for `height: auto` never has a
                 * transform of its own to measure around.
                 */
                initial={animate ? { y: -6 } : false}
                animate={{ y: 0 }}
                transition={animate ? { duration: 0.4, ease: EASE } : { duration: 0 }}
              >
                {step.detail ? (
                  <div className={cn("text-muted-foreground", scale.detail)}>
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
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </li>
  )
}

/**
 * The tile. Its fill is a separate absolutely-positioned layer keyed on the
 * state, so resolving cross-fades one whole tile into the next — the old fill
 * swells away as the new one blooms up from the centre — rather than snapping
 * a colour. `initial={false}` keeps all of that off the first paint.
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
        "transition-colors duration-[var(--duration-base,200ms)] ease-[var(--ease-out-soft,ease-out)]",
        sizeClassName,
        tone.ink
      )}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={state}
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-0 rounded-soft-sm", tone.tile)}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.12 }}
          /*
           * Split, because the two properties are doing different jobs. The
           * scale is the move and wants the spring's carry; the opacity is only
           * the handover between the outgoing fill and the incoming one, and a
           * spring settling asymptotically towards zero would hold a tile that
           * has finished swelling on screen at 2% for as long again.
           */
          transition={
            animate
              ? { scale: TILE, opacity: { duration: 0.22, ease: EASE } }
              : { duration: 0 }
          }
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
            className="pointer-events-none absolute inset-0 rounded-soft-sm bg-info"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0, 0.28, 0], scale: [1, 1.5, 1.6] }}
            exit={{ opacity: 0 }}
            /*
             * A breath, then a rest, rather than a continuous throb. The halo
             * takes a tenth of the cycle to come up and the rest of it to
             * spread out and go, and `repeatDelay` leaves a still tile before
             * the next one — which is what makes this read as a pulse with a
             * rate rather than as something merely flickering.
             */
            transition={{
              duration: 1.4,
              times: [0, 0.12, 1],
              repeat: Infinity,
              repeatDelay: 0.4,
              ease: EASE,
            }}
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
            pipClassName={cn("bg-current opacity-50", pipClassName)}
          />
        </Swap>
      )}
    </span>
  )
}

/**
 * The rail between two tiles: a static track with a tinted overlay that draws
 * downward the instant the step above it resolves. It stretches with the item,
 * so a step that opens carries the rail past its own console.
 */
function Trail({
  state,
  className,
  animate,
}: {
  state: ToolTraceStepState
  className?: string
  animate: boolean
}) {
  const filled = state === "done" || state === "failed" || state === "skipped"

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative mt-1 min-h-2 w-0.5 flex-1 overflow-hidden rounded-full bg-border/70",
        className
      )}
    >
      <motion.span
        className={cn(
          "absolute inset-0 rounded-full",
          state === "failed" ? TRAIL_FAILED : TRAIL_FILL
        )}
        style={{ transformOrigin: "center top" }}
        initial={false}
        animate={{ scaleY: filled ? 1 : 0 }}
        /*
         * Delayed on the way down only. Filling waits a beat so the tile above
         * has visibly resolved before the line leaves it; emptying — which only
         * happens when a trace is reset — has nothing to wait for, and a lag
         * there just reads as the component being slow.
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
  scale: Scale
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
        "overflow-y-auto rounded-soft px-3.5 py-3",
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
          /*
           * In from the left rather than down from above. A line of output is
           * written, not dropped in: the couple of pixels it travels are the
           * direction the text itself runs, which is the difference between a
           * console filling up and a list receiving an item.
           */
          initial={index < base || !animate ? false : { opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.24, ease: EASE }}
        >
          {line || " "}
          {running && index === visible.length - 1 ? (
            <Caret animate={animate} />
          ) : null}
        </motion.span>
      ))}

      {running && visible.length === 0 ? <Caret animate={animate} /> : null}
    </div>
  )
}

/** The insertion point that says the tool has not finished talking. */
function Caret({ animate }: { animate: boolean }) {
  return (
    <motion.span
      aria-hidden="true"
      className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.2em] rounded-full bg-info align-baseline"
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
 * Swaps whatever it wraps whenever `token` changes, and stays perfectly still
 * otherwise — including on mount, which is what keeps a freshly rendered trace
 * from performing.
 *
 * The way a symbol replaces another: the outgoing glyph shrinks and softens
 * out of focus, the incoming one arrives from below on a loose spring, so a
 * tick landing in a finished step has a fraction of overshoot on it — the
 * whole difference between a mark being placed and two images being dissolved
 * into each other.
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
         * tile between the two.
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
    return <Check aria-hidden="true" strokeWidth={3} className={cn("shrink-0", className)} />
  }
  if (state === "failed") {
    return <X aria-hidden="true" strokeWidth={3} className={cn("shrink-0", className)} />
  }
  if (state === "skipped") {
    return <Minus aria-hidden="true" strokeWidth={3} className={cn("shrink-0", className)} />
  }
  if (state === "running") {
    return <ActivityIndicator animate={animate} className={className} />
  }
  return <span aria-hidden="true" className={cn("shrink-0 rounded-full", pipClassName)} />
}

/*
 * Eight spokes, each a little fainter than the one ahead of it, turned an
 * eighth at a time — the system's own activity indicator rather than a ring
 * spinning smoothly. Under reduced motion it holds still and still reads as
 * "working".
 */
const SPOKES = Array.from({ length: 8 }, (_, index) => index)
const TICK = (progress: number) => Math.floor(progress * 8) / 8

function ActivityIndicator({
  animate,
  className,
}: {
  animate: boolean
  className?: string
}) {
  return (
    <motion.span
      aria-hidden="true"
      className={cn("flex shrink-0 items-center justify-center", className)}
      animate={animate ? { rotate: 360 } : { rotate: 0 }}
      transition={
        animate ? { duration: 0.9, repeat: Infinity, ease: TICK } : { duration: 0 }
      }
    >
      <svg viewBox="0 0 24 24" className="size-full" fill="none">
        {SPOKES.map((index) => (
          <line
            key={index}
            x1="12"
            y1="2.5"
            x2="12"
            y2="7.5"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinecap="round"
            opacity={1 - index * 0.11}
            transform={`rotate(${-index * 45} 12 12)`}
          />
        ))}
      </svg>
    </motion.span>
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
