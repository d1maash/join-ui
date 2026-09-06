"use client"

import * as React from "react"
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"

import { cn } from "@/lib/utils"

export interface GlassCrestMark {
  /** Stable identity for the rendered list item. */
  id: string
  /** What the mark is. Read out by assistive technology, and printed under the arc. */
  label: string
  /** Drawn inside the disc. Sized by the component, so pass a bare icon element. */
  icon?: React.ReactNode
  /** Any CSS colour. Tints the glass, its rim, its cast shadow and the wash behind it. */
  accent?: string
}

/**
 * The glyph, as a fraction of the disc it stands on.
 *
 * Every position and every size inside a mark is a percentage rather than a
 * length, because the crest is fluid: the same component draws a 90px disc on a
 * phone and a 200px one on a wide monitor, and a specular highlight authored in
 * pixels for one of those is a smear on the other. Only the blurs are absolute,
 * and deliberately so — a shadow is a property of the light in the room, not of
 * how large the thing casting it happens to be rendered.
 */
const GLYPH = "42%"

/*
 * The material.
 *
 * Four custom properties rather than four props, because they are a decision
 * about the surface the component was installed onto rather than about any one
 * crest. `--glass-crest-sheen` is the light on top of the glass and is white in
 * both themes — glass is lit from above whatever colour the room is — while the
 * glyph is near-white for the same reason: it is the face of an extrusion
 * catching that light, not a piece of text.
 */
const SHEEN = "var(--glass-crest-sheen, oklch(1 0 0 / 0.55))"
const GLYPH_INK = "var(--glass-crest-glyph, oklch(0.985 0.002 90))"
const FROST =
  "var(--glass-crest-frost, color-mix(in oklab, var(--foreground) 5%, transparent))"

/** The face the quiet half of a headline is set in. Inherited unless you say otherwise. */
const QUIET_FONT = "var(--glass-crest-quiet-font, inherit)"

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * The crest assembling.
 *
 * Damped to about 0.83 of critical — one soft overshoot, so each disc rises,
 * goes a hair past its place on the arc and settles back onto it. A tween
 * arriving exactly on its mark is the tell that these are pictures being moved
 * rather than objects being set down, and this is the one moment in the section
 * where that distinction is worth paying for.
 */
const ARRIVAL = { type: "spring", stiffness: 210, damping: 24, mass: 1 } as const

/**
 * A disc answering the hand.
 *
 * Stiff and nearly critical: a lift under the cursor has to be there before the
 * eye has finished arriving, and a wobble on something the size of a hero mark
 * is a lot of wobble. Sprung rather than transitioned because a pointer running
 * along the arc leaves and enters marks faster than any fixed duration can
 * follow — a tween restarted mid-lift plays its whole length again from wherever
 * it stood, so the discs behind the cursor visibly lag it.
 */
const LIFT = { type: "spring", stiffness: 420, damping: 30, mass: 0.6 } as const

/**
 * A disc being pulled out of the pack.
 *
 * Heavier than the lift: a hover has to be instant, a drag has to feel like
 * glass with mass. The same spring brings it home, so release carries the
 * velocity it already had rather than starting a new tween from a standstill.
 */
const DRAG = { type: "spring", stiffness: 300, damping: 26, mass: 0.85 } as const

/** Pixels the pointer must travel before a press becomes a pull. */
const DRAG_THRESHOLD = 6

/**
 * A soft leash. Inside `max` the disc follows the hand; past it the extra
 * travel is taxed, so the mark never leaves the crest and never hits a wall.
 */
function leash(dx: number, dy: number, max: number) {
  const distance = Math.hypot(dx, dy)
  if (distance === 0) return { x: 0, y: 0 }
  if (distance <= max) return { x: dx, y: dy }
  const scale = (max + (distance - max) * 0.22) / distance
  return { x: dx * scale, y: dy * scale }
}

/**
 * How the rest of the pack answers one mark being pulled.
 *
 * Neighbours part along the arc — left marks give way left, right marks right —
 * and they take a little of the pull itself, the way overlapping discs would if
 * one of them were lifted out. Influence falls off by rank, so the far end of
 * the crest barely knows.
 */
function packShift(index: number, puller: number, px: number, py: number) {
  if (index === puller) return { x: px, y: py }
  const rank = Math.abs(index - puller)
  const falloff = Math.exp(-rank * 0.85)
  const along = Math.sign(index - puller)
  const reach = Math.hypot(px, py)
  return {
    x: along * reach * falloff * 0.5 + px * falloff * 0.2,
    /*
     * Neighbours sink a little as the one mark is lifted out — the pack has
     * weight, and the gap they give is not only sideways.
     */
    y: py * falloff * 0.16 + reach * falloff * 0.1,
  }
}

function packTwist(index: number, puller: number, px: number, py: number) {
  if (index === puller) return px * 0.1
  const rank = Math.abs(index - puller)
  const falloff = Math.exp(-rank * 0.85)
  return Math.sign(index - puller) * Math.hypot(px, py) * falloff * 0.055
}

/*
 * Three scales, and the only thing they really set is width.
 *
 * The crest sizes itself off its container — the discs are a percentage of the
 * arc's own box — so `size` is a max-width and a type ramp, not a pixel budget.
 * A crest given a narrower container simply draws a smaller one.
 */
const SIZES = {
  sm: {
    crest: "max-w-sm",
    copy: "max-w-md",
    headline: "text-[1.75rem] leading-[1.12] sm:text-4xl",
    description: "text-sm",
    gap: "gap-4",
  },
  md: {
    crest: "max-w-xl",
    copy: "max-w-2xl",
    headline: "text-4xl leading-[1.08] sm:text-5xl lg:text-[3.5rem]",
    description: "text-base",
    gap: "gap-5",
  },
  lg: {
    crest: "max-w-3xl",
    copy: "max-w-4xl",
    headline: "text-5xl leading-[1.05] sm:text-6xl lg:text-7xl",
    description: "text-lg",
    gap: "gap-6",
  },
} as const

export interface GlassCrestProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children" | "title"
> {
  /** The marks laid along the arc, left to right. */
  marks: GlassCrestMark[]
  /** Display type. Wrap phrases in `CrestQuiet` to set them in the second voice. */
  headline: React.ReactNode
  /** Small line above the headline. */
  eyebrow?: React.ReactNode
  /** Glyph before the eyebrow. Sized by the component. */
  eyebrowIcon?: React.ReactNode
  /** Supporting paragraph under the headline. */
  description?: React.ReactNode
  /** The call to action. `CrestAction` is the pill this was drawn with. */
  actions?: React.ReactNode
  /** Degrees the marks are laid across. Wider is a deeper bow. */
  spread?: number
  /** How far each disc laps the one before it, as a fraction of its own diameter. */
  overlap?: number
  size?: "sm" | "md" | "lg"
  /** Leans each disc along the arc, so the crest reads as one curve. */
  tilt?: boolean
  /** The crest answers the pointer. Off, it never moves after it has assembled. */
  parallax?: boolean
  /**
   * A disc can be pulled out of the pack and springs home on release.
   * Off, the marks only lift under the cursor.
   */
  drag?: boolean
  /** The wash of accent behind the arc. */
  glow?: boolean
  /** Prints the name of the mark under the cursor or the caret, beneath the arc. */
  labels?: "hover" | "none"
  /** Makes every mark a button and fires with the one that was pressed. */
  onMarkSelect?: (mark: GlassCrestMark) => void
  /** Heading level of the display type. */
  headingLevel?: 1 | 2 | 3
  /** Accessible name of the arc. */
  crestLabel?: string
  className?: string
}

/**
 * The section a product leads with: an arc of glass marks over the sentence
 * that explains them.
 *
 * The crest is drawn rather than photographed. Each mark is a disc of tinted
 * glass — a lit top edge, a shaded bottom one, a specular highlight off-centre,
 * a rim in its own accent and a shadow cast onto the page — with the glyph
 * standing on it as a relief: printed twice, once blurred and offset underneath
 * to give the extrusion its thickness. Nothing is an image, so a mark is any
 * icon you pass and any colour you name, and the whole crest recolours with the
 * page rather than being lit for one theme.
 *
 * The arc is geometry, not a layout. Give it a count and a `spread` and it
 * solves for the radius that fits the marks across their own box, the diameter
 * that laps them by `overlap`, and the aspect ratio that leaves room for the
 * bow — so the same markup draws three marks or eleven without a magic number
 * anywhere, and the crest stays fluid because every position is a percentage.
 *
 * It moves only when something moves it. It assembles on mount, apex first and
 * outward and sprung rather than tweened, so each disc rises, goes a hair past
 * its place on the arc and settles onto it — a hero arriving is the one moment
 * a page is allowed to perform, and a thing with mass does not stop dead on its
 * mark. After that it answers the pointer: the arc swings from a pivot below
 * itself and the outer marks travel further than the inner ones, which is
 * parallax rather than decoration, and the disc under the cursor lifts on a
 * spring of its own. Pull a mark and it comes out of the pack on a leash — the
 * neighbours part along the arc, and on release the same spring carries it
 * home. Given `onMarkSelect` it answers the hand as well, pressing into the
 * page and coming back; a pull that never crossed the threshold is still a
 * press. All of it is a gesture, so the section is perfectly still when nobody
 * is touching it. Under `prefers-reduced-motion` none of it happens.
 */
export function GlassCrest({
  marks,
  headline,
  eyebrow,
  eyebrowIcon,
  description,
  actions,
  spread = 150,
  overlap = 0.3,
  size = "md",
  tilt = true,
  parallax = true,
  drag = true,
  glow = true,
  labels = "hover",
  onMarkSelect,
  headingLevel = 1,
  crestLabel = "Featured",
  className,
  ...props
}: GlassCrestProps) {
  const reduceMotion = useReducedMotion()
  const animate = !reduceMotion
  const headingId = React.useId()
  const scale = SIZES[size]
  const Heading = `h${headingLevel}` as "h1"

  const arc = React.useMemo(
    () => layOut(marks.length, spread, overlap),
    [marks.length, spread, overlap]
  )

  /*
   * The pointer, normalised to -1…1 across the section and springed once here
   * rather than per mark. Every mark reads the same two values and scales them
   * by its own distance from the apex, so a seven-mark crest costs two springs
   * and seven transforms a frame — and all of them stay on the compositor.
   */
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, { stiffness: 110, damping: 24, mass: 0.7 })
  const springY = useSpring(pointerY, { stiffness: 110, damping: 24, mass: 0.7 })

  /*
   * The parallax is wired up after hydration rather than during it.
   *
   * A motion value in `style` renders as a computed transform on the client and
   * as nothing at all on the server, which is a hydration mismatch for a crest
   * that has not moved yet. Nothing is lost by waiting: a pointer cannot be
   * over an element that has not been painted.
   */
  const live = useHydrated() && parallax && animate
  const canDrag = useHydrated() && drag && animate

  const swing = useTransform(springX, (value) => value * 2.4)
  const driftX = useTransform(springX, (value) => value * 10)
  const driftY = useTransform(springY, (value) => value * 7)

  /*
   * The pull is one pair of springs for the whole crest. The mark under the
   * hand reads them as its own offset; every other mark reads a falloff of the
   * same values, so the pack parts in lockstep without a spring per disc.
   */
  const pullTargetX = useMotionValue(0)
  const pullTargetY = useMotionValue(0)
  const pullX = useSpring(pullTargetX, DRAG)
  const pullY = useSpring(pullTargetY, DRAG)
  const pullerMv = useMotionValue(0)
  const [puller, setPuller] = React.useState(0)
  const [held, setHeld] = React.useState(false)
  const [aloft, setAloft] = React.useState(false)
  const heldRef = React.useRef(false)

  /*
   * The hand lets go in one frame; the disc is still in the air. `held` is the
   * pointer, `aloft` is the seat — we only put the mark down once the spring
   * has actually arrived, so the lift, the stacking order and the caption do
   * not drop off it halfway home.
   */
  function seatIfHome() {
    if (heldRef.current) return
    if (Math.hypot(pullX.get(), pullY.get()) > 1.2) return
    setAloft(false)
  }

  useMotionValueEvent(pullX, "change", seatIfHome)
  useMotionValueEvent(pullY, "change", seatIfHome)

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!live || held) return
    const box = event.currentTarget.getBoundingClientRect()
    if (box.width === 0 || box.height === 0) return
    pointerX.set(((event.clientX - box.left) / box.width) * 2 - 1)
    pointerY.set(((event.clientY - box.top) / box.height) * 2 - 1)
  }

  function handlePointerLeave() {
    pointerX.set(0)
    pointerY.set(0)
  }

  /** Which mark is under the cursor or the caret — the caption reads this. */
  const [active, setActive] = React.useState<string | null>(null)
  /** The one mark in the tab order, so an eleven-mark crest costs one stop. */
  const [roving, setRoving] = React.useState(0)
  const buttons = React.useRef<Array<HTMLButtonElement | null>>([])

  const interactive = Boolean(onMarkSelect)
  const caption =
    labels === "none" ? null : (marks.find((mark) => mark.id === active)?.label ?? null)

  function handleKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    if (!interactive || marks.length === 0) return

    let next: number | null = null
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = roving + 1
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = roving - 1
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = marks.length - 1
    if (next === null) return

    event.preventDefault()
    const index = Math.min(marks.length - 1, Math.max(0, next))
    setRoving(index)
    buttons.current[index]?.focus()
  }

  return (
    <section
      aria-labelledby={headingId}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "relative flex w-full flex-col items-center text-center text-foreground",
        scale.gap,
        className
      )}
      {...props}
    >
      <div className={cn("relative w-full", scale.crest)}>
        {/*
          The wash. One element carrying a soft radial per mark, positioned at
          that mark's own place on the arc — so the colour behind the crest is
          the crest's colour rather than a gradient that happens to sit there.
          Radials rather than a blurred copy of the marks: a filter on a layer
          this size repaints, and this never changes.
        */}
        {glow && arc.slots.length > 0 ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              /*
                Each radial is placed at its own mark's percentage on this box,
                which is the same box the marks are positioned in — so the wash
                cannot drift out of register with the crest at any width.
                Percentages in a radial's ending shape are read per axis, and
                this box is roughly twice as wide as it is tall, so the vertical
                radius is scaled by the ratio to keep the halo round rather than
                letting it stretch into a lens.
              */
              backgroundImage: arc.slots
                .map((slot, index) => {
                  const accent = marks[index]?.accent ?? "currentColor"
                  const r = trim(arc.diameter * 0.95)
                  return `radial-gradient(${r}% ${trim(r * arc.ratio)}% at ${slot.x}% ${slot.y}%, color-mix(in oklab, ${accent} 34%, transparent) 0%, transparent 74%)`
                })
                .join(", "),
              /*
                A background stops at its element's edge, and a wash that is
                still tinted when it gets there draws a rectangle around the
                crest — the one shape this section must not have. The mask
                takes the whole layer to nothing before the box does.
              */
              maskImage:
                "radial-gradient(72% 78% at 50% 52%, rgb(0, 0, 0) 30%, transparent 100%)",
            }}
          />
        ) : null}

        <motion.ul
          aria-label={crestLabel}
          onKeyDown={handleKeyDown}
          className="relative m-0 w-full list-none p-0"
          style={{
            aspectRatio: String(arc.ratio),
            transformOrigin: "50% 165%",
            rotate: live ? swing : 0,
            x: live ? driftX : 0,
            y: live ? driftY : 0,
          }}
        >
          {marks.map((mark, index) => {
            const slot = arc.slots[index]
            if (!slot) return null

            return (
              <Mark
                key={mark.id}
                mark={mark}
                slot={slot}
                index={index}
                diameter={arc.diameter}
                tilt={tilt}
                animate={animate}
                live={live}
                canDrag={canDrag}
                pointerX={springX}
                pointerY={springY}
                pullX={pullX}
                pullY={pullY}
                pullerMv={pullerMv}
                puller={puller}
                held={held}
                aloft={aloft}
                active={active === mark.id || (aloft && puller === index)}
                interactive={interactive}
                tabbable={index === roving}
                register={(node) => {
                  buttons.current[index] = node
                }}
                onEnter={() => setActive(mark.id)}
                onLeave={() =>
                  setActive((current) => (current === mark.id ? null : current))
                }
                onSelect={() => {
                  setRoving(index)
                  onMarkSelect?.(mark)
                }}
                onPullStart={() => {
                  pullerMv.set(index)
                  heldRef.current = true
                  setPuller(index)
                  setHeld(true)
                  setAloft(true)
                  setActive(mark.id)
                }}
                onPullMove={(dx, dy, max) => {
                  const next = leash(dx, dy, max)
                  pullTargetX.set(next.x)
                  pullTargetY.set(next.y)
                }}
                onPullEnd={() => {
                  heldRef.current = false
                  setHeld(false)
                  pullTargetX.set(0)
                  pullTargetY.set(0)
                }}
              />
            )
          })}
        </motion.ul>
      </div>

      {/*
        The caption keeps its line whether or not anything is hovered, so the
        headline below it never jumps when the cursor crosses the arc.
      */}
      {labels !== "none" ? (
        <p
          aria-hidden="true"
          className={cn(
            "min-h-[1.45em] text-xs leading-[1.45] font-medium text-muted-foreground",
            "transition-opacity duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
            caption ? "opacity-100" : "opacity-0"
          )}
        >
          {caption ?? " "}
        </p>
      ) : null}

      <div className={cn("flex w-full flex-col items-center", scale.gap, scale.copy)}>
        {eyebrow ? (
          <p className="flex items-center gap-1.5 text-[0.6875rem] leading-none font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {eyebrowIcon ? (
              <span
                aria-hidden="true"
                className="flex size-3 items-center justify-center [&_svg]:size-full [&_svg]:shrink-0"
              >
                {eyebrowIcon}
              </span>
            ) : null}
            {eyebrow}
          </p>
        ) : null}

        <Heading
          id={headingId}
          className={cn(
            "font-semibold tracking-[-0.035em] text-balance text-foreground",
            scale.headline
          )}
        >
          {headline}
        </Heading>

        {description ? (
          <p
            className={cn(
              "max-w-[46ch] leading-relaxed text-pretty text-muted-foreground",
              scale.description
            )}
          >
            {description}
          </p>
        ) : null}

        {actions ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  )
}

/**
 * The second voice in a headline.
 *
 * The reference for this section sets half its sentence in a serif, and a
 * registry component cannot ship a typeface — so the difference is carried by
 * weight and ink, which works in any project, and the family is left as a
 * custom property for one that does have a second face to give it.
 */
export function CrestQuiet({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn("font-normal tracking-[-0.02em] text-muted-foreground", className)}
      style={{ fontFamily: QUIET_FONT }}
      {...props}
    >
      {children}
    </span>
  )
}

const ARROW_LAYER =
  "absolute inset-0 grid place-items-center transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)]"

/**
 * The pill the section was drawn with: solid ink, and a badge on the end that
 * rolls its arrow away and brings a second one in behind it. Renders as an
 * anchor when given an `href`, so the call to action is a real link.
 */
export function CrestAction({
  href,
  className,
  children,
  ...props
}: Omit<React.ComponentPropsWithoutRef<"button">, "href"> & { href?: string }) {
  const body = (
    <>
      <span className="px-1">{children}</span>
      <span
        aria-hidden="true"
        className={cn(
          "relative size-7 shrink-0 overflow-hidden rounded-full",
          "bg-primary-foreground text-primary"
        )}
      >
        {/*
         * Each arrow rides a layer the size of the disc, not its own 14px box,
         * so a full-width slide clears the disc entirely. On the glyph itself
         * `translate-x-full` was half a disc, and both arrows showed at once.
         */}
        <span className={cn(ARROW_LAYER, "group-hover/action:translate-x-full")}>
          <Arrow />
        </span>
        <span
          className={cn(
            ARROW_LAYER,
            "-translate-x-full group-hover/action:translate-x-0"
          )}
        >
          <Arrow />
        </span>
      </span>
    </>
  )

  const shell = cn(
    "group/action inline-flex cursor-pointer items-center gap-2 rounded-full py-1.5 pr-1.5 pl-4",
    "bg-primary text-sm font-medium text-primary-foreground",
    "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
    "hover:bg-primary-hover",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-40",
    className
  )

  if (href) {
    return (
      <a href={href} className={shell}>
        {body}
      </a>
    )
  }

  return (
    <button type="button" className={shell} {...props}>
      {body}
    </button>
  )
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-3.5", className)}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

/**
 * One disc.
 *
 * Four nested boxes, and each owns exactly one transform, because they are
 * driven by different things and would otherwise overwrite each other: the
 * outer one is the mount, the next is the pointer parallax, the next is the
 * pull (this disc's leash, or a neighbour's share of it), and the inner one is
 * the lean along the arc plus the lift under the cursor. The inner lean uses
 * the individual `rotate` / `scale` / `translate` properties rather than a
 * `transform` string, so a hover can raise a disc without having to restate the
 * angle it is sitting at.
 */
function Mark({
  mark,
  slot,
  index,
  diameter,
  tilt,
  animate,
  live,
  canDrag,
  pointerX,
  pointerY,
  pullX,
  pullY,
  pullerMv,
  puller,
  held,
  aloft,
  active,
  interactive,
  tabbable,
  register,
  onEnter,
  onLeave,
  onSelect,
  onPullStart,
  onPullMove,
  onPullEnd,
}: {
  mark: GlassCrestMark
  slot: Slot
  index: number
  diameter: number
  tilt: boolean
  animate: boolean
  live: boolean
  canDrag: boolean
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  pullX: MotionValue<number>
  pullY: MotionValue<number>
  pullerMv: MotionValue<number>
  puller: number
  held: boolean
  aloft: boolean
  active: boolean
  interactive: boolean
  tabbable: boolean
  register: (node: HTMLButtonElement | null) => void
  onEnter: () => void
  onLeave: () => void
  onSelect: () => void
  onPullStart: () => void
  onPullMove: (dx: number, dy: number, max: number) => void
  onPullEnd: () => void
}) {
  const accent = mark.accent ?? "currentColor"
  const heldThis = held && puller === index
  const aloftThis = aloft && puller === index
  const over = React.useRef(false)
  const wasAloft = React.useRef(false)
  const onLeaveRef = React.useRef(onLeave)
  onLeaveRef.current = onLeave

  React.useEffect(() => {
    if (aloftThis) {
      wasAloft.current = true
      return
    }
    if (!wasAloft.current) return
    wasAloft.current = false
    if (!over.current) onLeaveRef.current()
  }, [aloftThis])

  /*
   * Parallax by rank: a mark out at the end of the arc travels the furthest
   * sideways, and every mark lifts a little against the vertical. That is the
   * whole difference between a crest that turns and a picture that slides.
   */
  const x = useTransform(pointerX, (value) => value * slot.depth * 14)
  const y = useTransform(pointerY, (value) => value * (5 + Math.abs(slot.depth) * 7))
  const shiftX = useTransform([pullX, pullY, pullerMv], ([px, py, who]) =>
    packShift(index, Number(who), Number(px), Number(py)).x
  )
  const shiftY = useTransform([pullX, pullY, pullerMv], ([px, py, who]) =>
    packShift(index, Number(who), Number(px), Number(py)).y
  )
  const twist = useTransform([pullX, pullY, pullerMv], ([px, py, who]) =>
    packTwist(index, Number(who), Number(px), Number(py))
  )
  const glyphRotate = useTransform(twist, (value) =>
    tilt ? slot.angle + value : value
  )
  /*
   * The light is in the room, above and to the left. A circle does not change
   * silhouette when it leans, so the only thing a local rotate can do to the
   * glass is drag the painted highlight around with the glyph — which is why
   * a mark on the right of the arc looked lit from the side. The shoulder
   * stays in screen space and only slides against a pull.
   */
  const litX = useTransform([pullX, pullerMv], ([px, who]) => {
    const pull = Number(who) === index ? Number(px) : 0
    return `${30 - pull * 0.06}%`
  })
  const litY = useTransform([pullY, pullerMv], ([py, who]) => {
    const pull = Number(who) === index ? Number(py) : 0
    return `${20 - pull * 0.06}%`
  })

  /*
   * The shadow lives on the table. The pulled disc takes the full offset; its
   * shadow takes a fraction, so the mark reads as in the air rather than as a
   * sticker sliding around with a stain attached. Neighbours are still on the
   * page, so their shadows travel with them.
   */
  const shadowX = useTransform([pullX, pullY, pullerMv], ([px, py, who]) => {
    const shift = packShift(index, Number(who), Number(px), Number(py))
    return Number(who) === index ? shift.x * 0.2 : shift.x
  })
  const shadowY = useTransform([pullX, pullY, pullerMv], ([px, py, who]) => {
    const shift = packShift(index, Number(who), Number(px), Number(py))
    return Number(who) === index ? shift.y * 0.2 : shift.y
  })
  const shadowScale = useTransform([pullX, pullY, pullerMv], ([px, py, who]) => {
    if (Number(who) !== index) return 1
    return 1 + Math.min(0.42, Math.hypot(Number(px), Number(py)) / 90)
  })
  const shadowOpacity = useTransform([pullX, pullY, pullerMv], ([px, py, who]) => {
    if (Number(who) !== index) return 0.6
    return 0.62 - Math.min(0.28, Math.hypot(Number(px), Number(py)) / 140)
  })
  const sheenX = useTransform([pullX, pullerMv], ([px, who]) =>
    Number(who) === index ? Number(px) * -0.14 : 0
  )
  const sheenY = useTransform([pullY, pullerMv], ([py, who]) =>
    Number(who) === index ? Number(py) * -0.14 : 0
  )
  const glyphX = useTransform([pullX, pullerMv], ([px, who]) =>
    Number(who) === index ? Number(px) * -0.05 : 0
  )
  const glyphY = useTransform([pullY, pullerMv], ([py, who]) =>
    Number(who) === index ? Number(py) * -0.05 : 0
  )

  const gesture = React.useRef({
    pointerId: -1,
    originX: 0,
    originY: 0,
    max: 48,
    dragged: false,
  })

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    if (!canDrag || event.button !== 0) return
    gesture.current = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      max: event.currentTarget.getBoundingClientRect().width * 0.48,
      dragged: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!canDrag || event.pointerId !== gesture.current.pointerId) return
    const dx = event.clientX - gesture.current.originX
    const dy = event.clientY - gesture.current.originY
    if (!gesture.current.dragged) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      gesture.current.dragged = true
      onPullStart()
    }
    onPullMove(dx, dy, gesture.current.max)
  }

  function handlePointerUp(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerId !== gesture.current.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    const dragged = gesture.current.dragged
    gesture.current.pointerId = -1
    if (dragged) onPullEnd()
  }

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    if (gesture.current.dragged) {
      event.preventDefault()
      gesture.current.dragged = false
      return
    }
    onSelect()
  }

  const disc = (
    <span className="relative block size-full">
      <motion.span
        className="relative block size-full rounded-full"
        initial={false}
        animate={{
          scale: aloftThis ? 1.1 : active ? 1.07 : 1,
          y: aloftThis ? "-8%" : active ? "-5%" : "0%",
        }}
        transition={animate ? LIFT : { duration: 0 }}
      >
        {/*
          The body. The tint is a radial run from a lit shoulder at the top left
          down to a denser edge, over a frost of the theme's own ink — which is
          the one formulation that survives both themes, because 5% of near-black
          on paper and 5% of near-white on charcoal are the same material.

          The shoulder is authored in screen space (`--lit-x`, `--lit-y`) so a
          lean of the glyph cannot take the light with it.
        */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full backdrop-blur-[6px] backdrop-saturate-[1.4]"
          style={
            {
              backgroundColor: FROST,
              backgroundImage: [
                /*
                 * The shade under the belly, drawn as a gradient rather than as an
                 * inset shadow: a shadow's spread can only be a length, and a length
                 * authored for a 200px disc is a black band on a 90px one. Listed
                 * first, so it paints over the tint.
                 */
                `radial-gradient(86% 66% at 50% 112%, color-mix(in oklab, ${accent} 72%, transparent) 0%, transparent 58%)`,
                `radial-gradient(118% 118% at var(--lit-x) var(--lit-y), color-mix(in oklab, ${accent} 42%, transparent) 0%, color-mix(in oklab, ${accent} 17%, transparent) 52%, color-mix(in oklab, ${accent} 44%, transparent) 100%)`,
              ].join(", "),
              boxShadow: [
                /* The rim, in the mark's own colour rather than in grey. */
                `inset 0 0 0 1px color-mix(in oklab, ${accent} 48%, transparent)`,
                /* The lit top edge — the light is above, and this is the one hairline. */
                `inset 0 2px 3px -1px ${SHEEN}`,
                /* A close contact shadow, so the disc sits on the page rather than over it. */
                `0 6px 14px -8px color-mix(in oklab, ${accent} 60%, transparent)`,
              ].join(", "),
              "--lit-x": litX,
              "--lit-y": litY,
            } as React.CSSProperties
          }
        />

        {/*
         * The specular. Off-centre at rest, because a highlight in the middle
         * reads as a hole — and it lives in the same space as the shoulder,
         * sliding against a pull so the room's light does not ride the glyph.
         */}
        <motion.span
          aria-hidden="true"
          className="absolute top-[9%] left-[15%] h-[28%] w-[44%] rounded-[50%] blur-[5px]"
          style={{ background: SHEEN, x: sheenX, y: sheenY }}
        />

        {mark.icon ? (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
            style={{ x: glyphX, y: glyphY, rotate: glyphRotate }}
          >
            {/* The thickness: the same glyph, offset and blurred, under the face. */}
            <span
              className="absolute flex items-center justify-center opacity-70 blur-[2.5px] [&_svg]:size-full [&_svg]:shrink-0"
              style={{
                width: GLYPH,
                height: GLYPH,
                translate: "2% 5%",
                color: `color-mix(in oklab, ${accent} 72%, transparent)`,
              }}
            >
              {mark.icon}
            </span>

            <span
              className="relative flex items-center justify-center [&_svg]:size-full [&_svg]:shrink-0"
              style={{
                width: GLYPH,
                height: GLYPH,
                color: GLYPH_INK,
                filter: `drop-shadow(0 1px 1px color-mix(in oklab, ${accent} 55%, transparent))`,
              }}
            >
              {mark.icon}
            </span>
          </motion.span>
        ) : null}
      </motion.span>
    </span>
  )

  return (
    <li
      className="absolute"
      style={{
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        width: `${diameter}%`,
        aspectRatio: "1 / 1",
        /*
         * Nearest the apex sits highest. It is the only order that is symmetric
         * the way the arc is — shingling one way makes the crest read as a fan
         * dealt from one side rather than as a curve lifting into the middle.
         */
        zIndex: aloftThis ? 240 : Math.round(100 - Math.abs(slot.depth) * 50),
        translate: "-50% -50%",
      }}
    >
      <motion.div
        className="size-full"
        /*
         * Declared unconditionally, and cancelled by the transition rather than
         * by the prop. Whether motion is reduced is unknowable on the server, so
         * branching the markup on it means a reduced-motion reader hydrates a
         * different tree than the one they were sent. A zero-duration
         * transition lands the disc on its final values in the first frame,
         * which is the same outcome with none of the mismatch.
         */
        initial={{ opacity: 0, y: 26, scale: 0.82 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        /*
         * The rise is sprung and the fade is not, because they are answering
         * different questions. The rise is the disc's arrival and wants weight
         * behind it; the opacity is only there so the disc is not visible
         * below the arc on its way up, and a spring easing asymptotically into
         * full would leave it a few percent short for as long again.
         *
         * `delay` is what makes this a crest assembling rather than seven
         * things appearing: apex first, then outward, close enough together
         * that the marks are still in the air alongside each other.
         */
        transition={
          animate
            ? {
                y: { ...ARRIVAL, delay: 0.06 + Math.abs(slot.depth) * 0.14 },
                scale: { ...ARRIVAL, delay: 0.06 + Math.abs(slot.depth) * 0.14 },
                opacity: {
                  duration: 0.42,
                  ease: EASE,
                  delay: 0.06 + Math.abs(slot.depth) * 0.14,
                },
              }
            : { duration: 0 }
        }
      >
        <motion.div
          className="relative size-full"
          style={{ x: live ? x : 0, y: live ? y : 0 }}
        >
          {/*
           * Cast onto the page, not carried by the glass. A shadow that travels
           * with the disc is the tell that the mark is a sticker; one that
           * stays near the seat is the tell that the disc came off the table.
           */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[14%] bottom-[-4%] z-0 h-[38%] rounded-[50%] blur-[10px]"
            style={{
              background: `color-mix(in oklab, ${accent} 38%, transparent)`,
              x: canDrag ? shadowX : 0,
              y: canDrag ? shadowY : 0,
              scale: canDrag ? shadowScale : 1,
              opacity: canDrag ? shadowOpacity : active ? 0.85 : 0.6,
            }}
          />
          <motion.div
            className="relative z-10 size-full"
            style={{
              x: canDrag ? shiftX : 0,
              y: canDrag ? shiftY : 0,
            }}
          >
            {interactive ? (
              <motion.button
                type="button"
                ref={register}
                tabIndex={tabbable ? 0 : -1}
                aria-label={mark.label}
                onClick={handleClick}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerEnter={() => {
                  over.current = true
                  onEnter()
                }}
                onPointerLeave={() => {
                  over.current = false
                  if (!aloftThis) onLeave()
                }}
                onFocus={onEnter}
                onBlur={onLeave}
                /*
                 * The press. A mark that can be clicked and gives nothing back on
                 * the way down is the single loudest tell that a hero is a picture
                 * of a control rather than a control — and on glass this size, a
                 * few percent is all it takes to read as the thing being pushed
                 * into the page and let go. Held off while the disc is being
                 * pulled, so a drag does not also read as a press.
                 */
                whileTap={animate && !heldThis ? { scale: 0.94 } : undefined}
                transition={LIFT}
                className={cn(
                  "block size-full rounded-full select-none",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  canDrag
                    ? heldThis
                      ? "cursor-grabbing touch-none"
                      : "cursor-grab touch-none"
                    : "cursor-pointer"
                )}
              >
                {disc}
              </motion.button>
            ) : (
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerEnter={() => {
                  over.current = true
                  onEnter()
                }}
                onPointerLeave={() => {
                  over.current = false
                  if (!aloftThis) onLeave()
                }}
                className={cn(
                  "size-full select-none",
                  canDrag
                    ? heldThis
                      ? "cursor-grabbing touch-none"
                      : "cursor-grab touch-none"
                    : undefined
                )}
              >
                {disc}
                <span className="sr-only">{mark.label}</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </li>
  )
}

interface Slot {
  /** Centre, as a percentage of the arc's box. */
  x: number
  y: number
  /** Degrees the disc leans, which is its own angle on the circle. */
  angle: number
  /** -1 at the left end, 0 at the apex, 1 at the right. Drives depth and order. */
  depth: number
}

/**
 * Solves the arc.
 *
 * Given a count and a `spread`, everything else falls out of one circle. The
 * marks sit at equal angles across the spread; the chord between two neighbours
 * is what a disc has to be wider than in order to lap them by `overlap`; and
 * the box is the bounding rectangle of all of that, discs included. Dividing
 * through by its width leaves every position as a percentage and the box as an
 * aspect ratio — which is what makes the crest fluid with no measurement, no
 * resize observer and no magic numbers: three marks across a phone and eleven
 * across a monitor are the same calculation.
 */
function layOut(
  count: number,
  spreadDegrees: number,
  overlap: number
): { slots: Slot[]; diameter: number; ratio: number } {
  if (count <= 0) return { slots: [], diameter: 0, ratio: 2 }
  if (count === 1) {
    return { slots: [{ x: 50, y: 50, angle: 0, depth: 0 }], diameter: 100, ratio: 1 }
  }

  const spread = (Math.min(340, Math.max(1, spreadDegrees)) * Math.PI) / 180
  /* A disc laps its neighbour, so what is left between two centres is the gap. */
  const gap = 1 - Math.min(0.75, Math.max(0, overlap))
  const step = spread / (count - 1)

  /* Unit circle: the radius cancels out when the box is normalised below. */
  const angles = Array.from({ length: count }, (_, index) => -spread / 2 + index * step)
  const xs = angles.map((angle) => Math.sin(angle))
  const ys = angles.map((angle) => 1 - Math.cos(angle))

  const diameter = (2 * Math.sin(step / 2)) / gap

  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const width = Math.max(...xs) - minX + diameter
  const height = Math.max(...ys) - minY + diameter

  return {
    slots: angles.map((angle, index) => ({
      x: trim(((xs[index]! - minX + diameter / 2) / width) * 100),
      y: trim(((ys[index]! - minY + diameter / 2) / height) * 100),
      angle: trim((angle * 180) / Math.PI),
      depth: (index - (count - 1) / 2) / ((count - 1) / 2),
    })),
    diameter: trim((diameter / width) * 100),
    ratio: trim(width / height),
  }
}

/**
 * False through the server render and the hydrating one, true after.
 *
 * A store that never changes, whose two snapshots disagree: React reads the
 * server one while it is matching the markup it was sent and the client one
 * immediately afterwards, which is exactly the signal wanted here and is a
 * re-render rather than a mismatch. An effect flipping a piece of state would
 * do the same job a beat later and a lint rule at a time.
 */
function useHydrated(): boolean {
  return React.useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  )
}

const subscribeToNothing = () => () => {}

/**
 * Rounds a number that is on its way into a style attribute.
 *
 * Browsers re-serialise CSS to six significant figures, so a raw
 * `34.82959163394012%` comes back out of the DOM as `34.8296%` — which React
 * reads as the server and the client disagreeing about the markup. Three
 * decimals is finer than a device pixel at any size this draws at, and it is a
 * value that survives the round trip untouched.
 */
function trim(value: number): number {
  return Math.round(value * 1000) / 1000
}
