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
  "bisect",
  "queens",
  "sieve",
  "josephus",
  "modulo",
  "hull",
  "monte",
  "hail",
  "euclid",
  "hilbert",
  "slide",
  "match",
  "split",
  "pascal",
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
/** The same, for a long fall: it lands and gives a little, and no more. */
const LAND = "cubic-bezier(0.33, 1.14, 0.6, 1)"

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

  const rest: SortState = {
    order: [0, 1, 2, 3, 4],
    pair: null,
    dealt: false,
    sorted: true,
  }

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

const PEG_X = [4.6, 12, 19.4] as const
const DISC_WIDTHS = [7, 5.2, 3.4] as const
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
        <rect
          key={x}
          x={x - 0.5}
          y={7.8}
          width={1}
          height={10.9}
          rx={0.5}
          opacity={FAINT}
        />
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
                transition: `transform ${clock(disc.aloft ? 190 : 250)} ${disc.aloft ? SOFT : LAND}`,
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
 * Bisect — a binary search closing in on one tick of nine
 * ------------------------------------------------------------------------- */

interface BisectState {
  low: number
  high: number
  /** The tick being looked at. */
  probe: number | null
  found: number | null
}

const TICKS = 9
/** What it goes looking for, in turn. The ticks are in order, so a value is its place. */
const TARGETS = [6, 1, 4, 8, 2] as const

function buildBisect(): Program {
  const beats: Beat<BisectState>[] = []

  for (const target of TARGETS) {
    let low = 0
    let high = TICKS - 1
    beats.push({ state: { low, high, probe: null, found: null }, hold: 420 })

    /* Look at the middle; throw away the half it cannot be in; look again. */
    for (;;) {
      const middle = (low + high) >> 1
      beats.push({ state: { low, high, probe: middle, found: null }, hold: 240 })
      if (middle === target) {
        beats.push({ state: { low, high, probe: null, found: middle }, hold: 1150 })
        break
      }
      if (middle < target) low = middle + 1
      else high = middle - 1
      beats.push({ state: { low, high, probe: null, found: null }, hold: 210 })
    }
  }

  const rest: BisectState = { low: 6, high: 6, probe: null, found: 6 }

  return program(beats, rest, 3, (state, clock) =>
    Array.from({ length: TICKS }, (_, tick) => {
      const chosen = state.found === tick || state.probe === tick
      const live = state.found === null && tick >= state.low && tick <= state.high
      return (
        <rect
          key={tick}
          x={round(2.15 + tick * 2.3)}
          y={5}
          width={1.3}
          height={14}
          rx={0.65}
          style={{
            ...CENTRED,
            opacity: chosen || live ? 1 : DIM,
            transform: `scaleY(${chosen ? 1 : live ? 0.58 : 0.3})`,
            transition: `opacity ${clock(170)} linear, transform ${clock(240)} ${SEAT}`,
          }}
        />
      )
    })
  )
}

/* ----------------------------------------------------------------------------
 * Queens — four queens on a four-by-four board, by backtracking
 * ------------------------------------------------------------------------- */

interface QueensState {
  /** The row each column's queen stands on, or `null` if it is not on the board. */
  rows: readonly (number | null)[]
  /** The column whose queen has just been set down on an attacked square. */
  clash: number | null
  solved: boolean
}

const BOARD = 4
const squareAt = (index: number) => 4.5 + index * 5

function buildQueens(): Program {
  const rows: (number | null)[] = Array.from({ length: BOARD }, () => null)
  const beats: Beat<QueensState>[] = []
  const hold = (ms: number, clash: number | null = null, solved = false) => {
    beats.push({ state: { rows: [...rows], clash, solved }, hold: ms })
  }

  const safe = (column: number, row: number) =>
    rows
      .slice(0, column)
      .every((other, at) => other !== row && Math.abs(other! - row) !== column - at)

  /*
   * One column at a time: try each row, go on to the next column from every
   * square nothing attacks, and when a column runs out of rows take its queen
   * off and let the one before it move on. Run to the end, so both of the
   * board's solutions are found and the search finishes with the board empty.
   */
  const place = (column: number) => {
    if (column === BOARD) {
      hold(1200, null, true)
      return
    }
    for (let row = 0; row < BOARD; row += 1) {
      const free = safe(column, row)
      rows[column] = row
      if (free) {
        hold(170)
        place(column + 1)
      } else {
        hold(115, column)
      }
    }
    rows[column] = null
    hold(120)
  }

  hold(320)
  place(0)

  const rest: QueensState = { rows: [1, 3, 0, 2], clash: null, solved: true }

  return program(beats, rest, 9, (state, clock) => (
    <>
      {Array.from({ length: BOARD * BOARD }, (_, index) => (
        <circle
          key={index}
          cx={squareAt(index % BOARD)}
          cy={squareAt(Math.floor(index / BOARD))}
          r={0.9}
          opacity={FAINT}
        />
      ))}
      {state.rows.map((row, column) => (
        <rect
          key={column}
          x={-1.5}
          y={-1.5}
          width={3}
          height={3}
          rx={0.6}
          style={{
            transform: [
              `translate(${squareAt(column)}px, ${squareAt(row ?? 0)}px)`,
              "rotate(45deg)",
              `scale(${row === null ? 0.3 : state.solved ? 1.16 : 1})`,
            ].join(" "),
            opacity: row === null ? 0 : state.clash === column ? DIM : 1,
            transition: `transform ${clock(150)} ${SOFT}, opacity ${clock(110)} linear`,
          }}
        />
      ))}
    </>
  ))
}

/* ----------------------------------------------------------------------------
 * Sieve — the sieve of Eratosthenes over 2 to 26
 * ------------------------------------------------------------------------- */

type SieveMark = "open" | "prime" | "struck"

interface SieveState {
  marks: readonly SieveMark[]
  /** The cell the sieve has its finger on this beat. */
  at: number | null
}

const SIEVE_FROM = 2
const SIEVE_TO = 26

function buildSieve(): Program {
  const marks: SieveMark[] = Array.from(
    { length: SIEVE_TO - SIEVE_FROM + 1 },
    () => "open"
  )
  const beats: Beat<SieveState>[] = []
  const hold = (ms: number, at: number | null = null) => {
    beats.push({ state: { marks: [...marks], at }, hold: ms })
  }

  hold(440)
  for (let n = SIEVE_FROM; n <= SIEVE_TO; n += 1) {
    if (marks[n - SIEVE_FROM] !== "open") continue
    /* Whatever is still standing when the sieve reaches it is prime. */
    marks[n - SIEVE_FROM] = "prime"
    /* Past the square root there is nothing left for a prime to strike. */
    if (n * n > SIEVE_TO) continue
    hold(270, n - SIEVE_FROM)
    for (let multiple = n * n; multiple <= SIEVE_TO; multiple += n) {
      marks[multiple - SIEVE_FROM] = "struck"
      hold(90, multiple - SIEVE_FROM)
    }
  }
  hold(1250)

  const rest = beats[beats.length - 1]!.state

  return program(beats, rest, 9, (state, clock) =>
    state.marks.map((mark, index) => (
      <rect
        key={index}
        x={round(cellAt(index % SIDE) - 1.5)}
        y={round(cellAt(Math.floor(index / SIDE)) - 1.5)}
        width={3}
        height={3}
        rx={0.75}
        style={{
          ...CENTRED,
          opacity: mark === "prime" ? 1 : mark === "open" ? DIM : 0.13,
          transform: `scale(${state.at === index ? 1.28 : mark === "struck" ? 0.62 : 1})`,
          transition: `opacity ${clock(190)} linear, transform ${clock(180)} ${SOFT}`,
        }}
      />
    ))
  )
}

/* ----------------------------------------------------------------------------
 * Josephus — a ring of eight, counted off until one is left
 * ------------------------------------------------------------------------- */

interface JosephusState {
  alive: readonly boolean[]
  /** Where the count has got to. */
  at: number | null
  survivor: number | null
}

const RING = 8
/** The count on which someone goes, run by run. */
const COUNTS = [3, 2] as const

function buildJosephus(): Program {
  const beats: Beat<JosephusState>[] = []

  for (const count of COUNTS) {
    const alive = Array.from({ length: RING }, () => true)
    const hold = (ms: number, at: number | null, survivor: number | null = null) => {
      beats.push({ state: { alive: [...alive], at, survivor }, hold: ms })
    }

    hold(420, null)
    let at = -1
    for (let left = RING; left > 1; left -= 1) {
      /* Count round the ones still standing; the last one counted goes. */
      for (let counted = 0; counted < count;) {
        at = (at + 1) % RING
        if (!alive[at]) continue
        counted += 1
        hold(125, at)
      }
      alive[at] = false
      hold(150, null)
    }
    hold(1200, null, alive.indexOf(true))
  }

  const alone = Array.from({ length: RING }, (_, index) => index === 6)
  const rest: JosephusState = { alive: alone, at: null, survivor: 6 }

  return program(beats, rest, 10, (state, clock) =>
    state.alive.map((alive, index) => {
      const angle = (index / RING) * Math.PI * 2 - Math.PI / 2
      const survivor = state.survivor === index
      const counted = state.at === index
      return (
        <circle
          key={index}
          cx={round(12 + Math.cos(angle) * 8.2)}
          cy={round(12 + Math.sin(angle) * 8.2)}
          r={1.7}
          style={{
            ...CENTRED,
            opacity: survivor || counted ? 1 : alive ? DIM : 0.13,
            transform: `scale(${survivor ? 1.36 : counted ? 1.16 : alive ? 1 : 0.55})`,
            transition: `opacity ${clock(140)} linear, transform ${clock(220)} ${SEAT}`,
          }}
        />
      )
    })
  )
}

/* ----------------------------------------------------------------------------
 * Modulo — a stride walked round a clock of seven until it comes home
 * ------------------------------------------------------------------------- */

interface ModuloState {
  stride: number
  /** How many steps have been taken, each one a chord. */
  hops: number
}

const HOURS = 7
/** Seven is prime, so any stride visits every hour before it repeats. */
const STRIDES = [3, 2] as const

const hourAt = (hour: number) => {
  const angle = (hour / HOURS) * Math.PI * 2 - Math.PI / 2
  return [round(12 + Math.cos(angle) * 8.7), round(12 + Math.sin(angle) * 8.7)] as const
}

function buildModulo(): Program {
  const beats: Beat<ModuloState>[] = []
  for (const stride of STRIDES) {
    beats.push({ state: { stride, hops: 0 }, hold: 440 })
    for (let hops = 1; hops <= HOURS; hops += 1) {
      beats.push({ state: { stride, hops }, hold: hops === HOURS ? 1200 : 165 })
    }
  }

  const rest: ModuloState = { stride: 3, hops: HOURS }

  return program(beats, rest, 4, (state, clock) => {
    const at = (state.hops * state.stride) % HOURS
    const visited = new Set<number>()
    for (let hop = 0; hop <= state.hops; hop += 1)
      visited.add((hop * state.stride) % HOURS)

    return (
      <>
        {STRIDES.flatMap((stride) =>
          Array.from({ length: HOURS }, (_, hop) => {
            const [x1, y1] = hourAt((hop * stride) % HOURS)
            const [x2, y2] = hourAt(((hop + 1) * stride) % HOURS)
            return (
              <line
                key={`${stride}-${hop}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={1.15}
                strokeLinecap="round"
                style={{
                  opacity: stride === state.stride && hop < state.hops ? 1 : 0,
                  transition: `opacity ${clock(170)} linear`,
                }}
              />
            )
          })
        )}
        {Array.from({ length: HOURS }, (_, hour) => {
          const [cx, cy] = hourAt(hour)
          return (
            <circle
              key={hour}
              cx={cx}
              cy={cy}
              r={1.5}
              style={{
                ...CENTRED,
                opacity: visited.has(hour) ? 1 : DIM,
                transform: `scale(${hour === at && state.hops < HOURS ? 1.34 : 1})`,
                transition: `opacity ${clock(160)} linear, transform ${clock(220)} ${SEAT}`,
              }}
            />
          )
        })}
      </>
    )
  })
}

/* ----------------------------------------------------------------------------
 * Hull — gift wrapping round a cloud of eight points
 * ------------------------------------------------------------------------- */

interface HullState {
  /** The edges of the hull laid so far, as point pairs. */
  edges: readonly string[]
  from: number | null
  /** The furthest-round point found so far from `from`. */
  best: number | null
  /** The point being tested against it. */
  probe: number | null
}

const CLOUD = [
  [4, 16.5],
  [7.5, 5],
  [18, 4],
  [21, 13.5],
  [13, 20.5],
  [10.5, 11],
  [15, 9.5],
  [12.5, 15.5],
] as const

const pairKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`)

function buildHull(): Program {
  const beats: Beat<HullState>[] = []
  const edges: string[] = []
  const used = new Set<string>()
  const hold = (
    ms: number,
    from: number | null,
    best: number | null,
    probe: number | null
  ) => {
    beats.push({ state: { edges: [...edges], from, best, probe }, hold: ms })
  }

  /* Which side of the line from `o` through `a` the point `b` falls on. */
  const turn = (o: number, a: number, b: number) => {
    const [ox, oy] = CLOUD[o]!
    const [ax, ay] = CLOUD[a]!
    const [bx, by] = CLOUD[b]!
    return (ax - ox) * (by - oy) - (ay - oy) * (bx - ox)
  }

  /*
   * Start from the leftmost point, which is certainly on the hull. From each
   * hull point, try every other: whichever has all the rest to one side of it
   * is the next, and the wrapping ends when it arrives back at the start.
   */
  let start = 0
  CLOUD.forEach(([x], index) => {
    if (x < CLOUD[start]![0]) start = index
  })

  hold(440, null, null, null)
  let from = start
  do {
    let best = (from + 1) % CLOUD.length
    for (let probe = 0; probe < CLOUD.length; probe += 1) {
      if (probe === from) continue
      used.add(pairKey(from, probe))
      hold(72, from, best, probe)
      if (turn(from, best, probe) < 0) best = probe
    }
    edges.push(pairKey(from, best))
    hold(200, best, null, null)
    from = best
  } while (from !== start)
  beats[beats.length - 1]!.hold = 1200

  const rest = { ...beats[beats.length - 1]!.state, from: null }

  /* Every line the wrapping ever draws, stopped short of its two points. */
  const lines = [...used].map((key) => {
    const [a, b] = key.split("-").map(Number) as [number, number]
    const [ax, ay] = CLOUD[a]!
    const [bx, by] = CLOUD[b]!
    const inset = 2.3 / Math.hypot(bx - ax, by - ay)
    return {
      key,
      x1: round(ax + (bx - ax) * inset),
      y1: round(ay + (by - ay) * inset),
      x2: round(bx - (bx - ax) * inset),
      y2: round(by - (by - ay) * inset),
    }
  })

  return program<HullState>(beats, rest, 12, (state, clock) => {
    const probing = state.from !== null && state.probe !== null
    const probeKey = probing ? pairKey(state.from!, state.probe!) : null
    const bestKey =
      probing && state.best !== null ? pairKey(state.from!, state.best) : null
    const onHull = new Set(state.edges.flatMap((key) => key.split("-").map(Number)))
    if (state.from !== null) onHull.add(state.from)

    return (
      <>
        {lines.map(({ key, ...line }) => (
          <line
            key={key}
            {...line}
            stroke="currentColor"
            strokeWidth={1.2}
            strokeLinecap="round"
            style={{
              opacity: state.edges.includes(key)
                ? 1
                : key === bestKey
                  ? 0.6
                  : key === probeKey
                    ? DIM
                    : 0,
              transition: `opacity ${clock(90)} linear`,
            }}
          />
        ))}
        {CLOUD.map(([cx, cy], index) => (
          <circle
            key={index}
            cx={cx}
            cy={cy}
            r={1.5}
            style={{
              ...CENTRED,
              opacity: onHull.has(index) ? 1 : DIM,
              transform: `scale(${state.from === index ? 1.3 : 1})`,
              transition: `opacity ${clock(160)} linear, transform ${clock(200)} ${SEAT}`,
            }}
          />
        ))}
      </>
    )
  })
}

/* ----------------------------------------------------------------------------
 * Monte — π by throwing darts at a quarter circle
 * ------------------------------------------------------------------------- */

interface MonteState {
  round: number
  thrown: number
}

const DARTS = 16
const ROUNDS = 2

/**
 * The Halton sequence: the digits of `index` in `base`, mirrored about the
 * point. It scatters like chance does but never clumps, which is why the
 * estimate it gives is better than real dice would manage with as few throws.
 */
function halton(index: number, base: number): number {
  let result = 0
  let fraction = 1 / base
  for (let left = index; left > 0; left = Math.floor(left / base)) {
    result += (left % base) * fraction
    fraction /= base
  }
  return result
}

function buildMonte(): Program {
  const darts = Array.from({ length: DARTS * ROUNDS }, (_, index) => {
    const x = halton(index + 1, 2)
    const y = halton(index + 1, 3)
    /* Inside the quarter circle or not: the whole of the method. */
    return {
      x: round(3.4 + x * 17.2),
      y: round(20.6 - y * 17.2),
      inside: x * x + y * y <= 1,
    }
  })

  const beats: Beat<MonteState>[] = []
  for (let turn = 0; turn < ROUNDS; turn += 1) {
    beats.push({ state: { round: turn, thrown: 0 }, hold: 400 })
    for (let thrown = 1; thrown <= DARTS; thrown += 1) {
      beats.push({
        state: { round: turn, thrown },
        hold: thrown === DARTS ? 1200 : 125,
      })
    }
  }

  const rest: MonteState = { round: 0, thrown: DARTS }

  return program(beats, rest, 9, (state, clock) => (
    <>
      <path
        d="M3.4 3.4V20.6H20.6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={FAINT}
      />
      <path
        d="M3.4 3.4A17.2 17.2 0 0 1 20.6 20.6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={DIM}
      />
      {darts.map((dart, index) => {
        const landed =
          Math.floor(index / DARTS) === state.round && index % DARTS < state.thrown
        return (
          <circle
            key={index}
            cx={dart.x}
            cy={dart.y}
            r={1.15}
            style={{
              ...CENTRED,
              opacity: landed ? (dart.inside ? 1 : DIM) : 0,
              transform: `scale(${landed ? 1 : 0.3})`,
              transition: `opacity ${clock(130)} linear, transform ${clock(240)} ${SEAT}`,
            }}
          />
        )
      })}
    </>
  ))
}

/* ----------------------------------------------------------------------------
 * Hail — the Collatz sequence, falling to one
 * ------------------------------------------------------------------------- */

interface HailState {
  run: number
  /** Which term the sequence has reached; -1 before it starts. */
  step: number
  shown: boolean
  landed: boolean
}

/** Where each run starts. All three climb to 52 before they come down. */
const SEEDS = [7, 9, 11] as const
/** How much of the trail is left, term by term behind the newest. */
const TRAIL = [1, 0.62, 0.42, 0.28, 0.18, 0.11, 0.06] as const
const HAIL_PITCH = 3

function buildHail(): Program {
  /* Halve an even number; triple an odd one and add one; stop at one. */
  const runs = SEEDS.map((seed) => {
    const terms = [seed]
    for (let value: number = seed; value !== 1;) {
      value = value % 2 === 0 ? value / 2 : value * 3 + 1
      terms.push(value)
    }
    return terms
  })
  const ceiling = Math.log(Math.max(...runs.flat()))

  const beats: Beat<HailState>[] = []
  runs.forEach((terms, run) => {
    /* A blank beat first: the strip is wound back with nothing on it to see. */
    beats.push({ state: { run, step: -1, shown: true, landed: false }, hold: 280 })
    terms.forEach((_, step) => {
      beats.push({ state: { run, step, shown: true, landed: false }, hold: 160 })
    })
    const last = terms.length - 1
    beats.push({ state: { run, step: last, shown: true, landed: true }, hold: 200 })
    beats.push({ state: { run, step: last, shown: true, landed: false }, hold: 900 })
    beats.push({ state: { run, step: last, shown: false, landed: false }, hold: 240 })
  })

  const rest: HailState = {
    run: 0,
    step: runs[0]!.length - 1,
    shown: true,
    landed: false,
  }

  return program(beats, rest, 8, (state, clock) => (
    <g
      style={{
        transform: `translateX(${-state.step * HAIL_PITCH}px)`,
        transition: `transform ${clock(170)} ${SOFT}`,
      }}
    >
      {runs[state.run]!.map((value, index) => {
        const age = state.step - index
        const newest = age === 0
        return (
          <circle
            /* Keyed by run, so a new run's terms arrive unseen rather than moved. */
            key={`${state.run}-${index}`}
            cx={20 + index * HAIL_PITCH}
            /* A log scale, or one tall term would flatten every other. */
            cy={round(19.5 - (Math.log(value) / ceiling) * 15)}
            r={1.6}
            style={{
              ...CENTRED,
              opacity: state.shown && age >= 0 ? (TRAIL[age] ?? 0) : 0,
              transform: `scale(${newest ? (state.landed ? 1.4 : 1.12) : 0.9})`,
              transition: `opacity ${clock(170)} linear, transform ${clock(200)} ${SEAT}`,
            }}
          />
        )
      })}
    </g>
  ))
}

/* ----------------------------------------------------------------------------
 * Euclid — the greatest common measure, by cutting squares off a rectangle
 * ------------------------------------------------------------------------- */

interface EuclidState {
  pair: number
  /** How many squares have been cut. */
  cut: number
  done: boolean
}

/** The sides of each rectangle. Their common measures are 1, 3 and 1. */
const PAIRS = [
  [13, 8],
  [12, 9],
  [11, 7],
] as const

function buildEuclid(): Program {
  const sheets = PAIRS.map(([wide, tall]) => {
    /*
     * Euclid's algorithm, drawn the way he would have: take the biggest
     * square the rectangle allows, and do the same to what is left. The side
     * of the last square is the measure both sides share.
     */
    const squares: Array<{ x: number; y: number; side: number }> = []
    let x = 0
    let y = 0
    let w: number = wide
    let h: number = tall
    while (w > 0 && h > 0) {
      if (w >= h) {
        squares.push({ x, y, side: h })
        x += h
        w -= h
      } else {
        squares.push({ x, y, side: w })
        y += w
        h -= w
      }
    }
    const unit = Math.min(20 / wide, 14 / tall)
    return {
      squares,
      unit,
      left: 12 - (wide * unit) / 2,
      top: 12 - (tall * unit) / 2,
      width: wide * unit,
      height: tall * unit,
      measure: squares[squares.length - 1]!.side,
    }
  })

  const beats: Beat<EuclidState>[] = []
  sheets.forEach((sheet, pair) => {
    beats.push({ state: { pair, cut: 0, done: false }, hold: 440 })
    sheet.squares.forEach((_, index) => {
      beats.push({ state: { pair, cut: index + 1, done: false }, hold: 280 })
    })
    beats.push({ state: { pair, cut: sheet.squares.length, done: true }, hold: 1200 })
  })

  const rest: EuclidState = { pair: 0, cut: sheets[0]!.squares.length, done: true }

  return program(beats, rest, 3, (state, clock) =>
    sheets.map((sheet, pair) => {
      const current = pair === state.pair
      return (
        <React.Fragment key={pair}>
          <rect
            x={round(sheet.left)}
            y={round(sheet.top)}
            width={round(sheet.width)}
            height={round(sheet.height)}
            rx={1.3}
            style={{
              opacity: current ? 0.14 : 0,
              transition: `opacity ${clock(220)} linear`,
            }}
          />
          {sheet.squares.map((square, index) => {
            const cut = current && index < state.cut
            const lit = state.done
              ? square.side === sheet.measure
              : index === state.cut - 1
            const side = square.side * sheet.unit - 0.8
            return (
              <rect
                key={index}
                x={round(sheet.left + square.x * sheet.unit + 0.4)}
                y={round(sheet.top + square.y * sheet.unit + 0.4)}
                width={round(side)}
                height={round(side)}
                rx={round(Math.min(1, side * 0.24))}
                style={{
                  ...CENTRED,
                  opacity: cut ? (lit ? 1 : DIM) : 0,
                  transform: `scale(${cut ? 1 : 0.5})`,
                  transition: `opacity ${clock(180)} linear, transform ${clock(280)} ${SEAT}`,
                }}
              />
            )
          })}
        </React.Fragment>
      )
    })
  )
}

/* ----------------------------------------------------------------------------
 * Hilbert — a space-filling curve through a four-by-four lattice
 * ------------------------------------------------------------------------- */

interface HilbertState {
  /** How far along the curve has been drawn. */
  head: number
  /** How far along it has been taken up again. */
  tail: number
}

const LATTICE = 4
const latticeAt = (index: number) => round(3.9 + index * 5.4)

/** Where the curve is after `distance` steps: the standard unwinding, a quadrant at a time. */
function hilbertPoint(distance: number): readonly [number, number] {
  let x = 0
  let y = 0
  let left = distance
  for (let size = 1; size < LATTICE; size *= 2) {
    const rx = 1 & (left >> 1)
    const ry = 1 & (left ^ rx)
    if (ry === 0) {
      if (rx === 1) {
        x = size - 1 - x
        y = size - 1 - y
      }
      ;[x, y] = [y, x]
    }
    x += size * rx
    y += size * ry
    left >>= 2
  }
  return [x, y]
}

function buildHilbert(): Program {
  const points = Array.from({ length: LATTICE * LATTICE }, (_, distance) =>
    hilbertPoint(distance)
  )
  const last = points.length - 1

  const beats: Beat<HilbertState>[] = [{ state: { head: 0, tail: 0 }, hold: 300 }]
  for (let head = 1; head <= last; head += 1) {
    beats.push({ state: { head, tail: 0 }, hold: head === last ? 900 : 85 })
  }
  for (let tail = 1; tail <= last; tail += 1) {
    beats.push({ state: { head: last, tail }, hold: 65 })
  }

  const rest: HilbertState = { head: last, tail: 0 }

  return program(beats, rest, 9, (state, clock) => {
    const [headX, headY] = points[state.head]!
    return (
      <>
        {points.slice(0, last).map(([x, y], index) => {
          const [nextX, nextY] = points[index + 1]!
          return (
            <line
              key={index}
              x1={latticeAt(x)}
              y1={latticeAt(y)}
              x2={latticeAt(nextX)}
              y2={latticeAt(nextY)}
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              style={{
                opacity: index >= state.tail && index < state.head ? 1 : 0,
                transition: `opacity ${clock(110)} linear`,
              }}
            />
          )
        })}
        {points.map(([x, y], index) => (
          <circle
            key={index}
            cx={latticeAt(x)}
            cy={latticeAt(y)}
            r={0.85}
            style={{
              opacity: index >= state.tail && index <= state.head ? 0 : FAINT,
              transition: `opacity ${clock(110)} linear`,
            }}
          />
        ))}
        <circle
          r={1.9}
          style={{
            transform: `translate(${latticeAt(headX)}px, ${latticeAt(headY)}px)`,
            opacity: state.tail < last ? 1 : 0,
            transition: `transform ${clock(90)} ${SOFT}, opacity ${clock(140)} linear`,
          }}
        />
      </>
    )
  })
}

/* ----------------------------------------------------------------------------
 * Slide — the eight puzzle, solved in the fewest moves
 * ------------------------------------------------------------------------- */

interface SlideState {
  /** `board[cell]` is the tile on that cell, and 0 is the gap. */
  board: readonly number[]
  /** The board has just been scrambled, so every tile is travelling at once. */
  dealt: boolean
}

const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0] as const
const SCRAMBLES = 3
const tileAt = (index: number) => round(5.4 + index * 6.6)

/** The cells a gap on `cell` can trade places with. */
function neighbours(cell: number): number[] {
  const column = cell % 3
  return [
    cell - 3,
    cell + 3,
    column > 0 ? cell - 1 : -1,
    column < 2 ? cell + 1 : -1,
  ].filter((next) => next >= 0 && next < 9)
}

/** How far every tile is from home, in moves: never more than the truth. */
function distance(board: readonly number[]): number {
  let total = 0
  board.forEach((tile, cell) => {
    if (tile === 0) return
    const home = tile - 1
    total += Math.abs((cell % 3) - (home % 3))
    total += Math.abs(Math.floor(cell / 3) - Math.floor(home / 3))
  })
  return total
}

/**
 * Iterative-deepening A*: search no deeper than a bound, and when that fails
 * raise the bound to the least it could have been. The first answer it finds
 * is a shortest one. Returns the cells the gap moves to, in order.
 */
function solve(start: readonly number[]): number[] {
  const board = [...start]
  const path: number[] = []

  const search = (
    depth: number,
    bound: number,
    gap: number,
    cameFrom: number
  ): number => {
    const estimate = depth + distance(board)
    if (estimate > bound) return estimate
    if (estimate === depth) return -1
    let least = Infinity
    for (const next of neighbours(gap)) {
      if (next === cameFrom) continue
      board[gap] = board[next]!
      board[next] = 0
      path.push(next)
      const result = search(depth + 1, bound, next, gap)
      if (result === -1) return -1
      path.pop()
      board[next] = board[gap]!
      board[gap] = 0
      if (result < least) least = result
    }
    return least
  }

  for (let bound = distance(board); ;) {
    const result = search(0, bound, board.indexOf(0), -1)
    if (result === -1) return path
    bound = result
  }
}

function buildSlide(): Program {
  const beats: Beat<SlideState>[] = []

  /* A small fixed generator, so the server and the browser deal the same boards. */
  let seed = 7
  const pick = (count: number) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return Math.floor((seed / 0x80000000) * count)
  }

  for (let deal = 0; deal < SCRAMBLES; deal += 1) {
    /* Scrambled by sliding, so the board is always one that can be solved. */
    const board: number[] = [...SOLVED]
    let gap = 8
    let cameFrom = -1
    for (let move = 0; move < 14; move += 1) {
      const options = neighbours(gap).filter((next) => next !== cameFrom)
      const next = options[pick(options.length)]!
      board[gap] = board[next]!
      board[next] = 0
      cameFrom = gap
      gap = next
    }

    beats.push({ state: { board: [...board], dealt: true }, hold: 600 })
    for (const next of solve(board)) {
      board[gap] = board[next]!
      board[next] = 0
      gap = next
      beats.push({ state: { board: [...board], dealt: false }, hold: 210 })
    }
    beats[beats.length - 1]!.hold = 1200
  }

  const rest: SlideState = { board: SOLVED, dealt: false }

  return program(beats, rest, 4, (state, clock) =>
    SOLVED.slice(0, 8).map((tile) => {
      const cell = state.board.indexOf(tile)
      return (
        <rect
          key={tile}
          x={-2.8}
          y={-2.8}
          width={5.6}
          height={5.6}
          rx={1.3}
          style={{
            transform: `translate(${tileAt(cell % 3)}px, ${tileAt(Math.floor(cell / 3))}px)`,
            /* The tiles are told apart by ink: solved, they run from full to faint. */
            opacity: round(1 - (tile - 1) * 0.1),
            transition: `transform ${clock(state.dealt ? 480 : 190)} ${state.dealt ? IN_OUT : SOFT}`,
          }}
        />
      )
    })
  )
}

/* ----------------------------------------------------------------------------
 * Match — a stable matching, by proposal and refusal
 * ------------------------------------------------------------------------- */

interface MatchState {
  /** `partner[right]` is the left-hand point it is holding, or -1. */
  partner: readonly number[]
  /** The proposal on the table: who is asking whom. */
  asking: readonly [number, number] | null
}

/** Who each point on the left would rather have, best first. */
const SUITORS: ReadonlyArray<readonly number[]> = [
  [1, 0, 2, 3],
  [1, 2, 0, 3],
  [0, 1, 3, 2],
  [1, 3, 2, 0],
]

/** And who each point on the right would rather have. */
const CHOOSERS: ReadonlyArray<readonly number[]> = [
  [2, 0, 1, 3],
  [3, 2, 1, 0],
  [0, 1, 2, 3],
  [1, 0, 3, 2],
]

const rankAt = (index: number) => 4.5 + index * 5

function buildMatch(): Program {
  const partner: number[] = CHOOSERS.map(() => -1)
  const asked: number[] = SUITORS.map(() => 0)
  const free: number[] = SUITORS.map((_, index) => index)
  const beats: Beat<MatchState>[] = []
  const hold = (ms: number, asking: readonly [number, number] | null = null) => {
    beats.push({ state: { partner: [...partner], asking }, hold: ms })
  }

  /*
   * Gale and Shapley's algorithm. Whoever is free proposes to the best they
   * have not yet asked; whoever is asked keeps the better of the proposal and
   * what they hold, and lets the other go. When nobody is free, no two points
   * would both rather have each other than what they got.
   */
  hold(440)
  while (free.length > 0) {
    const suitor = free.shift()!
    const chooser = SUITORS[suitor]![asked[suitor]!]!
    asked[suitor]! += 1
    hold(220, [suitor, chooser])

    const held = partner[chooser]!
    const ranks = CHOOSERS[chooser]!
    if (held === -1) {
      partner[chooser] = suitor
    } else if (ranks.indexOf(suitor) < ranks.indexOf(held)) {
      partner[chooser] = suitor
      free.push(held)
    } else {
      free.push(suitor)
    }
    hold(200)
  }
  beats[beats.length - 1]!.hold = 1250

  const rest = beats[beats.length - 1]!.state

  const lines = SUITORS.flatMap((_, suitor) =>
    CHOOSERS.map((__, chooser) => {
      const y1 = rankAt(suitor)
      const y2 = rankAt(chooser)
      const inset = 2.5 / Math.hypot(14, y2 - y1)
      return {
        suitor,
        chooser,
        x1: round(5 + 14 * inset),
        y1: round(y1 + (y2 - y1) * inset),
        x2: round(19 - 14 * inset),
        y2: round(y2 - (y2 - y1) * inset),
      }
    })
  )

  return program(beats, rest, 6, (state, clock) => (
    <>
      {lines.map(({ suitor, chooser, ...line }) => {
        const held = state.partner[chooser] === suitor
        const asking = state.asking?.[0] === suitor && state.asking[1] === chooser
        return (
          <line
            key={`${suitor}-${chooser}`}
            {...line}
            stroke="currentColor"
            strokeWidth={1.2}
            strokeLinecap="round"
            style={{
              opacity: held ? 1 : asking ? DIM : 0,
              transition: `opacity ${clock(170)} linear`,
            }}
          />
        )
      })}
      {SUITORS.map((_, suitor) => (
        <circle
          key={`suitor-${suitor}`}
          cx={5}
          cy={rankAt(suitor)}
          r={1.7}
          style={{
            ...CENTRED,
            opacity:
              state.partner.includes(suitor) || state.asking?.[0] === suitor ? 1 : DIM,
            transform: `scale(${state.asking?.[0] === suitor ? 1.24 : 1})`,
            transition: `opacity ${clock(170)} linear, transform ${clock(220)} ${SEAT}`,
          }}
        />
      ))}
      {CHOOSERS.map((_, chooser) => (
        <circle
          key={`chooser-${chooser}`}
          cx={19}
          cy={rankAt(chooser)}
          r={1.7}
          style={{
            ...CENTRED,
            opacity: state.partner[chooser] !== -1 ? 1 : DIM,
            transform: `scale(${state.asking?.[1] === chooser ? 1.24 : 1})`,
            transition: `opacity ${clock(170)} linear, transform ${clock(220)} ${SEAT}`,
          }}
        />
      ))}
    </>
  ))
}

/* ----------------------------------------------------------------------------
 * Split — a perceptron learning the line between two kinds of point
 * ------------------------------------------------------------------------- */

interface SplitState {
  /** Where the line is nearest the middle of the drawing, and its heading. */
  x: number
  y: number
  angle: number
  /** The point the line has just been found to have on the wrong side. */
  wrong: number | null
  learned: boolean
}

/** The points, from the middle of the drawing, and which kind each one is. */
const SAMPLES = [
  { x: -5, y: -5, kind: 1 },
  { x: 5.5, y: 5, kind: -1 },
  { x: -6.5, y: 1.5, kind: 1 },
  { x: 1.5, y: 6.5, kind: -1 },
  { x: -1.5, y: -6.5, kind: 1 },
  { x: 6.5, y: -0.5, kind: -1 },
  { x: -2.5, y: -1, kind: 1 },
  { x: 2.5, y: 2, kind: -1 },
] as const

/** The guesses it starts from: two weights and a bias, each wrong in its own way. */
const GUESSES = [
  [0.9, -0.9, 0.2],
  [-0.2, 1, -0.3],
  [0.3, 1, 0.1],
] as const

const SAMPLE_SCALE = 1.15

function buildSplit(): Program {
  const beats: Beat<SplitState>[] = []
  let heading = 0

  for (const guess of GUESSES) {
    let a: number = guess[0]
    let b: number = guess[1]
    let c: number = guess[2]
    const hold = (ms: number, wrong: number | null, learned = false) => {
      const length = a * a + b * b
      /* A line has no front, so turn it whichever way is the shorter. */
      let angle = (Math.atan2(-a, b) * 180) / Math.PI
      while (angle - heading > 90) angle -= 180
      while (angle - heading < -90) angle += 180
      heading = angle
      beats.push({
        state: {
          x: round(12 - ((c * a) / length) * 8 * SAMPLE_SCALE),
          y: round(12 - ((c * b) / length) * 8 * SAMPLE_SCALE),
          angle: round(angle),
          wrong,
          learned,
        },
        hold: ms,
      })
    }

    hold(520, null)
    /*
     * The perceptron rule: go through the points, and every time one is on
     * the wrong side, lean the line towards it. If the two kinds can be
     * parted by a line at all, this is guaranteed to find one and stop.
     */
    for (let clean = false; !clean;) {
      clean = true
      SAMPLES.forEach((sample, index) => {
        const side = (a * sample.x) / 8 + (b * sample.y) / 8 + c
        if (sample.kind * side > 0) return
        clean = false
        hold(230, index)
        a += (sample.kind * sample.x * 0.6) / 8
        b += (sample.kind * sample.y * 0.6) / 8
        c += sample.kind * 0.25
        hold(430, null)
      })
    }
    hold(1250, null, true)
  }

  const rest = beats.find((beat) => beat.state.learned)!.state

  return program(beats, rest, 2, (state, clock) => (
    <>
      {/* A nested drawing clips what is in it, so the line ends at the frame. */}
      <svg x={1.5} y={1.5} width={21} height={21} viewBox="1.5 1.5 21 21">
        <line
          x1={-18}
          x2={18}
          stroke="currentColor"
          strokeWidth={1.3}
          style={{
            transform: `translate(${state.x}px, ${state.y}px) rotate(${state.angle}deg)`,
            opacity: state.learned ? 1 : 0.5,
            transition: `transform ${clock(420)} ${IN_OUT}, opacity ${clock(220)} linear`,
          }}
        />
      </svg>
      {SAMPLES.map((sample, index) => (
        <circle
          key={index}
          cx={round(12 + sample.x * SAMPLE_SCALE)}
          cy={round(12 + sample.y * SAMPLE_SCALE)}
          r={sample.kind === 1 ? 1.6 : 1.15}
          fill={sample.kind === 1 ? "currentColor" : "none"}
          stroke={sample.kind === 1 ? "none" : "currentColor"}
          strokeWidth={1.1}
          style={{
            ...CENTRED,
            transform: `scale(${state.wrong === index ? 1.5 : 1})`,
            transition: `transform ${clock(220)} ${SEAT}`,
          }}
        />
      ))}
    </>
  ))
}

/* ----------------------------------------------------------------------------
 * Pascal — eight rows of Pascal's triangle, odd and even
 * ------------------------------------------------------------------------- */

const PASCAL_ROWS = 8

function buildPascal(): Program {
  /* Each entry is the sum of the two above it. Only whether it is odd is kept. */
  const odd: boolean[][] = []
  for (let row = 0; row < PASCAL_ROWS; row += 1) {
    const above = odd[row - 1]
    odd.push(
      Array.from({ length: row + 1 }, (_, index) =>
        above ? (above[index - 1] ?? false) !== (above[index] ?? false) : true
      )
    )
  }

  /* The state is how many rows have been worked out. */
  const beats: Beat<number>[] = [{ state: 0, hold: 400 }]
  for (let rows = 1; rows <= PASCAL_ROWS; rows += 1) {
    beats.push({ state: rows, hold: rows === PASCAL_ROWS ? 1250 : 200 })
  }

  return program(beats, PASCAL_ROWS, 5, (rows, clock) =>
    odd.flatMap((entries, row) =>
      entries.map((isOdd, index) => {
        const known = row < rows
        const wait = clock(index * 26)
        return (
          <circle
            key={`${row}-${index}`}
            cx={round(12 + (index - row / 2) * 2.75)}
            cy={round(3.6 + row * 2.4)}
            r={1.05}
            style={{
              ...CENTRED,
              opacity: known ? (isOdd ? 1 : 0.13) : 0,
              transform: `scale(${known ? 1 : 0.4})`,
              transition: [
                `opacity ${clock(170)} linear ${known ? wait : "0ms"}`,
                `transform ${clock(240)} ${SEAT} ${known ? wait : "0ms"}`,
              ].join(", "),
            }}
          />
        )
      })
    )
  )
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
  bisect: buildBisect(),
  queens: buildQueens(),
  sieve: buildSieve(),
  josephus: buildJosephus(),
  modulo: buildModulo(),
  hull: buildHull(),
  monte: buildMonte(),
  hail: buildHail(),
  euclid: buildEuclid(),
  hilbert: buildHilbert(),
  slide: buildSlide(),
  match: buildMatch(),
  split: buildSplit(),
  pascal: buildPascal(),
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
