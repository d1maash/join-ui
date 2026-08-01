"use client"

import * as React from "react"
import { animate, useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export interface MetricCardProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "prefix"> {
  label: string
  /** Final numeric value. Counts up when the card scrolls into view. */
  value: number
  /** Rendered before the number, e.g. `$`. */
  prefix?: string
  /** Rendered after the number, e.g. `%` or `ms`. */
  suffix?: string
  /** Decimal places to keep while counting. */
  precision?: number
  /** Period-over-period change, in percent. Sign drives the trend styling. */
  delta?: number
  /** Describes what `delta` is measured against. */
  deltaLabel?: string
  /** Optional series for the inline sparkline. Needs at least two points. */
  series?: number[]
  /** For metrics where a decrease is good (latency, churn, cost). */
  invertTrend?: boolean
  /** Count-up duration in seconds. */
  duration?: number
}

/**
 * A KPI tile: an animated figure, a signed delta, and an optional sparkline.
 *
 * The count-up writes to `textContent` through a ref, so the animation costs no
 * re-renders, and it only starts once the card enters the viewport. The final
 * value is rendered on the server and restored immediately under
 * `prefers-reduced-motion`, so the number is correct even if JS never runs.
 * Trend direction is conveyed by an arrow glyph and text, not colour alone.
 */
export function MetricCard({
  label,
  value,
  prefix = "",
  suffix = "",
  precision = 0,
  delta,
  deltaLabel = "vs. last period",
  series,
  invertTrend = false,
  duration = 1.1,
  className,
  ...props
}: MetricCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const numberRef = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(cardRef, { once: true, margin: "-15% 0px" })
  const reduceMotion = useReducedMotion()

  const format = React.useCallback(
    (input: number) =>
      input.toLocaleString("en-US", {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }),
    [precision]
  )

  React.useEffect(() => {
    const node = numberRef.current
    if (!node || !inView) return
    if (reduceMotion) {
      node.textContent = format(value)
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        node.textContent = format(latest)
      },
    })
    return () => controls.stop()
  }, [inView, value, duration, reduceMotion, format])

  const improving = delta === undefined ? null : invertTrend ? delta < 0 : delta > 0
  const flat = delta === 0

  return (
    <div
      ref={cardRef}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground",
        "shadow-[var(--shadow-subtle)] transition-shadow duration-[var(--duration-base)] hover:shadow-[var(--shadow-raised)]",
        className
      )}
      {...props}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p className="flex items-baseline gap-1 text-3xl font-semibold tracking-tight tabular-nums">
        {prefix ? <span className="text-xl text-muted-foreground">{prefix}</span> : null}
        {/* Server-rendered final value; the effect animates it afterwards. */}
        <span ref={numberRef}>{format(value)}</span>
        {suffix ? (
          <span className="text-lg font-medium text-muted-foreground">{suffix}</span>
        ) : null}
      </p>

      <div className="flex items-end justify-between gap-4">
        {delta !== undefined ? (
          <p className="flex flex-wrap items-center gap-1.5 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium tabular-nums",
                flat && "bg-muted text-muted-foreground",
                !flat && improving && "bg-success/12 text-success",
                !flat && improving === false && "bg-destructive/12 text-destructive"
              )}
            >
              <span aria-hidden="true">{flat ? "→" : delta > 0 ? "↑" : "↓"}</span>
              {Math.abs(delta).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">{deltaLabel}</span>
          </p>
        ) : (
          <span />
        )}

        {series && series.length > 1 ? (
          <Sparkline values={series} improving={improving} />
        ) : null}
      </div>
    </div>
  )
}

function Sparkline({
  values,
  improving,
}: {
  values: number[]
  improving: boolean | null
}) {
  const width = 88
  const height = 28
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  const points = values
    .map((point, index) => {
      const x = (index / (values.length - 1)) * width
      const y = height - ((point - min) / span) * (height - 4) - 2
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(" ")

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`Trend over the last ${values.length} periods`}
      className="shrink-0 overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          improving === false ? "stroke-destructive" : "stroke-primary",
          improving === null && "stroke-muted-foreground"
        )}
      />
    </svg>
  )
}
