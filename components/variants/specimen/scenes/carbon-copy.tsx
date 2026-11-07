"use client"

import * as React from "react"

import { CarbonCopy } from "@/registry/components/carbon-copy"

import { useReducedMotionPref } from "../plate-figure"

/*
 * Plate 03. Three takes, each set and then copied, held long enough to read,
 * cleared, and the next one set. Under reduced motion it is the first take,
 * finished.
 */
const TAKES = [
  ["Copy the code.", "Keep the code."],
  ["Read the plate.", "Ship the plate."],
  ["Ask the agent.", "Check the agent."],
] as const

export default function CarbonCopyScene() {
  const reduce = useReducedMotionPref()
  const [take, setTake] = React.useState(0)

  React.useEffect(() => {
    if (reduce) return
    const timer = window.setInterval(() => setTake((n) => n + 1), 6400)
    return () => window.clearInterval(timer)
  }, [reduce])

  return (
    <div className="w-full">
      <CarbonCopy
        key={take}
        as="p"
        trigger="view"
        align="start"
        lines={TAKES[take % TAKES.length]!}
        className="text-[clamp(2.75rem,6vw,5.25rem)] leading-[1.04] tracking-[-0.035em] text-foreground"
      />
    </div>
  )
}
