"use client"

import * as React from "react"
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react"

import { cn } from "@/lib/utils"

export interface FocusStackItem {
  /** Stable identity for the rendered list item. */
  id: string
  label: string
  /** Second line, revealed only while the item holds focus. */
  description?: string
  /** Drawn inside the badge. Sized by the component, so pass a bare icon. */
  icon?: React.ReactNode
  /** Any CSS colour. Fills the badge; the glyph on top stays near-white. */
  accent?: string
}

/**
 * The colour a glyph takes on a filled badge. Held as a fallback rather than a
 * literal so a consumer whose accents are pale can redeclare it once, in CSS,
 * instead of threading a second colour through every item.
 */
const ON_ACCENT = "var(--focus-stack-glyph, oklch(0.985 0.002 90))"

/**
 * Geometry is carried in pixels, not in classes, because the stack positions
 * every item itself: the lane between two ranks and the height of the frame are
 * both arithmetic on `step`, and neither survives being expressed as a utility.
 */
const SIZES = {
  sm: {
    height: 56,
    step: 59,
    frame: "max-w-sm",
    pill: "gap-3 pl-2.5 pr-5",
    badge: "size-9 rounded-[0.6rem]",
    glyph: "size-4",
    label: "text-[0.9375rem]",
    description: "text-[0.75rem]",
  },
  md: {
    height: 72,
    step: 76,
    frame: "max-w-md",
    pill: "gap-3.5 pl-3 pr-7",
    badge: "size-11 rounded-[0.8rem]",
    glyph: "size-5",
    label: "text-[1.125rem]",
    description: "text-[0.8125rem]",
  },
  lg: {
    height: 88,
    step: 93,
    frame: "max-w-lg",
    pill: "gap-4 pl-3.5 pr-8",
    badge: "size-13 rounded-[0.95rem]",
    glyph: "size-6",
    label: "text-[1.375rem]",
    description: "text-sm",
  },
} as const

/**
 * How much the first rank shrinks, and how much faster every rank after it
 * does. The exponent is the difference between a stack that steps back evenly
 * and one that recedes: linear shrinking flattens out into a ladder, while a
 * little curve keeps the far ranks visibly further away than the near ones.
 */
const SCALE_STEP = 0.07
const SCALE_CURVE = 1.2
const MIN_SCALE = 0.62

/**
 * Exponent on the lane offset. Below 1 it spreads the near ranks and packs the
 * far ones, so the pills draw together as they recede — which, with the lane
 * itself barely taller than a pill, is what closes the outer ranks up into a
 * coil instead of leaving them as a list with gaps.
 */
const LANE_CURVE = 0.86

/**
 * Exponent on the fade. Below 1 it holds a rank's opacity up and then drops it
 * away at the edge, which is what keeps the top and bottom pills legible — the
 * far ranks are meant to read as further off, not as nearly deleted.
 */
const FADE_CURVE = 0.55

/**
 * The turn.
 *
 * Damped to about 0.86 of critical, which is one soft overshoot: the coil
 * arrives, leans a hair past its mark and settles. Exactly critical stops the
 * stack dead the instant it gets there, and a thing with mass does not do that
 * — the overshoot is the only cue that the pills were carried into place
 * rather than assigned to it.
 */
const SPRING = { stiffness: 150, damping: 20, mass: 0.9 } as const
/** Stiffer and better damped: this one only takes the grain out of a scrollbar. */
const SCROLL_SPRING = { stiffness: 240, damping: 42, mass: 0.6 } as const
/** A press and a hover: quick, and barely overshooting. */
const PRESS = { type: "spring", stiffness: 460, damping: 32, mass: 0.6 } as const

/**
 * Inertia.
 *
 * Ranks per second at which the coil reaches its full stretch, and how far it
 * stretches when it gets there. A stack that turns fast and holds its shape
 * reads as a list being re-sorted; the same stack drawn a few percent long
 * along its travel and narrow across it reads as something with weight being
 * swung — which is what the component is claiming to be. Small numbers on
 * purpose: past about 5% this stops being physics and starts being an effect.
 */
const LIQUID_AT = 9
const LIQUID_STRETCH = 0.05

export interface FocusStackProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  items: FocusStackItem[]
  /**
   * `auto` advances on a timer and takes clicks and arrow keys; `scroll` hands
   * the focus over to the page, so the stack turns as the reader scrolls past.
   */
  mode?: "auto" | "scroll"
  /** Controlled focus. Leave unset to let the component hold it. */
  index?: number
  defaultIndex?: number
  /** Fires with the focused index in both modes. */
  onIndexChange?: (index: number) => void
  /** Milliseconds between advances in `auto` mode. */
  interval?: number
  /** Wrap past the ends. Defaults to true in `auto` mode, false in `scroll`. */
  loop?: boolean
  /** Externally held pause, for a control you own. */
  paused?: boolean
  /** Ranks drawn either side of the focused item. */
  depth?: number
  size?: "sm" | "md" | "lg"
  /** Degrees of tilt per rank. Negative twists the stack the other way. */
  tilt?: number
  /** Pixels of blur per rank. `0` drops the filter, and the repaint with it. */
  blur?: number
  /** Whether an item can be clicked or arrowed into focus. */
  interactive?: boolean
  /** Accessible name of the list. */
  label?: string
}

/**
 * A coil of pills with one of them in focus.
 *
 * Everything is a function of a single number — the distance from an item to
 * the focused position — so the same drawing serves both modes: rank by rank
 * the pills shrink, fade, blur and twist away from the centre, and the one in
 * focus straightens out, comes back to full size and lifts off the page.
 *
 * That number is fractional, which is the point. Nothing snaps between states:
 * two pills can straddle the centre mid-turn, half-focused each. `auto` drives
 * it with a spring on a timer, `scroll` maps it to the stack's own transit
 * through the viewport.
 *
 * Two things are read off its rate of change rather than its value. While the
 * coil is genuinely turning, every pill stretches a little along its travel and
 * narrows across it — area roughly conserved, the way something with weight
 * behaves when it is swung — and at rest both terms are exactly 1, so the stack
 * is a still drawing again. An interactive pill also answers the hand: it lifts
 * under the cursor and gives under the press, which is what tells a reader
 * which of nine overlapping shapes they are actually on.
 */
export function FocusStack({
  items,
  mode = "auto",
  index,
  defaultIndex = 0,
  onIndexChange,
  interval = 2600,
  loop,
  paused = false,
  depth = 3,
  size = "md",
  tilt = 5,
  blur = 0.55,
  interactive,
  label = "Highlights",
  className,
  style,
  ...props
}: FocusStackProps) {
  const count = items.length
  const scale = SIZES[size]
  const reduceMotion = useReducedMotion()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([])

  const wrapped = loop ?? mode === "auto"
  const isInteractive = interactive ?? mode === "auto"

  /*
   * Wrapping puts the tail of the list above the head, so an item is only ever
   * in one place if the stack is at least as deep as it is wide. Rather than
   * refusing a short list, the depth comes down to fit it.
   */
  const ranks = Math.max(
    1,
    Math.min(depth, wrapped ? Math.floor((count - 1) / 2) : count - 1)
  )
  const frameHeight = scale.step * 2 * ranks + scale.height

  const [internal, setInternal] = React.useState(() => normalise(defaultIndex, count, false))
  const active = normalise(index ?? internal, count, wrapped)

  const select = React.useCallback(
    (next: number) => {
      const target = normalise(next, count, wrapped)
      if (index === undefined) setInternal(target)
      onIndexChange?.(target)
    },
    [count, index, onIndexChange, wrapped]
  )

  /*
   * The focused index wraps; the value the stack animates does not. It runs
   * away from zero for as long as the carousel turns, so that stepping from the
   * last item to the first is one more step forward rather than a rewind back
   * through everything in between.
   */
  const cursor = useMotionValue(active)
  const settled = React.useRef(active)

  React.useEffect(() => {
    if (settled.current === active) return
    const delta = wrapped
      ? shortestDelta(active - settled.current, count)
      : active - settled.current
    settled.current = active
    cursor.set(cursor.get() + delta)
  }, [active, count, cursor, wrapped])

  const stepped = useSpring(cursor, SPRING)

  /*
   * Scroll mode reads the stack's own transit rather than the page's, so it
   * works wherever it is dropped — in a section, in a card, in a preview frame.
   * The window is pulled in from the viewport edges so the turn happens while
   * the stack is actually being looked at.
   */
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start 0.85", "end 0.15"],
  })
  const scrolled = useTransform(scrollYProgress, [0, 1], [0, Math.max(count - 1, 0)])
  const eased = useSpring(scrolled, SCROLL_SPRING)

  const position = React.useMemo(() => {
    if (mode === "scroll") return reduceMotion ? scrolled : eased
    return reduceMotion ? cursor : stepped
  }, [cursor, eased, mode, reduceMotion, scrolled, stepped])

  /*
   * How hard the coil is turning, in ranks per second, normalised to 0…1 and
   * derived once here rather than per row: every pill reads the same number and
   * every one of them is on the compositor, so a nine-item stack costs one
   * velocity and nine transforms a frame. Zeroed under reduced motion, which
   * takes the stretch out downstream without a single conditional there.
   */
  const velocity = useVelocity(position)
  const urgency = useTransform(velocity, (value) =>
    reduceMotion ? 0 : Math.min(1, Math.abs(value) / LIQUID_AT)
  )

  /* Scroll mode owns no index of its own, so the list reports where it landed. */
  React.useEffect(() => {
    if (mode !== "scroll") return
    return position.on("change", (value) => {
      const nearest = normalise(Math.round(value), count, false)
      if (nearest === settled.current) return
      settled.current = nearest
      if (index === undefined) setInternal(nearest)
      onIndexChange?.(nearest)
    })
  }, [count, index, mode, onIndexChange, position])

  const [hovering, setHovering] = React.useState(false)
  const [holdingFocus, setHoldingFocus] = React.useState(false)
  const inView = useInView(rootRef, { amount: 0.35 })

  /*
   * Autoplay stops for anyone who has asked motion to stop, for a stack nobody
   * is looking at, and for a pointer or a caret resting on it — the last two
   * being the pause mechanism WCAG 2.2.2 wants, alongside the `paused` prop for
   * a control of your own.
   */
  const running =
    mode === "auto" &&
    count > 1 &&
    !paused &&
    !hovering &&
    !holdingFocus &&
    !reduceMotion &&
    inView &&
    (wrapped || active < count - 1)

  const activeRef = React.useRef(active)
  React.useEffect(() => {
    activeRef.current = active
  }, [active])

  React.useEffect(() => {
    if (!running) return
    const id = window.setInterval(
      () => select(activeRef.current + 1),
      Math.max(600, interval)
    )
    return () => window.clearInterval(id)
  }, [interval, running, select])

  function handleKeyDown(event: React.KeyboardEvent<HTMLOListElement>) {
    if (!isInteractive) return

    let next: number | null = null
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = active + 1
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = active - 1
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = count - 1
    if (next === null) return

    event.preventDefault()
    const target = normalise(next, count, wrapped)
    select(target)
    itemRefs.current[target]?.focus()
  }

  if (count === 0) return null

  return (
    <div
      ref={rootRef}
      className={cn("relative isolate mx-auto w-full", scale.frame, className)}
      style={{ height: frameHeight, ...style }}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocusCapture={() => setHoldingFocus(true)}
      onBlurCapture={() => setHoldingFocus(false)}
      {...props}
    >
      <ol
        aria-label={label}
        className="absolute inset-0 list-none"
        onKeyDown={handleKeyDown}
      >
        {items.map((item, itemIndex) => (
          <Row
            key={item.id}
            item={item}
            index={itemIndex}
            count={count}
            position={position}
            urgency={urgency}
            still={Boolean(reduceMotion)}
            wrapped={wrapped}
            ranks={ranks}
            tilt={tilt}
            blur={blur}
            scale={scale}
            active={itemIndex === active}
            interactive={isInteractive}
            onSelect={select}
            register={(node) => {
              itemRefs.current[itemIndex] = node
            }}
          />
        ))}
      </ol>
    </div>
  )
}

/**
 * One pill, and the whole visual language of the component.
 *
 * Every property it animates is derived from `distance`, so the row has no
 * state and no transitions of its own — it is a pure projection of where the
 * stack currently sits, which is what lets a fractional position render as a
 * half-turn instead of as a step.
 */
function Row({
  item,
  index,
  count,
  position,
  urgency,
  still,
  wrapped,
  ranks,
  tilt,
  blur,
  scale,
  active,
  interactive,
  onSelect,
  register,
}: {
  item: FocusStackItem
  index: number
  count: number
  position: MotionValue<number>
  urgency: MotionValue<number>
  /** Reduced motion, answered once by the stack and passed down. */
  still: boolean
  wrapped: boolean
  ranks: number
  tilt: number
  blur: number
  scale: (typeof SIZES)[keyof typeof SIZES]
  active: boolean
  interactive: boolean
  onSelect: (index: number) => void
  register: (node: HTMLButtonElement | null) => void
}) {
  const distance = useTransform(position, (value) =>
    wrapped ? shortestDelta(index - value, count) : index - value
  )

  const y = useTransform(
    distance,
    (d) => Math.sign(d) * Math.abs(d) ** LANE_CURVE * scale.step
  )
  const scaleValue = useTransform(distance, (d) =>
    Math.max(MIN_SCALE, 1 - Math.abs(d) ** SCALE_CURVE * SCALE_STEP)
  )
  /*
   * Zero is reached at `fade`, which is capped at the wrap boundary of
   * `count / 2` — so the frame in which an item leaves the top of the stack and
   * reappears at the bottom is never a frame anyone can see. A list long enough
   * to keep that boundary out of the way gets the gentler ramp of `ranks + 1`.
   */
  const fade = wrapped ? Math.min(ranks + 1, count / 2) : ranks + 1
  const opacity = useTransform(distance, (d) =>
    Math.max(0, 1 - Math.min(Math.abs(d) / fade, 1)) ** FADE_CURVE
  )
  /*
   * Unsigned, so both ends of the stack twist the same way and the focused pill
   * is the only level one — it straightens as it arrives and leans again as it
   * leaves, which reads as a coil turning rather than as a hand of cards.
   */
  const rotate = useTransform(distance, (d) => Math.min(Math.abs(d), ranks) * tilt)
  const filter = useTransform(
    distance,
    (d) => `blur(${(Math.min(Math.abs(d), ranks) * blur).toFixed(2)}px)`
  )
  const zIndex = useTransform(distance, (d) => 100 - Math.round(Math.abs(d) * 10))
  /* A pill faded out of the stack must not still be catching clicks. */
  const pointerEvents = useTransform(opacity, (value) =>
    value > 0.08 ? "auto" : "none"
  )

  /** 1 at the centre, 0 a full rank away — the lift, and the second line. */
  const focus = useTransform(distance, (d) => Math.max(0, 1 - Math.abs(d)))
  const detail = useTransform(distance, (d) => Math.max(0, 1 - Math.abs(d) * 2))

  /*
   * The stretch, along the lane and across it, conserving area the way a drop
   * of something does: what the pill gains in height it gives back in width.
   * It exists only while the coil is actually turning — at rest `urgency` is
   * zero, both terms are exactly 1, and the stack is a still drawing.
   */
  const stretchY = useTransform(urgency, (u) => 1 + u * LIQUID_STRETCH)
  const stretchX = useTransform(urgency, (u) => 1 - u * LIQUID_STRETCH * 0.7)

  /* An accent with no glyph is a colour chip, which is a legitimate stack. */
  const badge = item.icon || item.accent ? (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        scale.badge,
        item.accent ? undefined : "bg-primary text-primary-foreground",
        "[&_svg]:size-full [&_svg]:shrink-0"
      )}
      style={
        item.accent ? { backgroundColor: item.accent, color: ON_ACCENT } : undefined
      }
    >
      <span className={cn("flex items-center justify-center", scale.glyph)}>
        {item.icon}
      </span>
    </span>
  ) : null

  const body = (
    <>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full shadow-lg"
        style={{ opacity: focus }}
      />
      {badge}
      <span className="relative flex min-w-0 flex-col justify-center">
        <span
          className={cn(
            scale.label,
            "truncate font-semibold tracking-tight text-foreground"
          )}
        >
          {item.label}
        </span>
        {item.description ? (
          <motion.span
            style={{ opacity: detail }}
            className={cn(scale.description, "truncate text-muted-foreground")}
          >
            {item.description}
          </motion.span>
        ) : null}
      </span>
    </>
  )

  /*
   * Deliberately not `overflow-hidden`: the lift is a shadow on a transparent
   * child, and it is drawn outside the pill's border box. Clipping the pill
   * would clip the only cue that the focused item is off the page.
   */
  const pill = cn(
    "relative flex h-full w-full items-center rounded-full",
    "border border-border/70 bg-card text-left",
    scale.pill
  )

  return (
    <motion.li
      className="absolute inset-x-0 top-1/2"
      style={{
        height: scale.height,
        marginTop: -scale.height / 2,
        y,
        scale: scaleValue,
        rotate,
        opacity,
        zIndex,
        pointerEvents,
        ...(blur > 0 ? { filter } : {}),
      }}
    >
      {/*
        The stretch rides its own box. The list item is already carrying five
        properties driven off `distance`, and a scale written there would be
        multiplied into the rank's own scale — the pill would grow as well as
        stretch. On a box of its own the two compose the way they should.
      */}
      <motion.div
        className="size-full"
        style={{ scaleX: stretchX, scaleY: stretchY }}
      >
        {interactive ? (
          <motion.button
            ref={register}
            type="button"
            /* Roving tabindex: the stack is one stop, and the arrows move inside it. */
            tabIndex={active ? 0 : -1}
            aria-current={active ? "true" : undefined}
            onClick={() => onSelect(index)}
            /*
             * Answers the hand. A pill that can be clicked and gives nothing
             * back on the way down is the single loudest tell that a carousel
             * is a picture of a control rather than a control — and the hover
             * is what tells a reader which of nine overlapping shapes the
             * cursor is actually on.
             */
            whileHover={still ? undefined : { scale: 1.025 }}
            whileTap={still ? undefined : { scale: 0.975 }}
            transition={PRESS}
            className={cn(
              pill,
              "cursor-pointer",
              "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
              "hover:border-border-hover",
              "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            )}
          >
            {body}
          </motion.button>
        ) : (
          <div aria-current={active ? "true" : undefined} className={pill}>
            {body}
          </div>
        )}
      </motion.div>
    </motion.li>
  )
}

/** Wraps an index into range, or clamps it when the stack has ends. */
function normalise(value: number, count: number, wrapped: boolean): number {
  if (count === 0) return 0
  if (wrapped) return ((value % count) + count) % count
  return Math.min(Math.max(value, 0), count - 1)
}

/**
 * The shorter way round a ring of `count` items — the difference between the
 * stack turning one step forward and unwinding all the way back.
 */
function shortestDelta(delta: number, count: number): number {
  if (count === 0) return 0
  const half = count / 2
  let value = ((delta % count) + count) % count
  if (value > half) value -= count
  return value
}
