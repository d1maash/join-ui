"use client"

import * as React from "react"
import { useInView } from "motion/react"

import {
  StatusTimeline,
  type StatusTimelineStep,
} from "@/registry/components/status-timeline"

import { useReducedMotionPref } from "../plate-figure"

/*
 * Plate 06. A deploy, advancing a step at a time while the plate is on screen.
 * It runs from Build to Deploy and starts the next deploy from there, so there
 * is always a step cleared, one in flight and one still to come — every part
 * the plate letters is on the drawing. Still, it rests on Test.
 */
const STEPS: StatusTimelineStep[] = [
  { id: "queued", title: "Queued", description: "Picked up by runner 4.", timestamp: "14:02" },
  { id: "build", title: "Build", description: "Compiled 214 modules.", timestamp: "14:03" },
  { id: "test", title: "Test", description: "212 assertions.", timestamp: "14:05" },
  { id: "deploy", title: "Deploy", description: "Rolling out to 3 regions.", timestamp: "14:07" },
  { id: "live", title: "Live", description: "Serving production traffic.", timestamp: "14:09" },
]

/** The steps a deploy is shown in flight at, and how long each is held. */
const STATES = [1, 2, 3] as const
const BEATS = [2200, 2200, 3200]

export default function StatusTimelineScene() {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotionPref()
  const inView = useInView(ref, { amount: 0.4 })
  const [beat, setBeat] = React.useState(1)
  const active = STATES[beat] ?? 2

  React.useEffect(() => {
    if (reduce || !inView) return
    const timer = window.setTimeout(
      () => setBeat((index) => (index + 1) % STATES.length),
      BEATS[beat]
    )
    return () => window.clearTimeout(timer)
  }, [beat, inView, reduce])

  return (
    <div ref={ref} className="w-full max-w-[420px]">
      <StatusTimeline
        label="Deploy"
        status="Deploying"
        steps={STEPS}
        activeStep={reduce ? 2 : active}
      />
    </div>
  )
}
