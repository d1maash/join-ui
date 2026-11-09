"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** Every mark there is, in the order the docs show them. */
export const PROOF_OF_WORK_MARKS = [
  "sort",
  "hanoi",
  "life",
  "tape",
  "branch",
  "descent",
] as const

export type ProofOfWorkMark = (typeof PROOF_OF_WORK_MARKS)[number]

export interface ProofOfWorkProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  /** Which piece of work the mark does while it waits. */
  mark?: ProofOfWorkMark
  /**
   * Whether the work is still going. Turned off, the mark stops where it is
   * and settles on its answer — the bars in order, the tower rebuilt, the
   * machine halted — and holds it.
   */
  active?: boolean
  /**
   * The edge of the mark's square. A number is pixels, a string is any CSS
   * length. Left out, the mark is 1.25rem and a `size-*` class can resize it.
   */
  size?: number | string
  /** Tempo. 2 works twice as fast, 0.5 at half the pace. */
  speed?: number
  /**
   * The accessible name. Left out, the mark is decorative and hidden from
   * assistive technology, which is right whenever a visible label sits beside
   * it. Standing alone, it needs one.
   */
  label?: string
}

/* ----------------------------------------------------------------------------
 * The machinery
 * ------------------------------------------------------------------------- */

/** One state a mark holds, and for how long at speed 1, in milliseconds. */
interface Beat<State> {
  state: State
  hold: number
}

/** Turns a duration in milliseconds at speed 1 into a CSS time at this speed. */
type Clock = (ms: number) => string

/**
 * A mark, ready to play: how long each beat is held, which beat stands in for
 * the work under reduced motion, and how to draw a beat. `null` draws the
 * answer the mark rests on.
 */
interface Program {
  holds: readonly number[]
  pose: number
  draw: (beat: number | null, clock: Clock) => React.ReactNode
}

function program<State>(
  beats: readonly Beat<State>[],
  rest: State,
  pose: number,
  draw: (state: State, clock: Clock) => React.ReactNode
): Program {
  return {
    holds: beats.map((beat) => beat.hold),
    pose: Math.min(pose, beats.length - 1),
    draw: (beat, clock) => draw(beat === null ? rest : beats[beat]!.state, clock),
  }
}

/** What is waiting its turn, and what is only furniture: a peg, a wire, an edge. */
const DIM = 0.34
const FAINT = 0.2

const SOFT = "cubic-bezier(0.32, 0.72, 0, 1)"
const IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)"
/** One soft overshoot: a thing set down, rather than slid into place. */
const SEAT = "cubic-bezier(0.34, 1.38, 0.64, 1)"

/** Scaling a shape about its own middle rather than the corner of the drawing. */
const CENTRED: React.CSSProperties = {
  transformBox: "fill-box",
  transformOrigin: "center",
}

const round = (value: number) => Math.round(value * 100) / 100

/* ----------------------------------------------------------------------------
 * Sort — a cocktail shaker sort of five bars
 * ------------------------------------------------------------------------- */

interface SortState {
  /** `order[slot]` is the rank of the bar standing in that slot. */
  order: readonly number[]
  /** The two slots being compared, if any are. */
  pair: readonly [number, number] | null
  /** The hand has just been dealt, so every bar is travelling at once. */
  dealt: boolean
  sorted: boolean
}

const BAR_HEIGHTS = [5, 8, 11, 14, 17] as const

/** The hands it is dealt, in turn. Each takes a different road to the same order. */
const HANDS = [
  [3, 0, 4, 1, 2],
  [4, 2, 0, 3, 1],
  [1, 4, 2, 0, 3],
  [2, 3, 0, 4, 1],
] as const

function buildSort(): Program {
  const beats: Beat<SortState>[] = []

  for (const hand of HANDS) {
    const order: number[] = [...hand]
    beats.push({
      state: { order: [...order], pair: null, dealt: true, sorted: false },
      hold: 560,
    })

    /* Compare two neighbours, and swap them if they are the wrong way round. */
    const visit = (a: number, b: number): boolean => {
      const pair = [a, b] as const
      beats.push({
        state: { order: [...order], pair, dealt: false, sorted: false },
        hold: 130,
      })
      if (order[a]! <= order[b]!) return false
      ;[order[a], order[b]] = [order[b]!, order[a]!]
      beats.push({
        state: { order: [...order], pair, dealt: false, sorted: false },
        hold: 250,
      })
      return true
    }

    /*
     * The shaker sort itself: one pass up carries the tallest bar home, one
     * pass back carries the shortest, and the stretch between them shrinks
     * until a pass goes by with nothing to swap.
     */
    let low = 0
    let high = order.length - 1
    while (low < high) {
      let swapped = false
      for (let slot = low; slot < high; slot += 1) {
        if (visit(slot, slot + 1)) swapped = true
      }
      if (!swapped) break
      high -= 1
      swapped = false
      for (let slot = high - 1; slot >= low; slot -= 1) {
        if (visit(slot, slot + 1)) swapped = true
      }
      if (!swapped) break
      low += 1
    }

    beats.push({
      state: { order: [...order], pair: null, dealt: false, sorted: true },
      hold: 1150,
    })
  }

  const rest: SortState = { order: [0, 1, 2, 3, 4], pair: null, dealt: false, sorted: true }

  return program(beats, rest, 4, (state, clock) =>
    BAR_HEIGHTS.map((height, rank) => {
      const slot = state.order.indexOf(rank)
      const lit = state.sorted || state.pair?.includes(slot) === true
      /* In order, the bars light from the short end to the tall one. */
      const wait = state.sorted ? clock(slot * 55) : "0ms"
      return (
        <rect
          key={rank}
          x={-1.2}
          y={20.5 - height}
          width={2.4}
          height={height}
          rx={1.2}
          style={{
            transform: `translateX(${4 + slot * 4}px)`,
            opacity: lit ? 1 : DIM,
            transition: [
              `transform ${clock(state.dealt ? 480 : 260)} ${state.dealt ? IN_OUT : SEAT}`,
              `opacity ${clock(160)} linear ${wait}`,
            ].join(", "),
          }}
        />
      )
    })
  )
}

/* ----------------------------------------------------------------------------
 * Hanoi — the Tower of Hanoi, three discs, seven moves a crossing
 * ------------------------------------------------------------------------- */

interface Disc {
  peg: number
  /** How many discs it is resting on. */
  level: number
  /** Lifted clear of the pegs, on its way from one to another. */
  aloft: boolean
}

const PEG_X = [5, 12, 19] as const
const DISC_WIDTHS = [6.6, 5, 3.4] as const
const LANE_Y = 4.4
const levelY = (level: number) => 17.4 - level * 3.3

function buildHanoi(): Program {
  const pegs: number[][] = [[0, 1, 2], [], []]
  const discs: Disc[] = [0, 1, 2].map((level) => ({ peg: 0, level, aloft: false }))
  const beats: Beat<readonly Disc[]>[] = []

  const hold = (ms: number) => {
    beats.push({ state: discs.map((disc) => ({ ...disc })), hold: ms })
  }

  /* A move is three beats — up, across, down — and the overlap draws the arc. */
  const move = (from: number, to: number) => {
    const disc = discs[pegs[from]!.pop()!]!
    disc.aloft = true
    hold(120)
    disc.peg = to
    disc.level = pegs[to]!.length
    hold(200)
    disc.aloft = false
    pegs[to]!.push(discs.indexOf(disc))
    hold(190)
  }

  /* The whole of the puzzle: clear the way, move the big one, put it back. */
  const solve = (count: number, from: number, to: number, via: number) => {
    if (count === 0) return
    solve(count - 1, from, via, to)
    move(from, to)
    solve(count - 1, via, to, from)
  }

  /* Round the three pegs and home again, so the loop closes where it began. */
  for (const [from, to, via] of [
    [0, 2, 1],
    [2, 1, 0],
    [1, 0, 2],
  ] as const) {
    solve(3, from, to, via)
    beats[beats.length - 1]!.hold += 640
  }

  const rest: Disc[] = [0, 1, 2].map((level) => ({ peg: 1, level, aloft: false }))

  return program<readonly Disc[]>(beats, rest, 8, (state, clock) => (
    <>
      {PEG_X.map((x) => (
        <rect key={x} x={x - 0.5} y={7.8} width={1} height={12} rx={0.5} opacity={FAINT} />
      ))}
      {state.map((disc, index) => {
        const width = DISC_WIDTHS[index]!
        return (
          <g
            key={index}
            style={{
              transform: `translateX(${PEG_X[disc.peg]}px)`,
              transition: `transform ${clock(280)} ${IN_OUT}`,
            }}
          >
            <rect
              x={-width / 2}
              y={-1.3}
              width={width}
              height={2.6}
              rx={1}
              style={{
                transform: `translateY(${disc.aloft ? LANE_Y : levelY(disc.level)}px)`,
                transition: `transform ${clock(disc.aloft ? 190 : 250)} ${disc.aloft ? SOFT : SEAT}`,
              }}
            />
          </g>
        )
      })}
    </>
  ))
}

/* ----------------------------------------------------------------------------
 * Life — a glider crossing a five-by-five torus
 * ------------------------------------------------------------------------- */

const SIDE = 5
const cellAt = (index: number) => 3.2 + index * 4.4

/** One generation of Conway's rules, on a board whose edges meet. */
function generation(board: readonly boolean[]): boolean[] {
  return board.map((alive, index) => {
    const x = index % SIDE
    const y = (index - x) / SIDE
    let neighbours = 0
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) continue
        if (board[((y + dy + SIDE) % SIDE) * SIDE + ((x + dx + SIDE) % SIDE)]) {
          neighbours += 1
        }
      }
    }
    return alive ? neighbours === 2 || neighbours === 3 : neighbours === 3
  })
}

function board(cells: ReadonlyArray<readonly [number, number]>): boolean[] {
  const next = Array.from({ length: SIDE * SIDE }, () => false)
  for (const [x, y] of cells) next[y * SIDE + x] = true
  return next
}

function buildLife(): Program {
  /*
   * A glider moves one cell diagonally every four generations, so on a board
   * five wide it is back where it started after twenty — the loop is exact
   * without anything being reset.
   */
  const beats: Beat<readonly boolean[]>[] = []
  let current = board([
    [1, 0],
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2],
  ])
  for (let step = 0; step < SIDE * 4; step += 1) {
    beats.push({ state: current, hold: 170 })
    current = generation(current)
  }

  /* The tub: four cells round an empty middle, and the rules leave it alone. */
  const rest = board([
    [2, 1],
    [1, 2],
    [3, 2],
    [2, 3],
  ])

  return program<readonly boolean[]>(beats, rest, 0, (state, clock) =>
    state.map((alive, index) => (
      <circle
        key={index}
        cx={round(cellAt(index % SIDE))}
        cy={round(cellAt(Math.floor(index / SIDE)))}
        r={1.6}
        style={{
          ...CENTRED,
          opacity: alive ? 1 : 0.16,
          transform: `scale(${alive ? 1 : 0.62})`,
          transition: `opacity ${clock(150)} linear, transform ${clock(200)} ${SOFT}`,
        }}
      />
    ))
  )
}

/* ----------------------------------------------------------------------------
 * Tape — a three-state busy beaver, run until it halts
 * ------------------------------------------------------------------------- */

interface TapeState {
  cells: readonly number[]
  head: number
  /** The cell being written this beat, if one is. */
  struck: number | null
}

type Rule = readonly [write: number, move: 1 | -1, next: string]

/**
 * The machine: for each state, what to do on reading a blank and on reading a
 * mark. Three states and two symbols, and no machine that small writes more
 * marks before stopping — six of them, in fourteen steps.
 */
const RULES: Record<string, readonly [Rule, Rule]> = {
  A: [
    [1, 1, "B"],
    [1, 1, "HALT"],
  ],
  B: [
    [0, 1, "C"],
    [1, 1, "B"],
  ],
  C: [
    [1, -1, "C"],
    [1, -1, "A"],
  ],
}

const TAPE_LENGTH = 11
const TAPE_ORIGIN = 4
const TAPE_PITCH = 4.8

function buildTape(): Program {
  const cells: number[] = Array.from({ length: TAPE_LENGTH }, () => 0)
  let head = TAPE_ORIGIN
  let state = "A"
  const beats: Beat<TapeState>[] = [
    { state: { cells: [...cells], head, struck: null }, hold: 440 },
  ]

  /* A step is two beats: the head writes, then the tape moves under it. */
  while (state in RULES) {
    const [write, move, next] = RULES[state]![cells[head]!]!
    cells[head] = write
    beats.push({ state: { cells: [...cells], head, struck: head }, hold: 110 })
    head += move
    state = next
    beats.push({ state: { cells: [...cells], head, struck: null }, hold: 170 })
  }
  beats[beats.length - 1]!.hold += 1250

  const rest = beats[beats.length - 1]!.state

  return program(beats, rest, 12, (tape, clock) => (
    <>
      {/* The head: fixed, with the tape drawn through it. */}
      <rect x={10.2} y={7.3} width={3.6} height={1.1} rx={0.55} />
      <rect x={10.2} y={15.6} width={3.6} height={1.1} rx={0.55} />
      <g
        style={{
          transform: `translateX(${round((TAPE_ORIGIN - tape.head) * TAPE_PITCH)}px)`,
          transition: `transform ${clock(220)} ${SOFT}`,
        }}
      >
        {tape.cells.map((value, index) => {
          /* The tape fades out two cells either side of the head. */
          const reach = Math.abs(index - tape.head)
          const seen = reach <= 1 ? 1 : reach === 2 ? 0.45 : 0
          return (
            <rect
              key={index}
              x={round(12 + (index - TAPE_ORIGIN) * TAPE_PITCH - 1.8)}
              y={10.2}
              width={3.6}
              height={3.6}
              rx={1}
              style={{
                ...CENTRED,
                opacity: round(seen * (value === 1 ? 1 : FAINT)),
                transform: `scale(${tape.struck === index ? 1.24 : 1})`,
                transition: `opacity ${clock(180)} linear, transform ${clock(150)} ${SOFT}`,
              }}
            />
          )
        })}
      </g>
    </>
  ))
}

/* ----------------------------------------------------------------------------
 * Branch — a depth-first search that backtracks
 * ------------------------------------------------------------------------- */

interface BranchState {
  /** The nodes from the root to wherever the search is now. */
  path: readonly number[]
  /** Nodes it has been to and ruled out. */
  dead: readonly number[]
  found: number | null
}

/** A binary tree laid out as a heap: the children of `n` are `2n + 1` and `2n + 2`. */
const NODES = [
  [12, 4.4],
  [6, 11.8],
  [18, 11.8],
  [3, 19.6],
  [9, 19.6],
  [15, 19.6],
  [21, 19.6],
] as const

/** The leaves it goes looking for, in turn. */
const GOALS = [5, 3, 6, 4] as const

/** Each edge, stopped short of the two nodes it joins. */
const EDGES = NODES.slice(1).map(([x, y], index) => {
  const child = index + 1
  const [px, py] = NODES[(child - 1) >> 1]!
  const length = Math.hypot(x - px, y - py)
  const inset = 3 / length
  return {
    child,
    x1: round(px + (x - px) * inset),
    y1: round(py + (y - py) * inset),
    x2: round(x - (x - px) * inset),
    y2: round(y - (y - py) * inset),
  }
})

function buildBranch(): Program {
  const beats: Beat<BranchState>[] = []

  for (const goal of GOALS) {
    const path: number[] = []
    const dead: number[] = []
    const hold = (ms: number, found: number | null = null) => {
      beats.push({ state: { path: [...path], dead: [...dead], found }, hold: ms })
    }

    /* Go down as far as there is to go; if it is not there, come back up. */
    const visit = (node: number): boolean => {
      path.push(node)
      if (node === goal) {
        hold(1250, node)
        return true
      }
      hold(200)
      const left = 2 * node + 1
      if (left < NODES.length && (visit(left) || visit(left + 1))) return true
      path.pop()
      dead.push(node)
      hold(160)
      return false
    }

    hold(400)
    visit(0)
  }

  const rest: BranchState = { path: [0, 2, 5], dead: [], found: 5 }

  return program(beats, rest, 5, (state, clock) => (
    <>
      {EDGES.map(({ child, ...line }) => {
        const walked = state.path.includes(child)
        return (
          <line
            key={child}
            {...line}
            stroke="currentColor"
            strokeWidth={1.2}
            strokeLinecap="round"
            style={{
              opacity: walked ? 0.9 : state.dead.includes(child) ? 0.1 : FAINT,
              transition: `opacity ${clock(180)} linear`,
            }}
          />
        )
      })}
      {NODES.map(([x, y], node) => {
        const walked = state.path.includes(node)
        const ruledOut = state.dead.includes(node)
        return (
          <circle
            key={node}
            cx={x}
            cy={y}
            r={1.8}
            style={{
              ...CENTRED,
              opacity: walked ? 1 : ruledOut ? 0.14 : DIM,
              transform: `scale(${state.found === node ? 1.3 : ruledOut ? 0.72 : 1})`,
              transition: `opacity ${clock(180)} linear, transform ${clock(260)} ${SEAT}`,
            }}
          />
        )
      })}
    </>
  ))
}

/* ----------------------------------------------------------------------------
 * Descent — gradient descent to the bottom of a valley
 * ------------------------------------------------------------------------- */

interface DescentState {
  /** Where the bead is, from -1 at one rim to 1 at the other. The floor is 0. */
  at: number
  /** How far the last step carried it. */
  step: number
  shown: boolean
  /** The beat on which it arrives. */
  arrived: boolean
}

/** Where each run is set down, and its learning rate. */
const RUNS = [
  { from: -0.92, rate: 0.82 },
  { from: 0.88, rate: 0.78 },
  { from: -0.76, rate: 0.86 },
] as const

/** Close enough to the floor to call it found. */
const CONVERGED = 0.06

function buildDescent(): Program {
  const beats: Beat<DescentState>[] = []

  RUNS.forEach((run, index) => {
    let at: number = run.from
    beats.push({ state: { at, step: 0, shown: true, arrived: false }, hold: 340 })

    /*
     * The loss is x², so its slope is 2x. A rate this high overshoots the
     * floor on every step and lands on the far wall, a little lower each time:
     * the textbook zig-zag, which is the reason to draw it at all.
     */
    while (Math.abs(at) > CONVERGED) {
      const next = at - run.rate * 2 * at
      const step = Math.abs(next - at)
      at = next
      beats.push({
        state: { at, step, shown: true, arrived: false },
        hold: 140 + step * 110,
      })
    }

    beats.push({ state: { at, step: 0, shown: true, arrived: true }, hold: 180 })
    beats.push({ state: { at, step: 0, shown: true, arrived: false }, hold: 980 })
    /* Lifted off, and carried unseen to wherever the next run begins. */
    beats.push({ state: { at, step: 0, shown: false, arrived: false }, hold: 170 })
    beats.push({
      state: {
        at: RUNS[(index + 1) % RUNS.length]!.from,
        step: 0,
        shown: false,
        arrived: false,
      },
      hold: 300,
    })
  })

  const rest: DescentState = { at: 0, step: 0, shown: true, arrived: false }

  return program(beats, rest, 2, (state, clock) => {
    const x = round(12 + state.at * 9.4)
    const y = round(17.5 - state.at * state.at * 13)
    const scale = state.shown ? (state.arrived ? 1.32 : 1) : 0.4
    return (
      <>
        <path
          d="M2.6 4.5Q12 30.5 21.4 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={FAINT + 0.06}
        />
        <circle
          r={2.1}
          style={{
            transform: `translate(${x}px, ${y}px) scale(${scale})`,
            opacity: state.shown ? 1 : 0,
            transition: [
              `transform ${clock(170 + state.step * 110)} ${state.step > 0 ? IN_OUT : SEAT}`,
              `opacity ${clock(150)} linear`,
            ].join(", "),
          }}
        />
      </>
    )
  })
}

/* ----------------------------------------------------------------------------
 * The component
 * ------------------------------------------------------------------------- */

/*
 * Built once, when the module loads. Every beat of every mark is worked out
 * here by running the thing it shows, which comes to a few hundred small
 * objects — less than the work of rendering one of them.
 */
const PROGRAMS: Record<ProofOfWorkMark, Program> = {
  sort: buildSort(),
  hanoi: buildHanoi(),
  life: buildLife(),
  tape: buildTape(),
  branch: buildBranch(),
  descent: buildDescent(),
}

const STILL = "(prefers-reduced-motion: reduce)"

/*
 * Whether motion has been turned down, read in a way the server can agree
 * with: a store whose server snapshot is "no" hydrates cleanly and then
 * re-renders still, where a hook that knows the answer on the client's first
 * render would disagree with the markup it was handed.
 */
function subscribeStill(onChange: () => void) {
  const query = window.matchMedia(STILL)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function readStill() {
  return window.matchMedia(STILL).matches
}

const stillOnServer = () => false

/**
 * Proof of Work.
 *
 * A family of marks for the time a model spends thinking — and instead of
 * acting busy, each of them is. One sorts five bars with a shaker sort. One
 * solves the Tower of Hanoi. One flies a glider through Conway's Game of
 * Life, one runs a busy-beaver Turing machine until it halts, one searches a
 * tree depth-first and backs out of the dead ends, one rolls down a loss
 * curve by gradient descent. None of the frames are drawn by hand: when this
 * module loads it runs each algorithm and keeps what happened, and the mark
 * plays that back. The indicator says "working" by doing some.
 *
 * Because the work is real, it has an end. Turn `active` off and the mark
 * does not vanish or freeze mid-stride: it settles on the answer its
 * algorithm was heading for and holds it, so the same element that said
 * "thinking" is the one that says "thought".
 *
 * They are drawn on one 24-unit grid in `currentColor`, with one weight and
 * two opacities, so they sit beside each other — and beside text — as a set.
 * Only `transform` and `opacity` ever change.
 *
 * Under `prefers-reduced-motion` no clock runs. A working mark holds one
 * frame from the middle of its problem, and a finished one holds the answer,
 * so the difference between the two survives without any motion at all.
 */
export function ProofOfWork({
  mark = "sort",
  active = true,
  size,
  speed = 1,
  label,
  className,
  style,
  ...rest
}: ProofOfWorkProps) {
  const still = React.useSyncExternalStore(subscribeStill, readStill, stillOnServer)

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-mark={mark}
      data-state={active ? "working" : "done"}
      className={cn("inline-flex size-5 shrink-0 align-middle", className)}
      style={size === undefined ? style : { width: size, height: size, ...style }}
      {...rest}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className="size-full overflow-visible"
      >
        {/* Keyed, so changing the mark starts the new one from its first beat. */}
        <Work
          key={mark}
          program={PROGRAMS[mark]}
          running={active && !still}
          posed={active && still}
          speed={speed}
        />
      </svg>
    </span>
  )
}

/**
 * Plays a program: holds each beat for its time, then moves to the next, and
 * goes round. There is one timer, it is only ever waiting on the current
 * beat, and it is cleared the moment the work stops.
 */
function Work({
  program: { holds, pose, draw },
  running,
  posed,
  speed,
}: {
  program: Program
  running: boolean
  /** Motion is turned down but the work is going: hold the pose. */
  posed: boolean
  speed: number
}) {
  const [beat, setBeat] = React.useState(0)

  /* Work that starts again starts from the top, not from where it was left. */
  const [wasRunning, setWasRunning] = React.useState(running)
  if (wasRunning !== running) {
    setWasRunning(running)
    if (running) setBeat(0)
  }

  const pace = speed > 0 ? speed : 1

  React.useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(
      () => setBeat((current) => (current + 1) % holds.length),
      holds[beat]! / pace
    )
    return () => window.clearTimeout(timer)
  }, [beat, holds, pace, running])

  const clock: Clock = (ms) => `${Math.round(ms / pace)}ms`

  return <>{draw(running ? beat : posed ? pose : null, clock)}</>
}
