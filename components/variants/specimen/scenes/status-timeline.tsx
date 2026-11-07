"use client"

import * as React from "react"
import { useInView } from "motion/react"

import {
  StatusTimeline,
  type StatusTimelineStep,
} from "@/registry/components/status-timeline"

import { useReducedMotionPref } from "../plate-figure"

/*
 * Plate 06. A deploy, advancing a step at a time while the plate is on screen
 * and holding at the end before it starts again. Still, it rests mid-run.
 */
const STEPS: StatusTimelineStep[] = [
  { id: "queued", title: "Queued", description: "Picked up by runner 4.", timestamp: "14:02" },
  { id: "build", title: "Build", description: "Compiled 214 modules.", timestamp: "14:03" },
  { id: "test", title: "Test", description: "212 assertions.", timestamp: "14:05" },
  { id: "deploy", title: "Deploy", description: "Rolling out to 3 regions.", timestamp: "14:07" },
  { id: "live", title: "Live", description: "Serving production traffic.", timestamp: "14:09" },
]

const BEATS = [1600, 1800, 1800, 1800, 1800, 3000]

export default function StatusTimelineScene() {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotionPref()
  const inView = useInView(ref, { amount: 0.4 })
  const [active, setActive] = React.useState(2)

  React.useEffect(() => {
    if (reduce || !inView) return
    const timer = window.setTimeout(
      () => setActive((index) => (index + 1) % BEATS.length),
      BEATS[active]
    )
    return () => window.clearTimeout(timer)
  }, [active, inView, reduce])

  return (
    <div ref={ref} className="w-full max-w-[420px]">
      <StatusTimeline
        label="Deploy"
        status={active >= STEPS.length ? "Live" : "Deploying"}
        steps={STEPS}
        activeStep={reduce ? 2 : active}
      />
    </div>
  )
}
