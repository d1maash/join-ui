"use client"

import * as React from "react"
import { motion, useInView } from "motion/react"

import { cn } from "@/lib/utils"

/**
 * The tempo, in milliseconds. Every number the movement uses is one of these,
 * so a slower or quicker copy is a matter of overriding one or two of them
 * rather than of touching the movement itself.
 */
export interface CarbonCopyTiming {
  /** Before anything starts. */
  delay: number
  /** How long the first line takes to ink up from a hairline. */
  ink: number
  /** How long a copy takes to travel down one line and seat. */
  copy: number
  /** How long a word takes to turn over in its window. */
  roll: number
  /** The beat between one movement ending and the next beginning. */
  pause: number
}

export type CarbonCopyElement = "h1" | "h2" | "h3" | "h4" | "p" | "div"

export interface CarbonCopyProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  /**
   * The lines, in the order they are made. The first is set; each one after it
   * is a copy of the one before, with the words that differ turned over.
   */
  lines: readonly string[]
  /** The element the lines are set in. */
  as?: CarbonCopyElement
  /** Which edge the lines hang from. */
  align?: "start" | "center" | "end"
  /** Whether the first line inks up from a hairline, or is simply there. */
  ink?: boolean
  /** The weight the ink starts from. Only a variable font can draw the ones between. */
  inkFrom?: number
  /** The weight the lines rest at, and the ink ends at. */
  weight?: number
  /** Play when scrolled into view, or as soon as the component mounts. */
  trigger?: "view" | "mount"
  timing?: Partial<CarbonCopyTiming>
  /** Fires once the last copy has seated, so what follows can be cued from it. */
  onComplete?: () => void
}

const TIMING: CarbonCopyTiming = {
  delay: 0,
  ink: 1100,
  copy: 800,
  roll: 550,
  pause: 150,
}

/** The beat before the first line starts to ink. */
const LEAD = 150

/**
 * How far into a copy's travel its word starts to turn. Late enough that the
 * copy has come clear of the line it was taken from, early enough that the
 * turn is finished as the copy seats.
 */
const ROLL_LEAD = 200

const EXPO = [0.16, 1, 0.3, 1] as const
const SOFT_OUT = [0.22, 1, 0.36, 1] as const
const SOFT_IN_OUT = [0.65, 0, 0.35, 1] as const

/**
 * The seat.
 *
 * Damped to about three quarters of critical — one soft overshoot, so a copy
 * travels past its line by a few pixels and settles back onto it. A tween
 * arriving exactly on its mark reads as a picture being slid into place; this
 * reads as a thing being set down, which is what a copy is.
 */
const SEAT = { type: "spring", stiffness: 190, damping: 20, mass: 1 } as const

/**
 * The window a word turns over in.
 *
 * Its top edge is nearly hard — just above this line's capitals, just below
 * the previous line's descenders — because the word above is the original and
 * nothing may cross it. Its bottom edge is a soft fade into the space below,
 * where nothing has been set yet, and the old word leaves through that. In
 * ems, so the window is drawn at whatever size the type is.
 */
const WINDOW =
  "linear-gradient(to bottom, transparent 0.06em, #000 0.12em, #000 calc(100% - 0.16em), transparent)"

const ALIGN = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
} as const

const STILL = "(prefers-reduced-motion: reduce)"

/**
 * Whether motion has been turned down, read in a way the server can agree
 * with. With the preference set this component renders a different tree —
 * finished lines, no windows — so it cannot take the answer from a hook that
 * knows it on the client's first render and not on the server's: the two
 * would disagree and React would throw the server's markup away. A store with
 * a server snapshot of "no" hydrates cleanly and then re-renders still.
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

/** One piece of a copy: a word kept, or a word turned over from another. */
interface Segment {
  text: string
  /** The word this one replaces. Absent when the word is unchanged. */
  from?: string
}

/**
 * What changes between one line and the next, word by word.
 *
 * Two lines of the same length turn over only the words that differ, each in
 * its own window; two lines of different lengths turn over as a whole, in one
 * window the width of the line, because there is no honest way to pair their
 * words up.
 */
function diff(prev: string, next: string): Segment[] {
  const a = prev.split(" ")
  const b = next.split(" ")
  if (a.length !== b.length) return [{ text: next, from: prev }]
  return b.map((word, index) =>
    word === a[index] ? { text: word } : { text: word, from: a[index] }
  )
}

/**
 * Carbon Copy.
 *
 * A line of type that is set, and then copied. The first line inks — the
 * weight of the letters rises from the thinnest cut of the face to the one
 * the line rests at, so the words are seen to fill rather than to appear.
 * Then a copy is taken: the next line starts exactly on top of the first,
 * identical to it, and travels down one line to its place, lifting a little
 * on the way and seating with a spring. While it travels, the words that
 * differ turn over in windows — the old word rolls down and out, the new one
 * drops in from above, the way a counter turns — so the copy lands already
 * reading as the next line. A third line is a copy of the second, and so on.
 *
 * It is made for the sentence a product opens with, where the second line is
 * a revision of the first: copy, keep; build fast, build right. The movement
 * is the meaning, which is what keeps it from being an effect.
 *
 * How the copy lies on the original
 * ----------------------------------
 * A window is as wide as the word it shows first, measured from the rendered
 * glyphs, so a copy that still reads as the line above it is laid out exactly
 * as that line is — to the pixel, in any face, at any size. As the new word
 * drops in the window is drawn to that word's width, so the finished line is
 * set the way it would have been set on its own. The waiting word is parked
 * above the window from the start and hidden by its edge until its turn.
 *
 * Under `prefers-reduced-motion` nothing moves and nothing is measured: every
 * line is rendered in its finished state, the outgoing words are not rendered
 * at all, and `onComplete` fires at once so what is cued from it still runs.
 */
export function CarbonCopy({
  lines,
  as = "h1",
  align = "center",
  ink = true,
  inkFrom = 100,
  weight = 600,
  trigger = "view",
  timing,
  onComplete,
  className,
  style,
  ...rest
}: CarbonCopyProps) {
  const ref = React.useRef<HTMLElement>(null)
  const still = React.useSyncExternalStore(subscribeStill, readStill, stillOnServer)
  const inView = useInView(ref, { once: true, amount: 0.6 })

  const active = trigger === "mount" || inView

  const t: CarbonCopyTiming = { ...TIMING, ...timing }
  const inking = ink && !still

  /*
   * The plan: when each thing happens, in milliseconds from the start. The
   * first copy is taken a beat after the ink has dried; each copy after that,
   * a beat after the one before it has seated.
   */
  const inkAt = t.delay + (inking ? LEAD : 0)
  const copies: Array<{ copyAt: number; rollAt: number }> = []
  let cursor = inking ? inkAt + t.ink : t.delay
  for (let index = 1; index < lines.length; index += 1) {
    const copyAt = cursor + t.pause
    copies.push({ copyAt, rollAt: copyAt + ROLL_LEAD })
    cursor = copyAt + t.copy
  }

  /*
   * When nothing will animate — motion turned down, or a single line with no
   * ink — there is no last movement to fire the callback from, so it fires
   * here, the moment the component would have started. Once: the callback is
   * a cue, and a parent that re-renders on it must not be cued again.
   */
  const silent = still || (!inking && lines.length < 2)
  const cued = React.useRef(false)
  React.useEffect(() => {
    if (!active || !silent || cued.current) return
    cued.current = true
    onComplete?.()
  }, [active, silent, onComplete])

  const last = lines.length - 1

  return React.createElement(
    as,
    {
      ref,
      className: cn("relative", ALIGN[align], className),
      style: { fontWeight: weight, ...style },
      ...rest,
    },
    lines.map((line, index) =>
      index === 0 ? (
        <FirstLine
          key={index}
          text={line}
          ink={inking}
          inkFrom={inkFrom}
          weight={weight}
          at={inkAt}
          duration={t.ink}
          active={active}
          onDone={last === 0 ? onComplete : undefined}
        />
      ) : (
        <CopyLine
          key={index}
          segments={diff(lines[index - 1]!, line)}
          copyAt={copies[index - 1]!.copyAt}
          rollAt={copies[index - 1]!.rollAt}
          copy={t.copy}
          roll={t.roll}
          active={active}
          still={still}
          onDone={index === last ? onComplete : undefined}
        />
      )
    )
  )
}

/**
 * The first line, inking.
 *
 * It appears as a hairline in its first fifth and fills over the rest, on the
 * in-out curve — ink flows, then settles. The weight is a number, so on a
 * variable font every frame is a real cut; on a static face the browser picks
 * the nearest one it has, which is a step rather than a fill, and the honest
 * thing to do there is pass `ink={false}`.
 */
function FirstLine({
  text,
  ink,
  inkFrom,
  weight,
  at,
  duration,
  active,
  onDone,
}: {
  text: string
  ink: boolean
  inkFrom: number
  weight: number
  at: number
  duration: number
  active: boolean
  onDone?: () => void
}) {
  if (!ink) return <span className="block">{text}</span>

  const appear = duration * 0.2

  return (
    <motion.span
      className="block"
      initial={{ opacity: 0, fontWeight: inkFrom }}
      animate={
        active
          ? { opacity: 1, fontWeight: weight }
          : { opacity: 0, fontWeight: inkFrom }
      }
      transition={{
        opacity: { delay: at / 1000, duration: appear / 1000, ease: SOFT_OUT },
        fontWeight: {
          delay: (at + appear) / 1000,
          duration: (duration - appear) / 1000,
          ease: SOFT_IN_OUT,
        },
      }}
      onAnimationComplete={active ? onDone : undefined}
    >
      {text}
    </motion.span>
  )
}

/**
 * A copy, taken and set down.
 *
 * It starts one line-height up — exactly over the line it is a copy of, on
 * the same pixels — and is let down to its place on the seat spring. Two
 * movements on two curves: the travel seats, and the lift is a swell in the
 * middle of the travel that is gone by the time it lands, so the copy reads
 * as picked up, carried and put down. It is kept out of sight until its time,
 * because it is set at full weight and would show through the hairline the
 * first line is inking up from.
 */
function CopyLine({
  segments,
  copyAt,
  rollAt,
  copy,
  roll,
  active,
  still,
  onDone,
}: {
  segments: Segment[]
  copyAt: number
  rollAt: number
  copy: number
  roll: number
  active: boolean
  still: boolean
  onDone?: () => void
}) {
  if (still) {
    return <span className="block">{segments.map((s) => s.text).join(" ")}</span>
  }

  const rest = { opacity: 0, y: "-100%", scale: 1 }

  return (
    <motion.span
      className="block"
      initial={rest}
      animate={active ? { opacity: 1, y: "0%", scale: [1, 1.028, 1] } : rest}
      transition={{
        opacity: { delay: copyAt / 1000, duration: 0 },
        y: { delay: copyAt / 1000, ...SEAT },
        scale: {
          delay: copyAt / 1000,
          duration: copy / 1000,
          times: [0, 0.4, 1],
          ease: "easeInOut",
        },
      }}
      onAnimationComplete={active ? onDone : undefined}
    >
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          {index > 0 ? " " : null}
          {segment.from === undefined ? (
            segment.text
          ) : (
            <Window
              from={segment.from}
              to={segment.text}
              at={rollAt}
              duration={roll}
              active={active}
            />
          )}
        </React.Fragment>
      ))}
    </motion.span>
  )
}

/** A word in its window: its own width, never wrapped, laid at the left edge. */
const WORD: React.CSSProperties = {
  gridArea: "1 / 1",
  justifySelf: "start",
  width: "max-content",
  whiteSpace: "nowrap",
}

/**
 * The window one word turns over in.
 *
 * Both words share one grid cell. The window is drawn to the outgoing word's
 * measured width until its turn, and to the incoming word's as it drops in;
 * the widths come from the rendered glyphs, re-read when the fonts land and
 * whenever the type is resized. Once the turn is over the old word is gone
 * from the tree and the edges come off, so a resting line is plain text.
 */
function Window({
  from,
  to,
  at,
  duration,
  active,
}: {
  from: string
  to: string
  at: number
  duration: number
  active: boolean
}) {
  const fromRef = React.useRef<HTMLSpanElement>(null)
  const toRef = React.useRef<HTMLSpanElement>(null)
  const [widths, setWidths] = React.useState<{ from: number; to: number } | null>(null)
  const [done, setDone] = React.useState(false)

  React.useEffect(() => {
    if (done) return

    const measure = () => {
      const a = fromRef.current
      const b = toRef.current
      if (!a || !b) return
      setWidths({
        from: a.getBoundingClientRect().width,
        to: b.getBoundingClientRect().width,
      })
    }

    measure()
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure).catch(() => {})
    }

    const observer = new ResizeObserver(measure)
    if (toRef.current) observer.observe(toRef.current)
    return () => observer.disconnect()
  }, [done])

  const turning = active && widths !== null

  return (
    <span
      style={{
        display: "inline-grid",
        padding: "0 0 0.3em",
        margin: "0 0 -0.3em",
        width: done ? undefined : turning ? widths.to : (widths?.from ?? undefined),
        transition: done
          ? undefined
          : `width ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${at}ms`,
        WebkitMaskImage: done ? undefined : WINDOW,
        maskImage: done ? undefined : WINDOW,
      }}
    >
      {done ? null : (
        <motion.span
          aria-hidden="true"
          ref={fromRef}
          style={WORD}
          initial={{ y: "0%" }}
          animate={active ? { y: "135%" } : { y: "0%" }}
          transition={{ delay: at / 1000, duration: duration / 1000, ease: EXPO }}
        >
          {from}
        </motion.span>
      )}
      <motion.span
        ref={toRef}
        style={WORD}
        initial={{ y: "-135%" }}
        animate={active ? { y: "0%" } : { y: "-135%" }}
        transition={{ delay: at / 1000, duration: duration / 1000, ease: EXPO }}
        onAnimationComplete={active ? () => setDone(true) : undefined}
      >
        {to}
      </motion.span>
    </span>
  )
}
