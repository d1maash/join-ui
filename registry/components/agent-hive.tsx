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
  type MotionValue,
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
/** The same wash, thickened, for the cell under the cursor. */
const GLASS_LIT =
  "var(--agent-hive-glass-lit, color-mix(in oklab, var(--foreground) 11%, transparent))"
/** Opacity of the wash of colour the comb is lit by. */
const GLOW = "var(--agent-hive-glow, 0.45)"

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
const RUN_TONE: Record<
  AgentHiveRunState,
  { pip: string; ink: string; prompt: string }
> = {
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
    line: 18,
    marker: 16,
    pip: 11,
    blur: 4,
    glyph: "size-[1.125rem]",
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
    line: 22,
    marker: 20,
    pip: 13,
    blur: 6,
    glyph: "size-6",
    action: "h-10 px-7 text-sm",
    name: "text-sm",
    row: "gap-3 py-3",
    prompt: "text-[0.8125rem]",
    status: "text-xs",
  },
} as const

/** Widths of the comb's rows. Three, four, three: a hexagon of hexagons. */
const DEFAULT_COMB = [3, 4, 3]

/** A press, a hover, a glyph coming up to size: quick, and barely overshooting. */
const SPRING = { type: "spring", stiffness: 380, damping: 30, mass: 0.7 } as const
/**
 * The tile crossing the comb. Slower than a press on purpose: at spring speed
 * the shape arrives before the eye has found it, and the move has to be legible
 * as a move — it is the only thing telling you where the selection went. Damped
 * to about 0.8 of critical, so it settles with one soft overshoot rather than
 * stopping dead, which is the difference between glass and a sliding box.
 */
const TRAVEL = { type: "spring", stiffness: 190, damping: 22, mass: 1 } as const
/** The wake settling back. Slower than the tile, so the comb closes behind it. */
const WAKE = { type: "spring", stiffness: 160, damping: 20, mass: 1 } as const
const EASE = [0.22, 1, 0.36, 1] as const

/** Velocity, in px/s, at which the tile reaches its full stretch. */
const LIQUID_AT = 1500
const LIQUID_STRETCH = 0.16

/**
 * The wake.
 *
 * A cell is pushed aside as the tile passes it and drawn back once it has gone:
 * `WAKE_PUSH` pixels at most, falling off to nothing `WAKE_REACH` cell-widths
 * away, and scaled by how fast the tile is actually moving — so the comb is
 * perfectly still at rest and yields only while something is travelling through
 * it. That gating is what keeps it from reading as a permanent distortion
 * around the selection.
 */
const WAKE_PUSH = 5
const WAKE_REACH = 1.9
const WAKE_SQUASH = 0.06

/** How far the rail marker smears at full speed, and how thick it is at rest. */
const RAIL_STRETCH = 0.85
const RAIL_THICK = 3

/** Seconds between one ring of the comb settling in and the next. */
const MOUNT_STEP = 0.045

export interface AgentHiveProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children" | "defaultValue"
> {
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
  /** The rail above the comb, and the marker riding it. */
  rail?: boolean
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
  rail = true,
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
  const glow = `${uid}glow`
  const cells = `${uid}cells`

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

    /*
     * Where each cell falls in the mount wave. The comb assembles from the
     * middle outwards along the same distance ordering the models were laid out
     * on, so the ring that carries the selection is already there by the time
     * the rim arrives — the hive builds around its centre rather than wiping in
     * from a corner.
     */
    const wave = new Map<number, number>()
    slots
      .map((slot, index) => ({
        index,
        rank: Math.round(Math.hypot(slot.cx - width / 2, slot.cy - height / 2)),
      }))
      .sort((a, b) => a.rank - b.rank || a.index - b.index)
      .forEach((slot, order) => wave.set(slot.index, order))

    /* Visual order — the order the arrow keys walk, not the order of `models`. */
    const order = slots
      .map((_, index) => filled.get(index))
      .filter((modelIndex): modelIndex is number => modelIndex !== undefined)

    return { cellW, cellH, width, height, slots, filled, order, wave }
  }, [comb, models.length, scale])

  /* Where the tile sits, the glow pools, and the plumb line hangs from. */
  const home = React.useMemo(() => {
    for (const [slotIndex, modelIndex] of layout.filled) {
      if (models[modelIndex]?.id === selectedId) return layout.slots[slotIndex]
    }
    return undefined
  }, [layout, models, selectedId])

  /*
   * One journey, read by everything that moves with the selection: the tile, the
   * light under the comb, and every cell the tile passes. Sharing it is not an
   * optimisation — four springs with identical settings would still drift apart
   * by a frame, and a wake that lags the shape making it is just a wobble.
   */
  const travel = useTravel(home, Boolean(reduceMotion))

  /* When the cell the tile lands in settles, so the tile is not there first. */
  const homeDelay = React.useMemo(() => {
    for (const [slotIndex, modelIndex] of layout.filled) {
      if (models[modelIndex]?.id === selectedId) {
        return (layout.wave.get(slotIndex) ?? 0) * MOUNT_STEP
      }
    }
    return 0
  }, [layout, models, selectedId])

  /* The cursor, held here rather than per cell so the glyph can follow it too. */
  const [hovered, setHovered] = React.useState<string | null>(null)

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const walk = layout.order
      .map((modelIndex) => models[modelIndex])
      .filter(
        (model): model is AgentHiveModel => model !== undefined && !model.disabled
      )
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

      {rail ? (
        <Rail
          width={layout.width}
          height={scale.line}
          marker={scale.marker}
          travel={travel}
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
         * The light in the glass.
         *
         * A soft wash of the selected model's colour, blurred, and then cut to
         * the comb itself — every cell is a hole in the mask and the gaps
         * between them are not. That masking is the whole difference between
         * light inside a material and a coloured smear behind it: unmasked, the
         * wash pools in the gaps and around the rim, and the hive looks stained
         * rather than lit. It sits under the frosting, so each cell's backdrop
         * filter picks it up and carries a little of it past its own edges.
         */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full"
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          style={{ opacity: GLOW }}
        >
          <defs>
            <radialGradient id={glow}>
              {[
                { at: "0%", alpha: 0.95 },
                { at: "55%", alpha: 0.4 },
                { at: "100%", alpha: 0 },
              ].map((stop) => (
                <stop
                  key={stop.at}
                  offset={stop.at}
                  stopColor={accent ?? "var(--primary)"}
                  stopOpacity={stop.alpha}
                  style={{ transition: "stop-color 500ms" }}
                />
              ))}
            </radialGradient>
            <mask
              id={cells}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={layout.width}
              height={layout.height}
            >
              {layout.slots.map((slot, index) => (
                <path
                  key={index}
                  d={hexPath(layout.cellW, layout.cellH)}
                  transform={`translate(${slot.x} ${slot.y})`}
                  fill="#fff"
                />
              ))}
            </mask>
          </defs>
          {/*
           * Masked on the outer group, moved on the inner one. The mask is
           * resolved in the comb's own coordinates, so a transform on the
           * element carrying it would drag the holes along with the light and
           * the whole point — light that only exists inside the cells — would
           * be lost.
           */}
          <g mask={`url(#${cells})`}>
            <motion.g
              style={{ x: travel.x, y: travel.y }}
              initial={false}
              animate={{ opacity: home ? 1 : 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <motion.circle
                r={layout.cellW * 1.25}
                fill={`url(#${glow})`}
                style={{ filter: `blur(${Math.round(layout.cellW / 7)}px)` }}
                /* The light swells a little while work is in flight, and only then. */
                animate={
                  running && !reduceMotion
                    ? { scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }
                    : { scale: 1, opacity: 1 }
                }
                transition={
                  running && !reduceMotion
                    ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.6, ease: EASE }
                }
              />
            </motion.g>
          </g>
        </svg>

        {layout.slots.map((slot, index) => {
          const modelIndex = layout.filled.get(index)
          const model = modelIndex === undefined ? undefined : models[modelIndex]

          return (
            <Cell
              key={model ? model.id : `empty-${index}`}
              slot={slot}
              width={layout.cellW}
              height={layout.cellH}
              blur={scale.blur}
              edge={edge}
              travel={travel}
              delay={(layout.wave.get(index) ?? 0) * MOUNT_STEP}
              still={Boolean(reduceMotion)}
              model={model}
              hovered={model !== undefined && hovered === model.id}
              disabled={disabled}
              register={(node) => {
                if (model) cellRefs.current[model.id] = node
              }}
              selected={model !== undefined && model.id === selectedId}
              onSelect={select}
              onHover={setHovered}
              onFocusRing={setFocused}
            />
          )
        })}

        {/* The selection: one tinted tile, over the frosting rather than in it. */}
        <Tile
          travel={travel}
          visible={Boolean(home)}
          width={layout.cellW}
          height={layout.cellH}
          accent={accent}
          gloss={gloss}
          mountDelay={homeDelay}
          still={Boolean(reduceMotion)}
        />

        {/*
         * Glyphs and the focus ring ride above the tile, so the tile can pass
         * under them without taking the drawing with it — and each rides its own
         * cell's wake, or it would sit still while the glass under it moved.
         */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
          {layout.slots.map((slot, index) => {
            const modelIndex = layout.filled.get(index)
            const model = modelIndex === undefined ? undefined : models[modelIndex]
            if (!model) return null

            return (
              <CellGlyph
                key={model.id}
                slot={slot}
                width={layout.cellW}
                height={layout.cellH}
                travel={travel}
                still={Boolean(reduceMotion)}
                model={model}
                glyph={scale.glyph}
                active={model.id === selectedId}
                hovered={hovered === model.id}
                ringed={focused === model.id}
                delay={(layout.wave.get(index) ?? 0) * MOUNT_STEP}
              />
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
              <p className="mt-0.5 text-xs text-muted-foreground">
                {selected.description}
              </p>
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
          <li className="py-4 text-center text-xs text-muted-foreground">
            {emptyLabel}
          </li>
        ) : null}
      </ol>
    </div>
  )
}

/**
 * The journey the selection is on, as motion values.
 *
 * Springs on the centre rather than on the corner, because everything that
 * reads this wants a centre: the light pools at one, the wake is measured from
 * one, and only the tile has to subtract half its own size. Velocity is derived
 * here too, so the stretch, the swing and the wake are all reacting to the same
 * number rather than to three separate estimates of it.
 */
interface Travel {
  x: MotionValue<number>
  y: MotionValue<number>
  /** Signed, and horizontal only — the rail moves on one axis. */
  velocityX: MotionValue<number>
  speed: MotionValue<number>
  angle: MotionValue<number>
}

function useTravel(
  home: { cx: number; cy: number } | undefined,
  still: boolean
): Travel {
  const targetX = useMotionValue(home?.cx ?? 0)
  const targetY = useMotionValue(home?.cy ?? 0)
  const zero = useMotionValue(0)

  React.useEffect(() => {
    if (!home) return
    targetX.set(home.cx)
    targetY.set(home.cy)
  }, [home, targetX, targetY])

  const springX = useSpring(targetX, TRAVEL)
  const springY = useSpring(targetY, TRAVEL)
  const velocityX = useVelocity(springX)
  const velocityY = useVelocity(springY)

  const speed = useTransform([velocityX, velocityY], ([vx = 0, vy = 0]: number[]) =>
    Math.hypot(vx, vy)
  )
  /* Below a pixel a second the direction is noise, and noise would jitter. */
  const angle = useTransform([velocityX, velocityY], ([vx = 0, vy = 0]: number[]) =>
    Math.hypot(vx, vy) < 1 ? 0 : (Math.atan2(vy, vx) * 180) / Math.PI
  )

  /*
   * Reduced motion is answered here rather than at each of the six places that
   * read this, which is both less code and less to get wrong: the targets are
   * handed back unsprung, so positions are still correct and simply arrive at
   * once, and every velocity is a constant zero, so the stretch, the swing, the
   * wake and the smear all evaluate to their resting values without a single
   * conditional downstream.
   */
  if (still) {
    return { x: targetX, y: targetY, velocityX: zero, speed: zero, angle: zero }
  }
  return { x: springX, y: springY, velocityX, speed, angle }
}

/**
 * How far this cell is shoved aside by the tile going past, on each axis.
 *
 * Two transforms rather than one returning a pair, because a style takes one
 * motion value per property. Both read the tile's live centre and its speed, so
 * the push exists only while the tile is actually moving: at rest the term is
 * zero and the comb is a still drawing.
 */
function useWake(
  centre: { cx: number; cy: number },
  travel: Travel,
  reach: number,
  still: boolean
) {
  const raw = { x: travel.x, y: travel.y, speed: travel.speed }

  const pushX = useTransform(
    [raw.x, raw.y, raw.speed],
    ([tx = 0, ty = 0, speed = 0]: number[]) =>
      wakeOffset(centre.cx - tx, centre.cy - ty, speed, reach, "x")
  )
  const pushY = useTransform(
    [raw.x, raw.y, raw.speed],
    ([tx = 0, ty = 0, speed = 0]: number[]) =>
      wakeOffset(centre.cx - tx, centre.cy - ty, speed, reach, "y")
  )
  const squash = useTransform(
    [raw.x, raw.y, raw.speed],
    ([tx = 0, ty = 0, speed = 0]: number[]) =>
      1 -
      WAKE_SQUASH *
        falloff(Math.hypot(centre.cx - tx, centre.cy - ty), reach) *
        urgency(speed)
  )

  /*
   * Sprung on the way out as well as on the way back. The raw value tracks the
   * tile exactly, which makes the push arrive and leave at the tile's own pace;
   * a softer spring on top lets the comb close a beat later, the way something
   * displaced actually returns.
   */
  const x = useSpring(pushX, WAKE)
  const y = useSpring(pushY, WAKE)
  const scale = useSpring(squash, WAKE)

  return still ? {} : { x, y, scale }
}

/** The push along one axis: direction, times reach, times how fast it is going. */
function wakeOffset(
  dx: number,
  dy: number,
  speed: number,
  reach: number,
  axis: "x" | "y"
): number {
  const distance = Math.hypot(dx, dy)
  if (distance < 1) return 0
  const amount = (WAKE_PUSH * falloff(distance, reach) * urgency(speed)) / distance
  return (axis === "x" ? dx : dy) * amount
}

/** 1 under the tile, 0 at `reach`, and smoothed so the edge is not a rim. */
function falloff(distance: number, reach: number): number {
  const t = Math.max(0, 1 - distance / reach)
  return t * t
}

/** 0 at rest, 1 at full travelling speed. */
function urgency(speed: number): number {
  return Math.min(1, speed / LIQUID_AT)
}

/**
 * One cell of the comb: the frosted body, its outline, and the hit target.
 *
 * A component rather than a branch in a map, because each cell reads the tile's
 * journey for itself — the wake is per cell and needs hooks, and hooks cannot
 * be called in a loop.
 */
function Cell({
  slot,
  width,
  height,
  blur,
  edge,
  travel,
  delay,
  still,
  model,
  selected,
  hovered,
  disabled,
  register,
  onSelect,
  onHover,
  onFocusRing,
}: {
  slot: { x: number; y: number; cx: number; cy: number }
  width: number
  height: number
  blur: number
  edge: string
  travel: Travel
  delay: number
  still: boolean
  model?: AgentHiveModel
  selected: boolean
  hovered: boolean
  disabled: boolean
  register: (node: HTMLButtonElement | null) => void
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
  onFocusRing: (id: string | null) => void
}) {
  const wake = useWake(slot, travel, width * WAKE_REACH, still)
  const box = { left: slot.x, top: slot.y, width, height }

  /* The comb assembles from the middle outwards, then never does it again. */
  const arrival = still
    ? undefined
    : {
        initial: { opacity: 0, scale: 0.86 },
        animate: { opacity: 1, scale: 1 },
        transition: { ...SPRING, delay },
      }

  const body = (
    <motion.span className="absolute inset-0 block" style={wake}>
      <Glass width={width} height={height} blur={blur} empty={!model} lit={hovered} />
      <Hex
        stroke={`url(#${edge})`}
        className={cn(
          "transition-opacity duration-300",
          model ? (hovered ? "opacity-100" : "opacity-80") : "opacity-55"
        )}
      />
    </motion.span>
  )

  if (!model) {
    return (
      <motion.div aria-hidden="true" className="absolute" style={box} {...arrival}>
        {body}
      </motion.div>
    )
  }

  return (
    <motion.button
      ref={register}
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={model.label}
      disabled={disabled || model.disabled}
      /* Roving tabindex: the comb is one tab stop, the arrows move inside it. */
      tabIndex={selected ? 0 : -1}
      onClick={() => onSelect(model.id)}
      onPointerEnter={() => onHover(model.id)}
      onPointerLeave={() => onHover(null)}
      onFocus={(event) =>
        onFocusRing(event.currentTarget.matches(":focus-visible") ? model.id : null)
      }
      onBlur={() => onFocusRing(null)}
      className={cn(
        "absolute focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-40",
        !disabled && !model.disabled && "cursor-pointer"
      )}
      style={box}
      {...arrival}
      whileHover={still || disabled || model.disabled ? undefined : { scale: 1.06 }}
      whileTap={still || disabled || model.disabled ? undefined : { scale: 0.94 }}
    >
      {body}
    </motion.button>
  )
}

/**
 * The glyph over a cell, and the ring around it when a keyboard put it there.
 *
 * Drawn in its own layer above the tile so the tile passes underneath, which
 * means it has to ride the same wake and the same hover as the glass it belongs
 * to — otherwise the mark would sit still while its cell moved out from under
 * it.
 */
function CellGlyph({
  slot,
  width,
  height,
  travel,
  still,
  model,
  glyph,
  active,
  hovered,
  ringed,
  delay,
}: {
  slot: { x: number; y: number; cx: number; cy: number }
  width: number
  height: number
  travel: Travel
  still: boolean
  model: AgentHiveModel
  glyph: string
  active: boolean
  hovered: boolean
  ringed: boolean
  delay: number
}) {
  const wake = useWake(slot, travel, width * WAKE_REACH, still)

  return (
    <motion.span
      className="absolute grid place-items-center"
      style={{ left: slot.x, top: slot.y, width, height, ...wake }}
      initial={still ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE, delay: delay + 0.1 }}
    >
      {ringed ? <Hex stroke="var(--ring)" strokeWidth={2} /> : null}
      <motion.span
        className={cn(
          "relative grid place-items-center transition-colors duration-300 [&_svg]:size-full",
          glyph,
          /*
           * An accent is a literal colour, so the glyph over it takes the one
           * overridable near-white. Without one the tile is ink instead, and ink
           * has a paired foreground — which is the only thing that survives the
           * dark theme, where the ink is the light end of the ramp.
           */
          !model.accent &&
            (active ? "text-primary-foreground" : "text-muted-foreground")
        )}
        style={model.accent ? { color: active ? ON_ACCENT : model.accent } : undefined}
        animate={{ scale: active ? 1.08 : hovered ? 1.04 : 1 }}
        transition={still ? { duration: 0 } : SPRING}
      >
        {model.icon}
      </motion.span>
    </motion.span>
  )
}

/**
 * The frosted body of a cell.
 *
 * A box rather than the SVG, because only a real box can carry a
 * `backdrop-filter` — and the hexagon it is cut to is the same path the outline
 * is drawn from, resolved to this cell's pixel size, because `clip-path: path()`
 * has no viewBox to scale it with.
 *
 * Two elements, not one, and the nesting is load-bearing: a `backdrop-filter`
 * is *not* clipped by a `clip-path` on its own element, so a single box leaks
 * its filtered backdrop as a rectangle — visible here as saturated corners
 * bleeding into the gaps between the cells whenever anything colourful passes
 * behind the comb. Clipping the parent and filtering the child clips it.
 */
function Glass({
  width,
  height,
  blur,
  empty = false,
  lit = false,
}: {
  width: number
  height: number
  blur: number
  empty?: boolean
  /** Under the cursor: the frosting thickens, as though breathed on. */
  lit?: boolean
}) {
  const filter = `blur(${blur}px) saturate(${lit ? 1.9 : 1.6})`
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 block"
      style={{ clipPath: `path("${hexPath(width, height)}")` }}
    >
      <span
        className="block size-full transition-[background,backdrop-filter] duration-300"
        style={{
          background: lit ? GLASS_LIT : empty ? GLASS_EMPTY : GLASS,
          backdropFilter: filter,
          WebkitBackdropFilter: filter,
        }}
      />
    </span>
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
  travel,
  visible,
  width,
  height,
  accent,
  gloss,
  mountDelay,
  still,
}: {
  travel: Travel
  visible: boolean
  width: number
  height: number
  accent?: string
  gloss: string
  mountDelay: number
  still: boolean
}) {
  /*
   * The journey is measured centre to centre; only the tile has a corner. Every
   * transform below is an identity when the travel is still, so none of them
   * needs to ask whether it is.
   */
  const x = useTransform(travel.x, (value) => value - width / 2)
  const y = useTransform(travel.y, (value) => value - height / 2)
  const counter = useTransform(travel.angle, (value) => -value)
  const stretch = useTransform(travel.speed, [0, LIQUID_AT], [1, 1 + LIQUID_STRETCH], {
    clamp: true,
  })
  const squash = useTransform(
    travel.speed,
    [0, LIQUID_AT],
    [1, 1 - LIQUID_STRETCH * 0.7],
    {
      clamp: true,
    }
  )
  /* The reflection slides to the trailing edge as the tile picks up speed. */
  const sheen = useTransform(travel.speed, [0, LIQUID_AT], [50, 88], { clamp: true })
  const sheenPosition = useTransform(sheen, (value) => `${value}%`)

  const clip = `path("${hexPath(width, height)}")`

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 z-10"
      style={{
        width,
        height,
        x,
        y,
        rotate: travel.angle,
      }}
      /* Arrives with the ring of comb it lands in, not before it. */
      initial={still ? false : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.85 }}
      transition={still ? { duration: 0 } : { ...TRAVEL, delay: mountDelay }}
    >
      <motion.div className="size-full" style={{ scaleX: stretch, scaleY: squash }}>
        <motion.div className="relative size-full" style={{ rotate: counter }}>
          <span
            className={cn(
              "absolute inset-0 block transition-colors duration-300",
              accent ? undefined : "bg-primary"
            )}
            style={{ clipPath: clip, ...(accent ? { backgroundColor: accent } : {}) }}
          />
          {/* The reflection: bright across the top, gone by the waist. */}
          <motion.span
            className="absolute inset-0 block"
            style={{
              clipPath: clip,
              backgroundImage:
                "linear-gradient(to bottom, rgb(255 255 255 / 0.3), rgb(255 255 255 / 0.06) 48%, rgb(255 255 255 / 0) 52%)",
              backgroundSize: "100% 200%",
              backgroundPositionY: sheenPosition,
            }}
          />
          <Hex stroke={`url(#${gloss})`} strokeWidth={1.25} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/**
 * The index above the comb.
 *
 * A rail fixed at both ends with a marker riding it, which is a different claim
 * from the one a hanging pointer makes: a plumb line is an object suspended in
 * space, and it has to be believed as one — it needs a thickness, a weight and
 * somewhere to hang from, and above a flat comb there is nowhere. A rail is an
 * axis, the marker is a reading on it, and neither has to be believed as a
 * physical thing at all.
 *
 * The marker smears along the rail as it travels — the same trick as the tile,
 * off the same shared spring, but keyed to horizontal velocity alone, because a
 * hop between two cells in the same column moves it nowhere and should not
 * stretch it.
 */
function Rail({
  width,
  height,
  marker,
  travel,
  accent,
  visible,
  still,
}: {
  width: number
  height: number
  /** Length of the marker at rest, in pixels. */
  marker: number
  travel: Travel
  accent?: string
  visible: boolean
  still: boolean
}) {
  const x = useTransform(travel.x, (value) => value - marker / 2)
  const stretch = useTransform(
    travel.velocityX,
    (value) => 1 + Math.min(1, Math.abs(value) / LIQUID_AT) * RAIL_STRETCH
  )
  /* The rail lights up under the marker, and further out the faster it goes. */
  const spill = useTransform(
    travel.velocityX,
    (value) => 0.22 + Math.min(1, Math.abs(value) / LIQUID_AT) * 0.3
  )

  return (
    <div aria-hidden="true" className="relative mx-auto" style={{ width, height }}>
      {/* Fixed at both ends, and fading into them so it has no cut edge. */}
      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-linear-to-r from-transparent via-border-strong/40 to-transparent" />

      <motion.div
        className="absolute top-1/2 transition-colors duration-500"
        style={{
          width: marker,
          height: RAIL_THICK,
          marginTop: -RAIL_THICK / 2,
          color: accent ?? "var(--border-strong)",
          x,
          scaleX: stretch,
        }}
        initial={false}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.24, ease: EASE }}
      >
        <motion.span
          className="absolute -inset-x-2 -inset-y-1.5 rounded-full bg-current blur-[5px]"
          style={{ opacity: still ? 0.22 : spill }}
        />
        <span className="absolute inset-0 rounded-full bg-current" />
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

      <span
        className={cn("relative min-w-0 flex-1 font-mono leading-snug", scale.prompt)}
      >
        <span className={cn("block opacity-0 select-none", tone.prompt)}>
          {run.prompt}
        </span>
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
            className={cn(
              "size-1.5 rounded-full transition-colors duration-500",
              tone.pip
            )}
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
