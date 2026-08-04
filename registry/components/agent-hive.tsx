"use client"

import * as React from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react"

import { cn } from "@/lib/utils"

export type AgentHiveRunState = "queued" | "working" | "done" | "failed"

export interface AgentHiveModel {
  /** Stable identity, and the value reported by `onValueChange`. */
  id: string
  label: string
  /** Second line under the comb while the model holds the selection. */
  description?: string
  /** Drawn inside the cell. Sized by the component, so pass a bare icon. */
  icon?: React.ReactNode
  /** Any CSS colour. Fills the cell it holds, the action, and its runs. */
  accent?: string
  disabled?: boolean
}

export interface AgentHiveRun {
  /** Stable identity for the rendered list item. */
  id: string
  /** The line of work. Typed out when the run arrives after mount. */
  prompt: string
  state?: AgentHiveRunState
  /** Overrides the status word on the right of the row. */
  status?: string
  /** Ties the run to a model, which lends the row its accent. */
  modelId?: string
}

/**
 * The colour a glyph takes on a filled cell. Held as a fallback rather than a
 * literal so a consumer whose accents are pale can redeclare it once, in CSS,
 * instead of threading a second colour through every model.
 */
const ON_ACCENT = "var(--agent-hive-glyph, oklch(0.985 0.002 90))"

/** Spelled out beside the pip, so the state never rests on hue alone. */
const RUN_LABEL: Record<AgentHiveRunState, string> = {
  queued: "Queued",
  working: "Working",
  done: "Done",
  failed: "Failed",
}

/**
 * One hue per run state, taken from the component palette rather than a literal
 * colour, so a consumer can retint the whole family in `globals.css`.
 */
const RUN_TONE: Record<AgentHiveRunState, { pip: string; ink: string; prompt: string }> = {
  queued: {
    pip: "bg-muted-foreground/40",
    ink: "text-muted-foreground",
    prompt: "text-foreground",
  },
  working: { pip: "bg-caution", ink: "text-foreground", prompt: "text-foreground" },
  done: { pip: "bg-positive", ink: "text-muted-foreground", prompt: "text-muted-foreground" },
  failed: { pip: "bg-critical", ink: "text-critical", prompt: "text-muted-foreground" },
}

/**
 * A hexagon, as six points in a 100-unit-wide box.
 *
 * Flat top and bottom, points left and right: a row of comb stacks vertically on
 * those flat edges, and the half-cell offset between rows is what makes the
 * whole thing read as a honeycomb rather than as a grid of tiles. `sqrt(3) / 2`
 * is the height that keeps all six sides the same length.
 */
const HEX_RATIO = Math.sqrt(3) / 2
const HEX_H = 100 * HEX_RATIO
const HEX_PATH = roundedPolygon(
  [
    [25, 0],
    [75, 0],
    [100, HEX_H / 2],
    [75, HEX_H],
    [25, HEX_H],
    [0, HEX_H / 2],
  ],
  12
)

/**
 * Geometry is carried in pixels, not in classes, because the comb positions
 * every cell itself — the width of the frame, the offset of a short row and the
 * lane the plumb line travels along are all arithmetic on the cell size, and
 * none of it survives being expressed as a utility.
 */
const SIZES = {
  sm: {
    frame: "max-w-xs",
    pad: "p-4",
    cell: 50,
    gapX: 7,
    gapY: 2.5,
    line: 26,
    pip: 11,
    glyph: "size-4",
    action: "h-9 px-6 text-[0.8125rem]",
    name: "text-[0.8125rem]",
    row: "gap-2.5 py-2.5",
    prompt: "text-[0.75rem]",
    status: "text-[0.6875rem]",
  },
  md: {
    frame: "max-w-sm",
    pad: "p-5",
    cell: 62,
    gapX: 8,
    gapY: 3,
    line: 32,
    pip: 13,
    glyph: "size-5",
    action: "h-10 px-7 text-sm",
    name: "text-sm",
    row: "gap-3 py-3",
    prompt: "text-[0.8125rem]",
    status: "text-xs",
  },
} as const

/** Widths of the comb's rows. Three, four, three: a hexagon of hexagons. */
const DEFAULT_COMB = [3, 4, 3]

const SPRING = { type: "spring", stiffness: 380, damping: 30, mass: 0.7 } as const
/**
 * The fill crossing the comb. Slower than a press on purpose: at spring speed
 * the shape arrives before the eye has found it, and the move has to be legible
 * as a move — it is the only thing telling you where the selection went.
 */
const TRAVEL = { type: "spring", stiffness: 210, damping: 24, mass: 0.9 } as const
/** Looser again, and underdamped — this one is a weight on a thread. */
const PLUMB = { type: "spring", stiffness: 150, damping: 16, mass: 0.9 } as const
const EASE = [0.22, 1, 0.36, 1] as const

export interface AgentHiveProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "defaultValue"> {
  /** The models to lay into the comb, from the middle outwards. */
  models: AgentHiveModel[]
  /** Controlled selection. Leave unset to let the component hold it. */
  value?: string
  /** Where an uncontrolled comb starts. Defaults to the first enabled model. */
  defaultValue?: string
  onValueChange?: (id: string) => void
  /** The queue below the action. Owned by you, so it can be anything. */
  runs?: AgentHiveRun[]
  /** Fires with the selected model when the action is pressed. */
  onGenerate?: (model: AgentHiveModel) => void
  actionLabel?: string
  /** Overrides the busy state, which is otherwise read off the runs. */
  busy?: boolean
  disabled?: boolean
  /** Widths of the comb's rows. Grown automatically when the models overflow. */
  comb?: number[]
  size?: "sm" | "md"
  /** The plumb line that hangs over the selected cell. */
  arm?: boolean
  /** Rows drawn before the queue fades out. */
  maxRuns?: number
  /** Type each arriving run out a character at a time. */
  typing?: boolean
  /** Milliseconds per character. */
  typeSpeed?: number
  /** Shown in place of the queue while there is nothing in it. */
  emptyLabel?: string
  /** Accessible name of the comb. */
  label?: string
  /** Plain drops the surrounding rule, background and padding. */
  variant?: "card" | "plain"
}

/**
 * A honeycomb of models, one action, and the queue of runs it produces.
 *
 * Everything is drawn with as little ink as the state allows. Empty comb is a
 * faint fill and nothing else, a model is a hairline outline, and the selection
 * is the only solid shape on the component — one filled hexagon that slides
 * across the comb from the cell it left to the cell it was sent to, cross-fading
 * its colour on the way, with a plumb line swinging above it. There is no
 * shadow, no chip, no second border: the state is carried by fill and by
 * movement, which is also what makes it survive being dropped into a theme it
 * has never seen.
 *
 * The queue is yours. `onGenerate` hands you the model that was picked and the
 * component renders whatever list you pass back, typing out the prompt of any
 * run that arrives after mount and leaving the ones that were already there
 * alone — history should not retype itself every time the page loads.
 */
export function AgentHive({
  models,
  value,
  defaultValue,
  onValueChange,
  runs = [],
  onGenerate,
  actionLabel = "Generate",
  busy,
  disabled = false,
  comb = DEFAULT_COMB,
  size = "md",
  arm = true,
  maxRuns = 3,
  typing = true,
  typeSpeed = 26,
  emptyLabel = "Nothing queued.",
  label = "Model",
  variant = "card",
  className,
  ...props
}: AgentHiveProps) {
  const scale = SIZES[size]
  const reduceMotion = useReducedMotion()
  const cellRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})

  const firstEnabled = models.find((model) => !model.disabled)
  const [internal, setInternal] = React.useState(defaultValue)
  const selectedId = value !== undefined ? value : (internal ?? firstEnabled?.id)
  const selected = models.find((model) => model.id === selectedId)

  const select = React.useCallback(
    (id: string) => {
      if (value === undefined) setInternal(id)
      onValueChange?.(id)
    },
    [onValueChange, value]
  )

  /*
   * The comb, resolved to pixels. Rows are centred on each other, so a row one
   * cell shorter than its neighbour sits half a cell in from either side, which
   * is the offset the honeycomb is made of.
   */
  const layout = React.useMemo(() => {
    const rows = growComb(comb, models.length)
    const cellW = scale.cell
    const cellH = cellW * HEX_RATIO
    const stepX = cellW + scale.gapX
    const stepY = cellH + scale.gapY
    const width = Math.max(...rows) * stepX - scale.gapX
    const height = rows.length * stepY - scale.gapY

    const slots = rows.flatMap((count, row) => {
      const left = (width - (count * stepX - scale.gapX)) / 2
      return Array.from({ length: count }, (_, col) => {
        const x = left + col * stepX
        const y = row * stepY
        return { x, y, cx: x + cellW / 2 }
      })
    })

    /*
     * Models fill the comb from the middle outwards, so the hive keeps its
     * centre of gravity whatever it is given: four models land in the four
     * innermost cells, and the rim stays as empty comb around them.
     *
     * The distance is rounded before it is sorted on. A comb is symmetrical, so
     * the cell above the middle and the cell below it are exactly as far out as
     * each other — and left in floating point, "exactly" is decided by rounding
     * error rather than by the tie-break, which is what puts a pair of models in
     * the bottom row of one hive and the top row of the next.
     */
    const centred = slots
      .map((slot, index) => ({
        index,
        rank: Math.round(
          Math.hypot(slot.cx - width / 2, slot.y + cellH / 2 - height / 2) * 100
        ),
      }))
      .sort((a, b) => a.rank - b.rank || a.index - b.index)
      .slice(0, models.length)

    const filled = new Map<number, number>()
    centred.forEach((slot, modelIndex) => filled.set(slot.index, modelIndex))

    /* Visual order — the order the arrow keys walk, not the order of `models`. */
    const order = slots
      .map((_, index) => filled.get(index))
      .filter((modelIndex): modelIndex is number => modelIndex !== undefined)

    return { cellW, cellH, width, height, slots, filled, order }
  }, [comb, models.length, scale])

  /* Where the fill currently sits, and where the plumb line hangs from. */
  const home = React.useMemo(() => {
    for (const [slotIndex, modelIndex] of layout.filled) {
      if (models[modelIndex]?.id === selectedId) return layout.slots[slotIndex]
    }
    return undefined
  }, [layout, models, selectedId])

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const walk = layout.order
      .map((modelIndex) => models[modelIndex])
      .filter((model): model is AgentHiveModel => model !== undefined && !model.disabled)
    if (walk.length === 0) return

    const at = walk.findIndex((model) => model.id === selectedId)
    let next: number | null = null
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = at + 1
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = at - 1
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = walk.length - 1
    if (next === null) return

    event.preventDefault()
    const target = walk[(next + walk.length) % walk.length]
    if (!target) return
    select(target.id)
    cellRefs.current[target.id]?.focus()
  }

  const running = busy ?? runs.some((run) => (run.state ?? "queued") === "working")
  const canGenerate = !disabled && Boolean(selected) && !selected?.disabled

  /*
   * The queue as it stood at mount. Everything in it is history and renders
   * whole; everything that arrives afterwards is new, and types itself out.
   */
  const [history] = React.useState(() => new Set(runs.map((run) => run.id)))

  const visible = runs.slice(0, Math.max(1, maxRuns))
  const overflowing = runs.length > visible.length

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full flex-col",
        scale.frame,
        variant === "card" && cn("rounded-3xl border border-border bg-card", scale.pad),
        className
      )}
      aria-busy={running || undefined}
      {...props}
    >
      {arm ? (
        <Plumb
          width={layout.width}
          height={scale.line}
          x={home ? home.cx : layout.width / 2}
          visible={Boolean(home)}
          still={Boolean(reduceMotion)}
        />
      ) : null}

      <div
        role="radiogroup"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className="relative mx-auto"
        style={{ width: layout.width, height: layout.height }}
      >
        {/* Empty comb: a fill and nothing else, so the rim reads as material. */}
        {layout.slots.map((slot, index) =>
          layout.filled.has(index) ? null : (
            <div
              key={`empty-${index}`}
              aria-hidden="true"
              className="absolute"
              style={{
                left: slot.x,
                top: slot.y,
                width: layout.cellW,
                height: layout.cellH,
              }}
            >
              <Hex className="fill-border/40" />
            </div>
          )
        )}

        {/*
         * The selection, as one shape.
         *
         * It is drawn once and moved, rather than faded out of one cell and into
         * the next, which is the whole difference between a component that
         * switches and one that travels. The fill cross-fades on the way, so a
         * hop between two accents is a single continuous move.
         */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0"
          style={{ width: layout.cellW, height: layout.cellH }}
          initial={false}
          animate={{
            x: home?.x ?? 0,
            y: home?.y ?? 0,
            opacity: home ? 1 : 0,
            scale: home ? 1 : 0.8,
          }}
          transition={reduceMotion ? { duration: 0 } : TRAVEL}
        >
          <Hex
            className={cn(
              "transition-[fill] duration-300",
              selected?.accent ? undefined : "fill-primary"
            )}
            style={selected?.accent ? { fill: selected.accent } : undefined}
          />
        </motion.div>

        {layout.slots.map((slot, index) => {
          const modelIndex = layout.filled.get(index)
          const model = modelIndex === undefined ? undefined : models[modelIndex]
          if (!model) return null

          const active = model.id === selectedId
          return (
            <motion.button
              key={model.id}
              ref={(node) => {
                cellRefs.current[model.id] = node
              }}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={model.label}
              disabled={disabled || model.disabled}
              /* Roving tabindex: the comb is one tab stop, the arrows move inside it. */
              tabIndex={active ? 0 : -1}
              onClick={() => select(model.id)}
              className={cn(
                "group absolute grid place-items-center",
                "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40",
                !disabled && !model.disabled && "cursor-pointer"
              )}
              style={{
                left: slot.x,
                top: slot.y,
                width: layout.cellW,
                height: layout.cellH,
              }}
              whileTap={reduceMotion || disabled ? undefined : { scale: 0.94 }}
              transition={SPRING}
            >
              {/*
               * A hairline outline over nothing: the cell has to stay
               * transparent for the travelling fill to show through it from
               * below, which is also why the outline fades out as it arrives.
               */}
              <Hex
                className={cn(
                  "fill-none transition-[stroke] duration-300",
                  active
                    ? "stroke-transparent"
                    : "stroke-border-hover group-hover:stroke-border-strong"
                )}
              />
              {/* A hex-shaped focus ring — an outline would draw the box instead. */}
              <Hex
                className="fill-none stroke-ring opacity-0 group-focus-visible:opacity-100"
                strokeWidth={2}
              />
              <motion.span
                aria-hidden="true"
                className={cn(
                  "relative grid place-items-center transition-colors duration-300 [&_svg]:size-full",
                  scale.glyph,
                  /*
                   * An accent is a literal colour, so the glyph over it takes
                   * the one overridable near-white. Without one the cell fills
                   * with ink instead, and ink has a paired foreground — which
                   * is the only thing that survives the dark theme, where the
                   * ink is the light end of the ramp.
                   */
                  !model.accent && (active ? "text-primary-foreground" : "text-muted-foreground")
                )}
                style={
                  model.accent ? { color: active ? ON_ACCENT : model.accent } : undefined
                }
                animate={{ scale: active ? 1.08 : 1 }}
                transition={reduceMotion ? { duration: 0 } : SPRING}
              >
                {model.icon}
              </motion.span>
            </motion.button>
          )
        })}
      </div>

      {/* The selection, in words. The comb is glyphs, and glyphs are not a label. */}
      <div className="mt-4 text-center">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={selected?.id ?? "none"}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <p className={cn("font-medium text-foreground", scale.name)}>
              {selected?.label ?? " "}
            </p>
            {selected?.description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{selected.description}</p>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <Action
        accent={selected?.accent}
        busy={running}
        disabled={!canGenerate}
        label={actionLabel}
        reduceMotion={Boolean(reduceMotion)}
        scale={scale}
        onPress={() => {
          if (selected) onGenerate?.(selected)
        }}
      />

      <ol
        aria-live="polite"
        className={cn(
          "mt-5 flex list-none flex-col border-t border-border",
          /* More runs than rows: the last one dissolves rather than being cut. */
          overflowing && "[mask-image:linear-gradient(to_bottom,#000_74%,transparent)]"
        )}
      >
        <AnimatePresence initial={false}>
          {visible.map((run) => (
            <Row
              key={run.id}
              run={run}
              accent={models.find((model) => model.id === run.modelId)?.accent}
              fresh={!history.has(run.id)}
              typing={typing && !reduceMotion}
              typeSpeed={typeSpeed}
              reduceMotion={Boolean(reduceMotion)}
              scale={scale}
            />
          ))}
        </AnimatePresence>
        {runs.length === 0 ? (
          <li className="py-4 text-center text-xs text-muted-foreground">{emptyLabel}</li>
        ) : null}
      </ol>
    </div>
  )
}

/**
 * The plumb line over the selected cell.
 *
 * It tracks the cell's horizontal centre and nothing else — a cable drawn down
 * to the third row would have to cross the two rows above it — and it swings
 * while it travels. The swing is read off the line's own velocity rather than
 * scripted, so a hop to the next cell tilts it slightly and a jump across the
 * comb throws it, then it settles late, after the fill has already arrived.
 */
function Plumb({
  width,
  height,
  x,
  visible,
  still,
}: {
  width: number
  height: number
  x: number
  visible: boolean
  still: boolean
}) {
  const target = useMotionValue(x)
  React.useEffect(() => {
    target.set(x)
  }, [target, x])

  const travel = useSpring(target, PLUMB)
  const velocity = useVelocity(travel)
  const tilt = useTransform(velocity, [-900, 900], [14, -14])
  const swing = useSpring(tilt, { stiffness: 130, damping: 14, mass: 0.6 })

  return (
    <div aria-hidden="true" className="relative mx-auto" style={{ width, height }}>
      <motion.div
        className="absolute top-0 flex w-3 flex-col items-center"
        style={{
          height,
          left: -6,
          transformOrigin: "top center",
          x: still ? x : travel,
          rotate: still ? 0 : swing,
        }}
        initial={false}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2, ease: EASE }}
      >
        <span className="w-px flex-1 bg-linear-to-b from-transparent to-border-strong/80" />
        <span className="size-1.5 rounded-full bg-border-strong/80" />
      </motion.div>
    </div>
  )
}

/**
 * The action.
 *
 * Nothing surrounds it at rest. While the queue is working, a ring leaves the
 * pill every couple of seconds and fades out — one moving thing, tied to one
 * piece of state, that stops the moment the state does.
 */
function Action({
  accent,
  busy,
  disabled,
  label,
  reduceMotion,
  scale,
  onPress,
}: {
  accent?: string
  busy: boolean
  disabled: boolean
  label: string
  reduceMotion: boolean
  scale: (typeof SIZES)[keyof typeof SIZES]
  onPress: () => void
}) {
  return (
    <div className="relative mx-auto mt-4 flex">
      {busy && !reduceMotion
        ? [0, 1].map((rank) => (
            <motion.span
              key={rank}
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 rounded-full border",
                accent ? undefined : "border-primary"
              )}
              style={accent ? { borderColor: accent } : undefined}
              initial={{ scale: 1, opacity: 0.35 }}
              animate={{ scale: 1.18, opacity: 0 }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                delay: rank * 1.1,
                ease: "easeOut",
              }}
            />
          ))
        : null}

      <motion.button
        type="button"
        disabled={disabled}
        onClick={onPress}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full font-medium",
          "transition-[background-color,opacity] duration-300",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
          "disabled:cursor-not-allowed disabled:opacity-40",
          !disabled && "cursor-pointer",
          accent ? undefined : "bg-primary text-primary-foreground",
          scale.action
        )}
        style={accent ? { backgroundColor: accent, color: ON_ACCENT } : undefined}
        whileHover={reduceMotion || disabled ? undefined : { scale: 1.02 }}
        whileTap={reduceMotion || disabled ? undefined : { scale: 0.96 }}
        transition={SPRING}
      >
        {label}
      </motion.button>
    </div>
  )
}

/**
 * One run: a cell of the comb in miniature, the prompt, and where it got to.
 *
 * The prompt is rendered twice — once at full length and invisible, and once as
 * the prefix typed so far on top of it. The invisible copy is what reserves the
 * height and what a screen reader reads, announcing the line at once rather than
 * a character at a time, and it is why a row that types itself out never
 * reflows the rows below it.
 */
function Row({
  run,
  accent,
  fresh,
  typing,
  typeSpeed,
  reduceMotion,
  scale,
}: {
  run: AgentHiveRun
  accent?: string
  fresh: boolean
  typing: boolean
  typeSpeed: number
  reduceMotion: boolean
  scale: (typeof SIZES)[keyof typeof SIZES]
}) {
  const state = run.state ?? "queued"
  const tone = RUN_TONE[state]
  /* Captured at mount: a re-render must not restart, or cancel, the typing. */
  const [types] = React.useState(fresh && typing)
  const typed = useTypedLength(run.prompt, types, typeSpeed)
  const done = typed >= run.prompt.length

  return (
    <motion.li
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={reduceMotion ? { duration: 0 } : SPRING}
      className={cn("flex items-center not-first:border-t not-first:border-border", scale.row)}
    >
      {/* The model's cell in miniature — the same shape, at a twelfth the area. */}
      <span
        aria-hidden="true"
        className={cn(
          "relative block shrink-0",
          accent ? undefined : "text-muted-foreground/50"
        )}
        style={{ width: scale.pip, height: scale.pip * HEX_RATIO }}
      >
        <Hex
          className={accent ? undefined : "fill-current"}
          style={accent ? { fill: accent } : undefined}
        />
      </span>

      <span className={cn("relative min-w-0 flex-1 font-mono leading-snug", scale.prompt)}>
        <span className={cn("block select-none opacity-0", tone.prompt)}>{run.prompt}</span>
        <span aria-hidden="true" className={cn("absolute inset-0 block", tone.prompt)}>
          {run.prompt.slice(0, typed)}
          {state === "working" || !done ? (
            <motion.span
              className="ml-px inline-block h-[1.05em] w-px translate-y-[0.2em] align-baseline"
              style={{ backgroundColor: accent ?? "var(--foreground)" }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 1.05,
                      times: [0, 0.49, 0.5, 1],
                      repeat: Infinity,
                      ease: "linear",
                    }
              }
            />
          ) : null}
        </span>
      </span>

      <span
        className={cn(
          "flex shrink-0 items-center gap-1.5 transition-colors duration-500",
          scale.status,
          tone.ink
        )}
      >
        {run.status ?? RUN_LABEL[state]}
        <span className="relative grid size-1.5 place-items-center">
          <span
            className={cn("size-1.5 rounded-full transition-colors duration-500", tone.pip)}
          />
          {state === "working" && !reduceMotion ? (
            <motion.span
              className={cn("absolute inset-0 rounded-full", tone.pip)}
              animate={{ scale: [1, 2.6], opacity: [0.5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          ) : null}
        </span>
      </span>
    </motion.li>
  )
}

/** The hexagon itself, as a path rather than a `clip-path` — corners round. */
function Hex({
  className,
  style,
  strokeWidth = 1,
}: {
  className?: string
  style?: React.CSSProperties
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox={`-1 -1 102 ${HEX_H + 2}`}
      aria-hidden="true"
      className={cn("absolute inset-0 size-full", className)}
      style={style}
    >
      <path d={HEX_PATH} vectorEffect="non-scaling-stroke" strokeWidth={strokeWidth} />
    </svg>
  )
}

/**
 * How many characters of `text` are on screen.
 *
 * Driven by the frame clock rather than by an interval, so the run types at the
 * same rate on a slow tab as on a fast one and the row re-renders only when a
 * character actually lands.
 */
function useTypedLength(text: string, active: boolean, speed: number): number {
  const [length, setLength] = React.useState(0)

  React.useEffect(() => {
    if (!active) return

    let frame = 0
    let start = 0
    const step = (now: number) => {
      if (!start) start = now
      const next = Math.min(text.length, Math.floor((now - start) / Math.max(4, speed)))
      setLength((current) => (current === next ? current : next))
      if (next < text.length) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [active, speed, text])

  /* A row that is not typing is simply whole — no state, and no first frame. */
  return active ? Math.min(length, text.length) : text.length
}

/**
 * Grows the comb until every model has a cell, alternating between the widest
 * and the narrowest row it was given — which is the pattern a honeycomb is
 * already made of, so an eleventh model extends the hive rather than breaking
 * the shape of it.
 */
function growComb(pattern: number[], count: number): number[] {
  const rows = pattern.filter((width) => width > 0).map((width) => Math.floor(width))
  if (rows.length === 0) return [Math.max(1, count)]

  const wide = Math.max(...rows)
  const narrow = Math.min(...rows)
  let total = rows.reduce((sum, width) => sum + width, 0)

  while (total < count) {
    const next = rows[rows.length - 1] === wide ? narrow : wide
    rows.push(next)
    total += next
  }

  return rows
}

/**
 * A polygon with its corners cut back and joined by a curve through the vertex.
 *
 * Rounding is the whole reason the hexagon is a path: `clip-path` draws the same
 * six points with knife-sharp corners, and at this size that is the difference
 * between a cell and a caltrop.
 */
function roundedPolygon(
  points: ReadonlyArray<readonly [number, number]>,
  radius: number
): string {
  const count = points.length
  let path = ""

  for (let index = 0; index < count; index += 1) {
    const previous = points[(index - 1 + count) % count]
    const corner = points[index]
    const next = points[(index + 1) % count]
    if (!previous || !corner || !next) continue

    const [ax, ay] = towards(corner, previous, radius)
    const [bx, by] = towards(corner, next, radius)
    path += `${index === 0 ? "M" : "L"}${round(ax)} ${round(ay)}`
    path += `Q${round(corner[0])} ${round(corner[1])} ${round(bx)} ${round(by)}`
  }

  return `${path}Z`
}

/** A point `distance` along the edge from `from` towards `to`. */
function towards(
  from: readonly [number, number],
  to: readonly [number, number],
  distance: number
): [number, number] {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const length = Math.hypot(dx, dy) || 1
  const ratio = Math.min(distance, length / 2) / length
  return [from[0] + dx * ratio, from[1] + dy * ratio]
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
