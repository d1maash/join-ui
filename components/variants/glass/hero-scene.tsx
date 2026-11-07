"use client"

import * as React from "react"
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"
import { Compass, Layers, Shapes, Sparkles } from "lucide-react"

import { ApprovalGate } from "@/registry/components/approval-gate"
import { FocusStack } from "@/registry/components/focus-stack"
import { StatusTimeline } from "@/registry/components/status-timeline"
import { ToolTrace, type ToolTraceStep } from "@/registry/components/tool-trace"
import { cn } from "@/lib/utils"

import { useHydrated, useStill } from "./hooks"

/*
 * The run the centre pane plays, on a loop. `dwell` is how long each tool
 * stays in flight — long enough for its console to finish writing.
 */
const RUN: Array<{ step: ToolTraceStep; dwell: number }> = [
  {
    dwell: 1500,
    step: {
      id: "read",
      name: "read_file",
      summary: "app/page.tsx",
      meta: "0.2s",
      output: ["→ 214 lines, 7.9 kB"],
    },
  },
  {
    dwell: 1900,
    step: {
      id: "add",
      name: "run_command",
      summary: "shadcn add @joinui/tool-trace",
      meta: "3.1s",
      output: [
        "✔ Checking registry",
        "✔ Installing dependencies: motion",
        "✔ Created components/joinui/tool-trace.tsx",
      ],
    },
  },
  {
    dwell: 1600,
    step: {
      id: "edit",
      name: "edit_file",
      summary: "app/page.tsx",
      meta: "0.8s",
      output: ["+ 18 insertions", "→ 1 file changed"],
    },
  },
  {
    dwell: 2000,
    step: {
      id: "check",
      name: "run_tests",
      summary: "pnpm check",
      meta: "4.2s",
      output: ["✓ typecheck", "✓ lint", "→ all checks passed"],
    },
  },
  {
    dwell: 1100,
    step: { id: "pr", name: "open_pull_request", summary: "feat/run-log → main" },
  },
]

const RELEASE = [
  { id: "build", title: "Build", timestamp: "09:41" },
  { id: "preview", title: "Preview", timestamp: "09:43" },
  { id: "checks", title: "Checks", timestamp: "09:44" },
  { id: "production", title: "Production" },
]

const PILLS = [
  { id: "motion", label: "Motion System", icon: <Sparkles />, accent: "#0a84ff" },
  { id: "language", label: "Design Language", icon: <Compass />, accent: "#ff375f" },
  { id: "direction", label: "Art Direction", icon: <Shapes />, accent: "#bf5af2" },
  { id: "architecture", label: "UI Architecture", icon: <Layers />, accent: "#30b0c7" },
]

/**
 * The hero: real components, running, on panes of glass stacked in depth.
 *
 * Each pane sits at its own depth. The pointer tilts the stack — the front
 * panes travel further than the back ones, on a soft spring — and scrolling
 * lifts the front panes faster, so the stack separates as the page moves.
 * Under reduced motion none of that is bound: the panes rest where they are
 * laid out and the run is shown finished.
 *
 * The stage is imagery, not an interface, so it is inert. Every one of these
 * components is a click away, live and interactive, on its own page.
 */
export function HeroScene() {
  const still = useStill()
  const live = useHydrated()
  const stage = React.useRef<HTMLDivElement>(null)

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, { stiffness: 70, damping: 18, mass: 0.7 })
  const springY = useSpring(pointerY, { stiffness: 70, damping: 18, mass: 0.7 })
  const { scrollY } = useScroll()

  const run = useLoop(still)
  const release = useRelease(still)

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (still || event.pointerType !== "mouse") return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5)
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5)
  }

  function onPointerLeave() {
    pointerX.set(0)
    pointerY.set(0)
  }

  const depth = { x: springX, y: springY, scroll: scrollY, still }

  return (
    <div
      ref={stage}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative mx-auto h-[540px] w-full max-w-[1180px] sm:h-[600px] lg:h-[640px]"
    >
      <p className="sr-only">
        Four Join UI components running live on panes of glass: Tool Trace playing an
        agent run, Approval Gate asking to run a command, Status Timeline advancing a
        release, and Focus Stack turning through its items.
      </p>
      <div inert aria-hidden="true" className="absolute inset-0">
        {/* Back left — a release, advancing. */}
        <Pane
          {...depth}
          depth={0.35}
          className="top-[132px] left-0 hidden w-[320px] lg:block"
        >
          <div style={{ animationDelay: "260ms" }} className="g-float-in g-glass rounded-[30px] p-5 [--g-fill:0.62]">
            {live ? (
              <StatusTimeline
                label="Release"
                steps={RELEASE}
                activeStep={release}
                size="sm"
                variant="plain"
              />
            ) : (
              <div className="h-[206px]" />
            )}
          </div>
        </Pane>

        {/* Back right — the focus stack, turning. */}
        <Pane
          {...depth}
          depth={0.2}
          className="top-0 right-0 hidden w-[300px] xl:block"
        >
          <div style={{ animationDelay: "380ms" }} className="g-float-in g-glass g-thin flex h-[220px] items-center justify-center overflow-hidden rounded-[30px] px-4">
            {live ? (
              <FocusStack items={PILLS} size="sm" label="Highlights" interval={2400} />
            ) : null}
          </div>
        </Pane>

        {/* Centre — the run log, the thing actually working. */}
        <Pane
          {...depth}
          depth={0.6}
          className="top-0 left-1/2 w-[min(100%,560px)] -translate-x-1/2"
        >
          <div style={{ animationDelay: "120ms" }} className="g-float-in g-glass rounded-[34px] p-5 [--g-fill:0.64] sm:p-6">
            {live ? (
              <ToolTrace
                label="Agent run"
                steps={run}
                size="sm"
                variant="plain"
                follow
                stream
                lineSpeed={260}
                announce={false}
              />
            ) : (
              <div className="h-[322px]" />
            )}
          </div>
        </Pane>

        {/* Front right — the agent stops and asks. */}
        <Pane
          {...depth}
          depth={1}
          className="top-[318px] right-2 left-2 sm:top-[340px] sm:right-[4%] sm:left-auto sm:w-[440px] lg:right-[2%]"
        >
          <div style={{ animationDelay: "520ms" }} className="g-float-in g-glass rounded-[30px] p-5 [--g-fill:0.6]">
            {live ? (
              <ApprovalGate
                title="Reinstall the dependencies"
                reason="The lockfile no longer matches node_modules."
                tool="bash"
                meta="~/my-app"
                prefix="$"
                command="rm -rf node_modules && pnpm install"
                risk="medium"
                size="sm"
                variant="plain"
                hotkeys="off"
                announce={false}
              />
            ) : (
              <div className="h-[130px]" />
            )}
          </div>
        </Pane>
      </div>
    </div>
  )
}

function Pane({
  depth,
  x,
  y,
  scroll,
  still,
  className,
  children,
}: {
  depth: number
  x: MotionValue<number>
  y: MotionValue<number>
  scroll: MotionValue<number>
  still: boolean
  className?: string
  children: React.ReactNode
}) {
  const tx = useTransform(x, (value) => value * depth * -34)
  const lift = useTransform(scroll, [0, 900], [0, depth * -150])
  const ty = useTransform(() => y.get() * depth * -22 + lift.get())

  return (
    <motion.div
      style={still ? undefined : { x: tx, y: ty }}
      className={cn("absolute", className)}
    >
      {children}
    </motion.div>
  )
}

/** The centre pane's run: a cursor through `RUN`, round and round. */
function useLoop(still: boolean): ToolTraceStep[] {
  const [cursor, setCursor] = React.useState(1)

  React.useEffect(() => {
    if (still) return
    const dwell = cursor < RUN.length ? (RUN[cursor]?.dwell ?? 1200) : 3200
    const timer = window.setTimeout(
      () => setCursor((index) => (index >= RUN.length ? 0 : index + 1)),
      dwell
    )
    return () => window.clearTimeout(timer)
  }, [cursor, still])

  const at = still ? RUN.length : cursor
  return RUN.map(({ step }, index) => ({
    ...step,
    state: index < at ? "done" : index === at ? "running" : "pending",
  }))
}

/** The release pane: one stage further every couple of seconds. */
function useRelease(still: boolean): number {
  const [active, setActive] = React.useState(2)

  React.useEffect(() => {
    if (still) return
    const timer = window.setTimeout(
      () => setActive((index) => (index >= RELEASE.length ? 0 : index + 1)),
      active >= RELEASE.length ? 3400 : 2300
    )
    return () => window.clearTimeout(timer)
  }, [active, still])

  return still ? RELEASE.length : active
}
