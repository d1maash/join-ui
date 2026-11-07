"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

import type { Callout, CalloutAnchor } from "./anatomy"
import { CropMarks } from "./marks"

/*
 * A plate: a live component on a drafting board, with lettered callouts and
 * leader lines drawn from each label to the part it names.
 *
 * Drawn the way a technical illustration is drawn. Every label sits level with
 * its part — the labels beside the board are stacked in the order of the
 * parts they name and pushed apart only as far as they must be — so each
 * leader is a horizontal run with at most one 45° jog, and because the order
 * of the labels is the order of the parts, no two leaders can cross. Labels
 * set under or over a part (a legend) reach it with square elbows instead.
 *
 * The parts are measured, not drawn by hand. Each callout names its part with
 * a selector inside the stage, and while the plate is on screen a frame loop
 * reads where that part is, so a leader pointing at a step in a running trace
 * stays on it as the trace grows; the loop writes SVG attributes and label
 * offsets through refs and never re-renders React.
 *
 * When the plate first comes into view the leaders are inked in one after the
 * other, the labels set, and the orange starts to walk the parts. Hovering a
 * label takes the walk over. Under reduced motion everything is drawn at once
 * and nothing walks. Below `xl` there is no room beside the board, so the
 * leaders give way to lettered markers on the parts and a legend under it.
 */

type Layout = "side" | "split" | "below"
type Side = "left" | "right" | "below" | "above"

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
   * Selectors inside the stage to set the legend into on wide screens, when
   * the scene leaves room for it next to the part it annotates.
   */
  legendSlots?: Record<string, string>
}

const reduceQuery = "(prefers-reduced-motion: reduce)"
const wideQuery = "(min-width: 1280px)"

function subscribeMedia(query: string) {
  return (onChange: () => void) => {
    const media = window.matchMedia(query)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }
}

const subscribeReduce = subscribeMedia(reduceQuery)
const subscribeWide = subscribeMedia(wideQuery)

export function useReducedMotionPref() {
  return React.useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(reduceQuery).matches,
    () => false
  )
}

function useWide() {
  return React.useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(wideQuery).matches,
    () => false
  )
}

/** The gap kept between two stacked labels. */
const GAP = 18
/** How far a label's key centre sits below the label's top edge. */
const KEY_CENTRE = 12
/** Labels only move once their part has moved this far, so they never jitter. */
const SETTLE = 14

function textBox(element: Element): DOMRect {
  const range = document.createRange()
  range.selectNodeContents(element)
  return range.getBoundingClientRect()
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
  const itemRefs = React.useRef<Array<HTMLLIElement | null>>([])
  const listRefs = React.useRef<Record<string, HTMLOListElement | null>>({})
  const placed = React.useRef<Array<number | null>>([])
  const pathRefs = React.useRef<Array<SVGPathElement | null>>([])
  const dotRefs = React.useRef<Array<SVGCircleElement | null>>([])
  const ringRefs = React.useRef<Array<SVGCircleElement | null>>([])
  const boxRefs = React.useRef<Array<SVGRectElement | null>>([])
  const markerRefs = React.useRef<Array<SVGGElement | null>>([])

  const reduce = useReducedMotionPref()
  const wide = useWide()
  const [inView, setInView] = React.useState(false)
  const [inked, setInked] = React.useState(false)
  const [walk, setWalk] = React.useState<number | null>(null)
  const [hover, setHover] = React.useState<number | null>(null)
  const [slots, setSlots] = React.useState<Record<string, HTMLElement> | null>(null)
  const active = hover ?? walk
  const slotted = wide && slots !== null

  const sideOf = React.useCallback(
    (index: number): Side => {
      const callout = callouts[index]
      if (slotted && callout?.slot === "top") return "above"
      if (layout === "below" || slotted) return "below"
      if (layout === "split") return callout?.side ?? "right"
      return "right"
    },
    [callouts, layout, slotted]
  )

  const indexed = callouts.map((callout, index) => ({ callout, index }))
  const left = indexed.filter(({ index }) => sideOf(index) === "left")
  const right = indexed.filter(({ index }) => sideOf(index) !== "left")

  /* Watch for the plate entering the screen: start the loop, ink once. */
  React.useEffect(() => {
    const node = figRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && entry.intersectionRatio > 0.15) setInked(true)
      },
      { threshold: [0, 0.15, 0.4], rootMargin: "80px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  /* The frame loop that keeps every label level with its part, and every leader on it. */
  React.useEffect(() => {
    const figure = figRef.current
    const stage = stageRef.current
    if (!figure || !stage) return

    const locate = (anchors: CalloutAnchor[]) => {
      for (const candidate of anchors) {
        const found = candidate.sel ? stage.querySelector(candidate.sel) : stage
        if (!found) continue
        const box = candidate.text ? textBox(found) : found.getBoundingClientRect()
        if (box.width === 0 && box.height === 0) continue
        return { at: candidate, box }
      }
      return null
    }

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

      // 1. Where every part is.
      const targets = callouts.map((callout) => {
        const anchors = Array.isArray(callout.at) ? callout.at : [callout.at]
        const hit = locate(anchors)
        const at = hit?.at ?? anchors[anchors.length - 1]!
        const box = hit?.box ?? s
        return {
          at,
          box: hit ? box : null,
          x: box.left - f.left + box.width * (at.x ?? 0.5),
          y: box.top - f.top + box.height * (at.y ?? 0.5),
        }
      })

      // 2. Labels beside the board: level with their parts, in their order.
      if (wide) {
        for (const side of ["left", "right"] as const) {
          const list = listRefs.current[side]
          if (!list || list.offsetParent === null) continue
          const l = list.getBoundingClientRect()
          const items = callouts
            .map((_, index) => index)
            .filter((index) => {
              const s2 = sideOf(index)
              return side === "left" ? s2 === "left" : s2 === "right"
            })
            .map((index) => ({
              index,
              h: itemRefs.current[index]?.offsetHeight ?? 0,
              want: targets[index]!.y + f.top - l.top - KEY_CENTRE,
            }))
            .sort((a, b) => a.want - b.want || a.index - b.index)
          if (items.length === 0) continue

          const ys: number[] = []
          items.forEach((item, i) => {
            const floor = i === 0 ? 0 : ys[i - 1]! + items[i - 1]!.h + GAP
            ys.push(Math.max(item.want, floor))
          })
          const room = Math.max(l.height, 0)
          const last = items.length - 1
          if (ys[last]! + items[last]!.h > room) {
            ys[last] = Math.max(0, room - items[last]!.h)
            for (let i = last - 1; i >= 0; i -= 1) {
              ys[i] = Math.min(ys[i]!, ys[i + 1]! - GAP - items[i]!.h)
            }
            for (let i = 0; i <= last; i += 1) {
              const floor = i === 0 ? 0 : ys[i - 1]! + items[i - 1]!.h + GAP
              ys[i] = Math.max(ys[i]!, floor)
            }
          }
          const needed = ys[last]! + items[last]!.h
          list.style.minHeight = needed > room + 1 ? `${Math.ceil(needed)}px` : ""

          items.forEach((item, i) => {
            const node = itemRefs.current[item.index]
            const y = Math.round(ys[i]!)
            const previous = placed.current[item.index]
            if (!node) return
            if (previous == null || Math.abs(previous - y) > SETTLE) {
              placed.current[item.index] = y
              node.style.setProperty("--y", `${y}px`)
            }
          })
        }
      }

      // 3. The leaders, the dots, the markers and the outlines.
      callouts.forEach((_, index) => {
        const target = targets[index]!
        const tx = target.x
        const ty = target.y
        const key = keyRefs.current[index]
        const path = pathRefs.current[index]
        if (key && path && key.offsetParent !== null) {
          const k = key.getBoundingClientRect()
          const side = sideOf(index)
          const p = (n: number) => n.toFixed(1)
          let d = ""
          if (side === "right" || side === "left") {
            const dir = side === "right" ? -1 : 1
            const sx = side === "right" ? k.left - f.left - 5 : k.right - f.left + 5
            const sy = k.top - f.top + k.height / 2
            const run = sx + dir * 16
            const dy = ty - sy
            const jogEnd = run + dir * Math.abs(dy)
            const beyond = side === "right" ? jogEnd < tx : jogEnd > tx
            if (Math.abs(dy) < 0.75) {
              d = `M${p(sx)} ${p(sy)} H${p(tx)}`
            } else if (beyond) {
              d = `M${p(sx)} ${p(sy)} H${p(run)} L${p(tx)} ${p(ty)}`
            } else {
              d = `M${p(sx)} ${p(sy)} H${p(run)} L${p(jogEnd)} ${p(ty)} H${p(tx)}`
            }
          } else {
            const sx = k.left - f.left + k.width / 2
            const sy = side === "below" ? k.top - f.top - 5 : k.bottom - f.top + 5
            const elbow = side === "below" ? sy - 14 : sy + 14
            d = `M${p(sx)} ${p(sy)} V${p(elbow)} H${p(tx)} V${p(ty)}`
          }
          if (path.getAttribute("d") !== d) path.setAttribute("d", d)
        }

        const cx = tx.toFixed(1)
        const cy = ty.toFixed(1)
        dotRefs.current[index]?.setAttribute("cx", cx)
        dotRefs.current[index]?.setAttribute("cy", cy)
        ringRefs.current[index]?.setAttribute("cx", cx)
        ringRefs.current[index]?.setAttribute("cy", cy)
        markerRefs.current[index]?.setAttribute("transform", `translate(${cx} ${cy})`)

        const rect = boxRefs.current[index]
        if (rect) {
          const pad = target.at.pad ?? 6
          const box = target.box
          if (target.at.box && box) {
            rect.setAttribute("x", (box.left - f.left - pad).toFixed(1))
            rect.setAttribute("y", (box.top - f.top - pad).toFixed(1))
            rect.setAttribute("width", (box.width + pad * 2).toFixed(1))
            rect.setAttribute("height", (box.height + pad * 2).toFixed(1))
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
  }, [callouts, inView, sideOf, legendSlots, slots, wide])

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

  const labelList = (
    items: typeof indexed,
    side: Side,
    options: { register?: boolean; placed?: boolean } = {}
  ) => {
    const { register = true, placed: isPlaced = false } = options
    return (
      <ol
        ref={
          register && isPlaced
            ? (node) => {
                listRefs.current[side] = node
              }
            : undefined
        }
        className={cn(
          "flex flex-col gap-5",
          isPlaced && "xl:relative xl:block xl:h-full",
          side === "below" && !slotted && "xl:grid xl:auto-cols-fr xl:grid-flow-col xl:gap-6",
          (side === "below" || side === "above") &&
            slotted &&
            "xl:grid xl:grid-cols-2 xl:gap-x-8 xl:gap-y-7",
          side === "left" && "xl:items-end xl:text-right"
        )}
      >
        {items.map(({ callout, index }) => (
          <li
            key={callout.key}
            ref={
              register
                ? (node) => {
                    itemRefs.current[index] = node
                  }
                : undefined
            }
            className={cn(
              "sp-callout flex items-start gap-3",
              isPlaced &&
                "xl:absolute xl:inset-x-0 xl:top-[var(--y,0px)] xl:transition-[top] xl:duration-500 xl:ease-[var(--sp-ease)]",
              side === "left" && "xl:flex-row-reverse"
            )}
            style={{ "--i": index } as React.CSSProperties}
            data-active={active === index ? "" : undefined}
            onPointerEnter={() => setHover(index)}
            onPointerLeave={() => setHover(null)}
          >
            <span
              ref={
                register
                  ? (node) => {
                      keyRefs.current[index] = node
                    }
                  : undefined
              }
              className="sp-key mt-px"
              aria-hidden="true"
            >
              {callout.key}
            </span>
            <div
              className={cn(
                "min-w-0",
                (side === "left" || side === "right") && "max-w-[30ch]"
              )}
            >
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
  }

  const beside = layout === "side" || layout === "split"

  return (
    <figure
      ref={figRef}
      className={cn("sp-figure", className)}
      data-inked={inked || reduce ? "" : undefined}
    >
      <div
        className={cn(
          "grid grid-cols-1 gap-x-6 gap-y-8",
          beside ? "xl:grid-cols-12 xl:items-stretch" : "xl:grid-cols-1"
        )}
      >
        {/*
          Below `xl` the labels are one legend, in letter order, under the
          board. It comes first in the markup and registers nothing, so the
          refs the leaders are measured from are the wide-screen labels.
        */}
        {beside ? (
          <div className="order-3 xl:hidden">
            {labelList(indexed, "right", { register: false })}
          </div>
        ) : null}

        {layout === "split" ? (
          <div className={cn("hidden xl:block", columns?.left ?? "xl:col-span-3")}>
            {labelList(left, "left", { placed: true })}
          </div>
        ) : null}

        <div
          className={cn(
            "sp-board relative order-1 xl:order-none",
            columns?.board ??
              (layout === "split" ? "xl:col-span-6" : layout === "side" ? "xl:col-span-8" : ""),
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
              "relative flex min-h-[320px] items-center justify-center px-4 pt-14 pb-12 sm:px-8 xl:px-12",
              stageClassName
            )}
          >
            {children}
          </div>
        </div>

        {beside ? (
          <div
            className={cn(
              labelsHeader ? "contents xl:flex xl:flex-col" : "hidden xl:block",
              columns?.labels ??
                (layout === "split" ? "xl:col-span-3" : "xl:col-span-3 xl:col-start-10")
            )}
          >
            {labelsHeader ? <div className="order-0 xl:order-none">{labelsHeader}</div> : null}
            <div className={cn(labelsHeader ? "hidden xl:block xl:flex-1" : "h-full")}>
              {labelList(right, "right", { placed: true })}
            </div>
          </div>
        ) : slotted ? null : (
          <div className="order-3 xl:order-none">{labelList(right, "below")}</div>
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
              r="8"
              cx="-100"
              cy="-100"
            />
            <circle
              ref={(node) => {
                dotRefs.current[index] = node
              }}
              className="sp-leader-dot"
              r="3"
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
