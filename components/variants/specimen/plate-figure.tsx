"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

import type { Callout } from "./anatomy"
import { CropMarks } from "./marks"

/*
 * A plate: a live component on a drafting board, with lettered callouts and
 * leader lines drawn from each label to the part it names.
 *
 * The lines are measured, not drawn by hand. Each callout names its part with
 * a selector inside the stage (or a point on the stage itself), and while the
 * plate is on screen a frame loop reads where that part actually is and moves
 * the line's end to it — so a line that points at a step in a running trace
 * follows the step as the trace grows. The loop writes SVG attributes through
 * refs and never re-renders React.
 *
 * When the plate first comes into view the lines are inked in one after the
 * other (a dash offset running to zero), then the labels set, then the active
 * annotation starts to walk the parts in orange. Hovering a label takes the
 * walk over. Under reduced motion everything is drawn at once and nothing
 * walks. Below `lg` the lines give way to lettered markers on the parts, and
 * the labels become a legend under the board.
 */

type Layout = "side" | "split" | "below"

export interface PlateFigureProps {
  callouts: Callout[]
  layout?: Layout
  /** The stage: the live component, composed. */
  children: React.ReactNode
  fig: string
  caption?: React.ReactNode
  /** Right-hand note in the board's top margin. */
  note?: string
  className?: string
  boardClassName?: string
  stageClassName?: string
  /** Grid classes for the board and the label columns, by layout. */
  columns?: { board?: string; labels?: string; left?: string }
  autoplay?: boolean
  /** Set above the right-hand labels — a plate title, for instance. */
  labelsHeader?: React.ReactNode
  /**
   * A selector inside the stage to set the legend into on wide screens, when
   * the scene leaves room for it beside the part it annotates.
   */
  legendSlots?: Record<string, string>
}

const reduceQuery = "(prefers-reduced-motion: reduce)"

function subscribeReduce(onChange: () => void) {
  const media = window.matchMedia(reduceQuery)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

const wideQuery = "(min-width: 1024px)"

function subscribeWide(onChange: () => void) {
  const media = window.matchMedia(wideQuery)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function useWide() {
  return React.useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(wideQuery).matches,
    () => false
  )
}

export function useReducedMotionPref() {
  return React.useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(reduceQuery).matches,
    () => false
  )
}

export function PlateFigure({
  callouts,
  layout = "side",
  children,
  fig,
  caption,
  note,
  className,
  boardClassName,
  stageClassName,
  columns,
  autoplay = true,
  labelsHeader,
  legendSlots,
}: PlateFigureProps) {
  const figRef = React.useRef<HTMLElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const keyRefs = React.useRef<Array<HTMLSpanElement | null>>([])
  const pathRefs = React.useRef<Array<SVGPathElement | null>>([])
  const dotRefs = React.useRef<Array<SVGCircleElement | null>>([])
  const ringRefs = React.useRef<Array<SVGCircleElement | null>>([])
  const boxRefs = React.useRef<Array<SVGRectElement | null>>([])
  const markerRefs = React.useRef<Array<SVGGElement | null>>([])

  const reduce = useReducedMotionPref()
  const [inView, setInView] = React.useState(false)
  const [inked, setInked] = React.useState(false)
  const [walk, setWalk] = React.useState<number | null>(null)
  const [hover, setHover] = React.useState<number | null>(null)
  const active = hover ?? walk
  const wide = useWide()
  const [slots, setSlots] = React.useState<Record<string, HTMLElement> | null>(null)
  const slotted = wide && slots !== null

  const sideOf = React.useCallback(
    (index: number) => {
      if (slotted && callouts[index]?.slot === "top") return "above" as const
      if (layout === "below" || slotted) return "below" as const
      if (layout === "split") return callouts[index]?.side ?? (index % 2 ? "right" : "left")
      return "right" as const
    },
    [callouts, layout, slotted]
  )

  const left = callouts
    .map((callout, index) => ({ callout, index }))
    .filter(({ index }) => sideOf(index) === "left")
  const right = callouts
    .map((callout, index) => ({ callout, index }))
    .filter(({ index }) => sideOf(index) !== "left")

  /* Watch for the plate entering the screen: start the loop, ink once. */
  React.useEffect(() => {
    const node = figRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) setInked(true)
      },
      { threshold: [0, 0.2, 0.4], rootMargin: "80px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  /* The frame loop that keeps every line on its part. */
  React.useEffect(() => {
    const figure = figRef.current
    const stage = stageRef.current
    if (!figure || !stage) return

    const measure = () => {
      if (legendSlots && !slots) {
        const found: Record<string, HTMLElement> = {}
        for (const [name, selector] of Object.entries(legendSlots)) {
          const node = stage.querySelector<HTMLElement>(selector)
          if (node) found[name] = node
        }
        if (Object.keys(found).length === Object.keys(legendSlots).length) setSlots(found)
      }
      const f = figure.getBoundingClientRect()
      const s = stage.getBoundingClientRect()
      callouts.forEach((callout, index) => {
        // The first anchor whose selector finds a visible element wins.
        const anchors = Array.isArray(callout.at) ? callout.at : [callout.at]
        let at = anchors[anchors.length - 1]!
        let target: Element | null = null
        for (const candidate of anchors) {
          const found = candidate.sel ? stage.querySelector(candidate.sel) : stage
          if (!found) continue
          const box = found.getBoundingClientRect()
          if (box.width === 0 && box.height === 0) continue
          at = candidate
          target = found
          break
        }
        const r = target ? target.getBoundingClientRect() : s
        const hasBox = target && (r.width > 0 || r.height > 0)
        const box = hasBox ? r : s
        const tx = box.left - f.left + box.width * (at.x ?? 0.5)
        const ty = box.top - f.top + box.height * (at.y ?? 0.5)

        const key = keyRefs.current[index]
        const path = pathRefs.current[index]
        if (key && path) {
          const k = key.getBoundingClientRect()
          const side = sideOf(index)
          let d: string
          if (side === "above") {
            const sx = k.left - f.left + k.width / 2
            const sy = k.bottom - f.top + 6
            d = `M${sx.toFixed(1)} ${sy.toFixed(1)} V${(sy + 10).toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)}`
          } else if (side === "below") {
            const sx = k.left - f.left + k.width / 2
            const sy = k.top - f.top - 6
            d = `M${sx.toFixed(1)} ${sy.toFixed(1)} V${(sy - 14).toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)}`
          } else if (side === "left") {
            const sx = k.right - f.left + 6
            const sy = k.top - f.top + k.height / 2
            d = `M${sx.toFixed(1)} ${sy.toFixed(1)} H${(sx + 22).toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)}`
          } else {
            const sx = k.left - f.left - 6
            const sy = k.top - f.top + k.height / 2
            d = `M${sx.toFixed(1)} ${sy.toFixed(1)} H${(sx - 22).toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)}`
          }
          if (path.getAttribute("d") !== d) path.setAttribute("d", d)
        }

        const cx = tx.toFixed(1)
        const cy = ty.toFixed(1)
        const dot = dotRefs.current[index]
        if (dot) {
          dot.setAttribute("cx", cx)
          dot.setAttribute("cy", cy)
        }
        const ring = ringRefs.current[index]
        if (ring) {
          ring.setAttribute("cx", cx)
          ring.setAttribute("cy", cy)
        }
        const marker = markerRefs.current[index]
        if (marker) marker.setAttribute("transform", `translate(${cx} ${cy})`)

        const rect = boxRefs.current[index]
        if (rect) {
          const pad = at.pad ?? 6
          if (at.box && hasBox) {
            rect.setAttribute("x", (r.left - f.left - pad).toFixed(1))
            rect.setAttribute("y", (r.top - f.top - pad).toFixed(1))
            rect.setAttribute("width", (r.width + pad * 2).toFixed(1))
            rect.setAttribute("height", (r.height + pad * 2).toFixed(1))
          } else {
            rect.setAttribute("width", "0")
            rect.setAttribute("height", "0")
          }
        }
      })
    }

    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(figure)
    resize.observe(stage)

    let frame = 0
    if (inView) {
      const tick = () => {
        measure()
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
    }
  }, [callouts, inView, sideOf, legendSlots, slots])

  /* The walk: once inked, the orange steps through the parts in turn. */
  React.useEffect(() => {
    if (!inked || reduce || !autoplay || !inView || hover !== null) return
    const delay = walk === null ? 1500 + callouts.length * 150 : 3000
    const timer = window.setTimeout(
      () => setWalk((index) => (index === null ? 0 : (index + 1) % callouts.length)),
      delay
    )
    return () => window.clearTimeout(timer)
  }, [inked, reduce, autoplay, inView, hover, walk, callouts.length])

  const labelList = (items: typeof left, side: "left" | "right" | "below" | "above") => (
    <ol
      className={cn(
        "flex flex-col gap-5",
        side === "below" && !slotted && "lg:grid lg:auto-cols-fr lg:grid-flow-col lg:gap-6",
        (side === "below" || side === "above") &&
          slotted &&
          "lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-7",
        side === "left" && "lg:items-end lg:text-right"
      )}
    >
      {items.map(({ callout, index }) => (
        <li
          key={callout.key}
          className={cn(
            "sp-callout flex items-start gap-3",
            side === "left" && "lg:flex-row-reverse"
          )}
          style={{ "--i": index } as React.CSSProperties}
          data-active={active === index ? "" : undefined}
          onPointerEnter={() => setHover(index)}
          onPointerLeave={() => setHover(null)}
        >
          <span
            ref={(node) => {
              keyRefs.current[index] = node
            }}
            className="sp-key mt-px"
            aria-hidden="true"
          >
            {callout.key}
          </span>
          <div className={cn("min-w-0", side !== "below" && side !== "above" && "max-w-[30ch]")}>
            <p className="sp-callout-title text-[15px] leading-[1.3] font-semibold tracking-[-0.01em]">
              <span className="sr-only">{callout.key}. </span>
              {callout.title}
            </p>
            {callout.note ? (
              <p className="mt-1 text-[14px] leading-[1.45] text-[var(--sp-ink-2)]">
                {callout.note}
              </p>
            ) : null}
            {callout.spec ? (
              <p className="sp-mono mt-1.5 text-[12px] leading-[1.4] text-[var(--sp-ink)]">
                {callout.spec}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )

  const grid =
    layout === "split"
      ? "lg:grid-cols-12"
      : layout === "side"
        ? "lg:grid-cols-12"
        : "lg:grid-cols-1"

  return (
    <figure
      ref={figRef}
      className={cn("sp-figure", className)}
      data-inked={inked || reduce ? "" : undefined}
    >
      <div className={cn("grid grid-cols-1 gap-x-6 gap-y-8 lg:items-center", grid)}>
        {layout === "split" ? (
          <div className={cn("order-2 lg:order-none", columns?.left ?? "lg:col-span-3")}>
            {labelList(left, "left")}
          </div>
        ) : null}

        <div
          className={cn(
            "sp-board relative order-1 lg:order-none",
            columns?.board ??
              (layout === "split" ? "lg:col-span-6" : layout === "side" ? "lg:col-span-8" : ""),
            boardClassName
          )}
        >
          <CropMarks />
          <span aria-hidden="true" className="sp-scale" />
          <div className="pointer-events-none absolute inset-x-4 top-3 flex items-start justify-between gap-4">
            <span className="sp-label">{fig}</span>
            {note ? <span className="sp-label hidden text-right sm:block">{note}</span> : null}
          </div>
          <div
            ref={stageRef}
            className={cn(
              "relative flex min-h-[320px] items-center justify-center px-4 pt-12 pb-10 sm:px-8 lg:px-12",
              stageClassName
            )}
          >
            {children}
          </div>
        </div>

        {slotted ? null : (
          <div
            className={cn(
              "order-3 lg:order-none",
              columns?.labels ??
                (layout === "split"
                  ? "lg:col-span-3"
                  : layout === "side"
                    ? "lg:col-span-3 lg:col-start-10"
                    : "")
            )}
          >
            {labelsHeader}
            {labelList(right, layout === "below" ? "below" : "right")}
          </div>
        )}
      </div>

      {slotted && slots
        ? Object.entries(slots).map(([name, node]) =>
            createPortal(
              labelList(
                right.filter(({ callout }) => (callout.slot ?? "bottom") === name),
                name === "top" ? "above" : "below"
              ),
              node,
              name
            )
          )
        : null}

      {caption ? (
        <figcaption className="mt-5 flex items-baseline gap-4 border-t border-[var(--sp-rule)] pt-3">
          <span className="sp-label shrink-0">{fig}</span>
          <span className="sp-serif text-[19px] leading-[1.3] text-[var(--sp-ink-2)]">
            {caption}
          </span>
        </figcaption>
      ) : null}

      <svg aria-hidden="true" className="sp-leaders-svg">
        {callouts.map((callout, index) => (
          <g
            key={callout.key}
            className="sp-leader"
            style={{ "--i": index } as React.CSSProperties}
            data-active={active === index ? "" : undefined}
          >
            <rect
              ref={(node) => {
                boxRefs.current[index] = node
              }}
              className="sp-leader-box"
              rx="4"
              width="0"
              height="0"
            />
            <path
              ref={(node) => {
                pathRefs.current[index] = node
              }}
              className="sp-leader-path"
              pathLength={1}
              d="M0 0"
            />
            <circle
              ref={(node) => {
                ringRefs.current[index] = node
              }}
              className="sp-leader-ring"
              r="9"
              cx="-100"
              cy="-100"
            />
            <circle
              ref={(node) => {
                dotRefs.current[index] = node
              }}
              className="sp-leader-dot"
              r="3.5"
              cx="-100"
              cy="-100"
            />
            <g
              ref={(node) => {
                markerRefs.current[index] = node
              }}
              className="sp-marker"
              transform="translate(-100 -100)"
            >
              <circle r="9" />
              <text textAnchor="middle" dominantBaseline="central" y="0.5">
                {callout.key}
              </text>
            </g>
          </g>
        ))}
      </svg>
    </figure>
  )
}
