"use client"

import * as React from "react"

import { CarbonCopy } from "@/registry/components/carbon-copy"

/*
 * The cover line is itself a plate: PL. 03, Carbon Copy, setting the title
 * of the manual. The first line inks up, the second is copied off it and its
 * changed words turn over — and a leader line from the figure note finds the
 * word "source." wherever the type has wrapped to.
 */
export function CoverTitle({
  note,
  intro,
  action,
}: {
  note: React.ReactNode
  intro: React.ReactNode
  action: React.ReactNode
}) {
  const root = React.useRef<HTMLDivElement>(null)
  const noteKey = React.useRef<HTMLSpanElement>(null)
  const path = React.useRef<SVGPathElement>(null)
  const dot = React.useRef<SVGCircleElement>(null)
  const [done, setDone] = React.useState(false)

  React.useEffect(() => {
    const container = root.current
    if (!container) return
    let frame = 0
    let frames = 0
    const measure = () => {
      const heading = container.querySelector("h1")
      const line = heading?.children[1] as HTMLElement | undefined
      const key = noteKey.current
      if (!line || !key || !path.current || !dot.current) return
      const c = container.getBoundingClientRect()
      const words = line.querySelectorAll<HTMLElement>(":scope > span, :scope > *")
      const last = words.length ? words[words.length - 1]! : line
      const w = last.getBoundingClientRect()
      const k = key.getBoundingClientRect()
      const tx = w.left - c.left + w.width * 0.5
      const ty = w.bottom - c.top - w.height * 0.12
      const sx = k.left - c.left + k.width / 2
      const sy = k.top - c.top - 6
      path.current.setAttribute(
        "d",
        `M${sx.toFixed(1)} ${sy.toFixed(1)} V${(sy - 18).toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)}`
      )
      dot.current.setAttribute("cx", tx.toFixed(1))
      dot.current.setAttribute("cy", ty.toFixed(1))
    }
    // Follow the type while it is still setting, then only on resize.
    const tick = () => {
      measure()
      frames += 1
      if (frames < 260) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const resize = new ResizeObserver(measure)
    resize.observe(container)
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
    }
  }, [])

  return (
    <div ref={root} className="relative" data-set={done ? "" : undefined}>
      <CarbonCopy
        as="h1"
        trigger="mount"
        align="start"
        lines={["Read the manual.", "Own the source."]}
        timing={{ delay: 250 }}
        onComplete={() => setDone(true)}
        className="sp-display text-[clamp(52px,12.4vw,182px)] leading-[0.9] tracking-[-0.035em] lg:whitespace-nowrap"
      />

      <div className="sp-grid mt-12 items-start gap-y-8 border-t border-[var(--sp-rule)] pt-6 lg:mt-16">
        <div className="col-span-4 lg:col-span-5">{intro}</div>
        <div className="col-span-4 lg:col-span-3">{action}</div>
        <p className="col-span-4 flex items-start gap-3 lg:col-span-4">
          <span ref={noteKey} className="sp-key mt-0.5" aria-hidden="true">
            0
          </span>
          <span className="text-[14px] leading-[1.45] text-[var(--sp-ink-2)]">{note}</span>
        </p>
      </div>

      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block">
        <path
          ref={path}
          d="M0 0"
          fill="none"
          stroke="#ff4f00"
          strokeWidth="1"
          className="sp-cover-leader"
          pathLength={1}
        />
        <circle ref={dot} r="4" cx="-100" cy="-100" fill="#ff4f00" className="sp-cover-dot" />
      </svg>
    </div>
  )
}
