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
  /** Any CSS colour. Tints the glass while the model holds the selection. */
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
 * The colour a glyph takes on tinted glass. Held as a fallback rather than a
 * literal so a consumer whose accents are pale can redeclare it once, in CSS,
 * instead of threading a second colour through every model.
 */
const ON_ACCENT = "var(--agent-hive-glyph, oklch(0.985 0.002 90))"

/**
 * The material.
 *
 * A frosted cell is a wash of the theme's own ink over whatever is behind it,
 * which is the one formulation that survives both themes: 7% of near-black on
 * paper reads as smoked glass, and 7% of near-white on charcoal reads as the
 * same thing. A literal white would work in exactly one of them.
 */
const GLASS =
  "var(--agent-hive-glass, color-mix(in oklab, var(--foreground) 7%, transparent))"
const GLASS_EMPTY =
  "var(--agent-hive-glass-empty, color-mix(in oklab, var(--foreground) 4%, transparent))"

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
  done: {
    pip: "bg-positive",
    ink: "text-muted-foreground",
    prompt: "text-muted-foreground",
  },
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
/** Corner radius as a fraction of the width, shared by the outline and the clip. */
const HEX_ROUND = 0.12

/**
 * Geometry is carried in pixels, not in classes, because the comb positions
 * every cell itself — the width of the frame, the offset of a short row, the
 * lane the plumb line travels along and the `clip-path` that cuts the glass are
 * all arithmetic on the cell size, and none of it survives being expressed as a
 * utility.
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
    blur: 4,
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
    blur: 6,
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
 * The tile crossing the comb. Slower than a press on purpose: at spring speed
 * the shape arrives before the eye has found it, and the move has to be legible
 * as a move — it is the only thing telling you where the selection went.
 */
const TRAVEL = { type: "spring", stiffness: 210, damping: 24, mass: 0.9 } as const
/** Looser again, and underdamped — this one is a weight on a thread. */
const PLUMB = { type: "spring", stiffness: 150, damping: 16, mass: 0.9 } as const
const EASE = [0.22, 1, 0.36, 1] as const

/** Velocity, in px/s, at which the tile reaches its full stretch. */
const LIQUID_AT = 1500
const LIQUID_STRETCH = 0.16

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
 * The comb is glass. Every cell is a frosted hexagon with a lit top edge and a
 * shaded bottom one, and behind them sits a soft wash of the selected model's
 * own colour — so the light in the material belongs to the selection, and
 * moving the selection moves the light. The selected cell is a single tinted
 * tile that slides over the frosting rather than a state each cell paints for
 * itself, and while it travels it stretches along its own direction of travel
 * and settles out of it, with a plumb line swinging above. Nothing is stacked
 * or shadowed to fake depth; the depth is the material.
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
  /* Paint servers are referenced by id, and two hives can share a page. */
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const edge = `${uid}edge`
  const gloss = `${uid}gloss`

  const firstEnabled = models.find((model) => !model.disabled)
  const [internal, setInternal] = React.useState(defaultValue)
  const selectedId = value !== undefined ? value : (internal ?? firstEnabled?.id)
  const selected = models.find((model) => model.id === selectedId)
  const accent = selected?.accent

  /* Only a keyboard gets a ring, and the ring has to be drawn above the tile. */
  const [focused, setFocused] = React.useState<string | null>(null)

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
        return { x, y, cx: x + cellW / 2, cy: y + cellH / 2 }
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
        rank: Math.round(Math.hypot(slot.cx - width / 2, slot.cy - height / 2) * 100),
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

  /* Where the tile sits, the glow pools, and the plumb line hangs from. */
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
        variant === "card" &&
          cn(
            "overflow-hidden rounded-3xl border border-border bg-card",
            /* The light catching the top edge of the panel. */
            "before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px",
            "before:bg-linear-to-r before:from-transparent before:via-foreground/15 before:to-transparent",
            scale.pad
          ),
        className
      )}
      aria-busy={running || undefined}
      {...props}
    >
      {/*
       * The two paint servers the material is made of, declared once. `edge` is
       * the lens: a lit top rim and a shaded bottom one, taken from the theme's
       * own surface colours so it reads in both. `gloss` is the reflection on
       * the tinted tile, which is white in every theme because it is light.
       */}
      <svg aria-hidden="true" className="pointer-events-none absolute size-0">
        <defs>
          <linearGradient id={edge} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="42%" stopColor="#fff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="var(--background)" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={gloss} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="45%" stopColor="#fff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.22" />
          </linearGradient>
        </defs>
      </svg>

      {arm ? (
        <Plumb
          width={layout.width}
          height={scale.line}
          x={home ? home.cx : layout.width / 2}
          accent={accent}
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
        {/*
         * The light in the glass. It is the only saturated thing behind the
         * comb, it is the selected model's own colour, and it travels with the
         * tile — so the frosting nearest the selection lifts and the far corners
         * of the hive stay quiet.
         */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute transition-colors duration-500"
          style={{
            width: layout.cellW * 2.4,
            height: layout.cellW * 2.4,
            left: -layout.cellW * 1.2,
            top: -layout.cellW * 1.2,
            backgroundColor: accent ?? "var(--primary)",
            maskImage: "radial-gradient(closest-side, #000, transparent)",
            WebkitMaskImage: "radial-gradient(closest-side, #000, transparent)",
            filter: `blur(${Math.round(scale.cell / 4)}px)`,
          }}
          initial={false}
          animate={{
            x: home?.cx ?? layout.width / 2,
            y: home?.cy ?? layout.height / 2,
            opacity: home ? 0.42 : 0,
          }}
          transition={reduceMotion ? { duration: 0 } : TRAVEL}
        />

        {layout.slots.map((slot, index) => {
          const modelIndex = layout.filled.get(index)
          const model = modelIndex === undefined ? undefined : models[modelIndex]
          const box = {
            left: slot.x,
            top: slot.y,
            width: layout.cellW,
            height: layout.cellH,
          }

          if (!model) {
            return (
              <div
                key={`empty-${index}`}
                aria-hidden="true"
                className="absolute"
                style={box}
              >
                <Glass width={layout.cellW} height={layout.cellH} blur={scale.blur} empty />
                <Hex stroke={`url(#${edge})`} className="opacity-55" />
              </div>
            )
          }

          const active = model.id === selectedId
          return (
            <button
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
              onFocus={(event) =>
                setFocused(event.currentTarget.matches(":focus-visible") ? model.id : null)
              }
              onBlur={() => setFocused(null)}
              className={cn(
                "absolute focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-40",
                !disabled && !model.disabled && "cursor-pointer"
              )}
              style={box}
            >
              <Glass width={layout.cellW} height={layout.cellH} blur={scale.blur} />
              <Hex stroke={`url(#${edge})`} />
            </button>
          )
        })}

        {/* The selection: one tinted tile, over the frosting rather than in it. */}
        <Tile
          home={home}
          width={layout.cellW}
          height={layout.cellH}
          accent={accent}
          gloss={gloss}
          still={Boolean(reduceMotion)}
        />

        {/*
         * Glyphs and the focus ring ride above the tile, so the tile can pass
         * under them without taking the drawing with it.
         */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
          {layout.slots.map((slot, index) => {
            const modelIndex = layout.filled.get(index)
            const model = modelIndex === undefined ? undefined : models[modelIndex]
            if (!model) return null

            const active = model.id === selectedId
            return (
              <span
                key={model.id}
                className="absolute grid place-items-center"
                style={{
                  left: slot.x,
                  top: slot.y,
                  width: layout.cellW,
                  height: layout.cellH,
                }}
              >
                {focused === model.id ? (
                  <Hex stroke="var(--ring)" strokeWidth={2} />
                ) : null}
                <motion.span
                  className={cn(
                    "relative grid place-items-center transition-colors duration-300 [&_svg]:size-full",
                    scale.glyph,
                    /*
                     * An accent is a literal colour, so the glyph over it takes
                     * the one overridable near-white. Without one the tile is
                     * ink instead, and ink has a paired foreground — which is
                     * the only thing that survives the dark theme, where the ink
                     * is the light end of the ramp.
                     */
                    !model.accent &&
                      (active ? "text-primary-foreground" : "text-muted-foreground")
                  )}
                  style={
                    model.accent ? { color: active ? ON_ACCENT : model.accent } : undefined
                  }
                  animate={{ scale: active ? 1.08 : 1 }}
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                >
                  {model.icon}
                </motion.span>
              </span>
            )
          })}
        </div>
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
              {selected?.label ?? " "}
            </p>
            {selected?.description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{selected.description}</p>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <Action
        accent={accent}
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
 * The frosted body of a cell.
 *
 * A `div` rather than the SVG, because only a real box can carry a
 * `backdrop-filter` — and the hexagon it is cut to is the same path the outline
 * is drawn from, resolved to this cell's pixel size, because `clip-path: path()`
 * has no viewBox to scale it with.
 */
function Glass({
  width,
  height,
  blur,
  empty = false,
}: {
  width: number
  height: number
  blur: number
  empty?: boolean
}) {
  const filter = `blur(${blur}px) saturate(1.6)`
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 block"
      style={{
        clipPath: `path("${hexPath(width, height)}")`,
        background: empty ? GLASS_EMPTY : GLASS,
        backdropFilter: filter,
        WebkitBackdropFilter: filter,
      }}
    />
  )
}

/**
 * The selected cell, as one piece of tinted glass that travels.
 *
 * Three nested transforms, and they are the whole trick: the outer one carries
 * the tile and turns it into the direction it is moving, the middle one
 * stretches it along that direction and thins it across, and the inner one
 * turns the drawing back upright. Composed, that is a stretch along the line of
 * travel with the hexagon still level — a shape that leans into a move and
 * settles out of it, rather than a box that slides.
 */
function Tile({
  home,
  width,
  height,
  accent,
  gloss,
  still,
}: {
  home?: { x: number; y: number }
  width: number
  height: number
  accent?: string
  gloss: string
  still: boolean
}) {
  const targetX = useMotionValue(home?.x ?? 0)
  const targetY = useMotionValue(home?.y ?? 0)
  React.useEffect(() => {
    if (!home) return
    targetX.set(home.x)
    targetY.set(home.y)
  }, [home, targetX, targetY])

  const x = useSpring(targetX, TRAVEL)
  const y = useSpring(targetY, TRAVEL)
  const velocityX = useVelocity(x)
  const velocityY = useVelocity(y)

  const speed = useTransform([velocityX, velocityY], ([vx = 0, vy = 0]: number[]) =>
    Math.hypot(vx, vy)
  )
  const angle = useTransform([velocityX, velocityY], ([vx = 0, vy = 0]: number[]) =>
    Math.hypot(vx, vy) < 1 ? 0 : (Math.atan2(vy, vx) * 180) / Math.PI
  )
  const counter = useTransform(angle, (value: number) => -value)
  const stretch = useTransform(speed, [0, LIQUID_AT], [1, 1 + LIQUID_STRETCH], {
    clamp: true,
  })
  const squash = useTransform(speed, [0, LIQUID_AT], [1, 1 - LIQUID_STRETCH * 0.7], {
    clamp: true,
  })

  const clip = `path("${hexPath(width, height)}")`

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 z-10"
      style={{
        width,
        height,
        x: still ? (home?.x ?? 0) : x,
        y: still ? (home?.y ?? 0) : y,
        rotate: still ? 0 : angle,
      }}
      initial={false}
      animate={{ opacity: home ? 1 : 0, scale: home ? 1 : 0.85 }}
      transition={still ? { duration: 0 } : TRAVEL}
    >
      <motion.div
        className="size-full"
        style={still ? undefined : { scaleX: stretch, scaleY: squash }}
      >
        <motion.div
          className="relative size-full"
          style={still ? undefined : { rotate: counter }}
        >
          <span
            className={cn(
              "absolute inset-0 block transition-colors duration-300",
              accent ? undefined : "bg-primary"
            )}
            style={{ clipPath: clip, ...(accent ? { backgroundColor: accent } : {}) }}
          />
          {/* The reflection: bright across the top, gone by the waist. */}
          <span
            className="absolute inset-0 block"
            style={{
              clipPath: clip,
              backgroundImage:
                "linear-gradient(to bottom, rgb(255 255 255 / 0.3), rgb(255 255 255 / 0.06) 48%, rgb(255 255 255 / 0) 52%)",
            }}
          />
          <Hex stroke={`url(#${gloss})`} strokeWidth={1.25} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/**
 * The plumb line over the selected cell.
 *
 * It tracks the cell's horizontal centre and nothing else — a cable drawn down
 * to the third row would have to cross the two rows above it — and it swings
 * while it travels. The swing is read off the line's own velocity rather than
 * scripted, so a hop to the next cell tilts it slightly and a jump across the
 * comb throws it, then it settles late, after the tile has already arrived.
 */
function Plumb({
  width,
  height,
  x,
  accent,
  visible,
  still,
}: {
  width: number
  height: number
  x: number
  accent?: string
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
        <span
          className={cn(
            "size-1.5 rounded-full transition-colors duration-500",
            accent ? undefined : "bg-border-strong"
          )}
          style={accent ? { backgroundColor: accent } : undefined}
        />
      </motion.div>
    </div>
  )
}

/**
 * The action.
 *
 * Nothing surrounds it at rest. While the queue is working, a ring leaves the
 * capsule every couple of seconds and fades out — one moving thing, tied to one
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
          "relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium",
          "transition-[background-color,opacity] duration-300",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]",
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
        {/* The same reflection the tile carries, on a capsule. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/22 to-transparent"
        />
        <span className="relative">{label}</span>
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
      className={cn(
        "flex items-center not-first:border-t not-first:border-border",
        scale.row
      )}
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

/**
 * The hexagon as a drawing — the outline over the glass, the miniature beside a
 * run, and the focus ring. Unfilled unless a fill is passed, so it can sit on
 * top of the material without hiding it.
 */
function Hex({
  className,
  style,
  stroke,
  strokeWidth = 1,
}: {
  className?: string
  style?: React.CSSProperties
  stroke?: string
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox={`-1 -1 102 ${HEX_H + 2}`}
      aria-hidden="true"
      className={cn("absolute inset-0 size-full fill-none", className)}
      style={style}
    >
      <path
        d={hexPath(100, HEX_H)}
        stroke={stroke}
        vectorEffect="non-scaling-stroke"
        strokeWidth={strokeWidth}
      />
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
 * The hexagon at a given size, with its corners cut back and joined by a curve
 * through the vertex.
 *
 * Rounding is the whole reason the shape is a path: the same six points as a
 * `polygon()` come out knife-sharp, and at this size that is the difference
 * between a cell and a caltrop. It is generated per pixel size rather than
 * scaled, because `clip-path: path()` takes neither a viewBox nor percentages —
 * and cached, because ten cells ask for the same one.
 */
const PATHS = new Map<string, string>()

function hexPath(width: number, height: number): string {
  const key = `${width}x${height}`
  const cached = PATHS.get(key)
  if (cached) return cached

  const path = roundedPolygon(
    [
      [width * 0.25, 0],
      [width * 0.75, 0],
      [width, height / 2],
      [width * 0.75, height],
      [width * 0.25, height],
      [0, height / 2],
    ],
    width * HEX_ROUND
  )
  PATHS.set(key, path)
  return path
}

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
