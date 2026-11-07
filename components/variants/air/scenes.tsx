"use client"

import * as React from "react"
import { useInView, useReducedMotion } from "motion/react"
import {
  Boxes,
  Compass,
  FileText,
  GitPullRequest,
  Layers,
  MapPin,
  Package,
  PenLine,
  Search,
  ShoppingBag,
  Sparkles,
  TestTube,
  Truck,
  Waves,
} from "lucide-react"

import {
  AgentHive,
  type AgentHiveModel,
  type AgentHiveRun,
} from "@/registry/components/agent-hive"
import { ApprovalGate } from "@/registry/components/approval-gate"
import { FocusStack, type FocusStackItem } from "@/registry/components/focus-stack"
import { StatusTimeline } from "@/registry/components/status-timeline"
import { ToolTrace, type ToolTraceStep } from "@/registry/components/tool-trace"

/*
 * The landing page's imagery. Each scene is a real registry component, given
 * just enough of a script to show the one thing it is for — a run that plays,
 * a step that advances, a request that waits for an answer.
 *
 * Every scene renders a finished, still frame on the server and under reduced
 * motion. A script only starts once its tile has been scrolled to, so nothing
 * plays to an empty room, and it pauses again when the tile leaves.
 */
function useScript(ref: React.RefObject<Element | null>) {
  const inView = useInView(ref, { amount: 0.35 })
  const still = useReducedMotion()
  return inView && still !== true
}

/* ------------------------------------------------------------------------ */
/* Tool Trace                                                                */
/* ------------------------------------------------------------------------ */

const TRACE: ToolTraceStep[] = [
  {
    id: "read",
    name: "read_file",
    summary: "app/(site)/page.tsx",
    meta: "0.2s",
    icon: <FileText />,
    output: ["→ 214 lines, 7.9 kB", "export default function HomePage() {"],
  },
  {
    id: "grep",
    name: "grep_search",
    summary: 'pattern: "<Button"',
    meta: "0.4s",
    icon: <Search />,
    output: ["app/(site)/page.tsx:41", "components/site/header.tsx:18", "→ 2 matches"],
  },
  {
    id: "edit",
    name: "edit_file",
    summary: "components/site/header.tsx",
    meta: "0.9s",
    icon: <PenLine />,
    output: ["+ 12 insertions", "− 4 deletions", "→ formatted, 1 file changed"],
  },
  {
    id: "test",
    name: "run_tests",
    summary: "pnpm check",
    meta: "3.8s",
    icon: <TestTube />,
    output: ["✓ registry valid", "✓ typecheck", "✓ lint", "→ all checks passed"],
  },
  {
    id: "pr",
    name: "open_pull_request",
    summary: "feat/header → main",
    meta: "#128",
    icon: <GitPullRequest />,
  },
]

/** How long each step runs before it lands, in order. */
const DWELL = [1500, 1700, 1700, 2300, 1200]

export function ToolTraceScene() {
  const ref = React.useRef<HTMLDivElement>(null)
  const playing = useScript(ref)
  // `TRACE.length` is the finished frame: every step done.
  const [cursor, setCursor] = React.useState(TRACE.length)
  const started = React.useRef(false)

  React.useEffect(() => {
    if (!playing) return
    if (!started.current) {
      started.current = true
      const begin = setTimeout(() => setCursor(0), 500)
      return () => clearTimeout(begin)
    }
    const dwell = cursor >= TRACE.length ? 3600 : (DWELL[cursor] ?? 1500)
    const timer = setTimeout(
      () => setCursor((value) => (value >= TRACE.length ? 0 : value + 1)),
      dwell
    )
    return () => clearTimeout(timer)
  }, [playing, cursor])

  const steps: ToolTraceStep[] = TRACE.map((step, index) => ({
    ...step,
    state: index < cursor ? "done" : index === cursor ? "running" : "pending",
  }))

  return (
    <div ref={ref} className="w-full max-w-[34rem]">
      <ToolTrace
        label="Agent run"
        steps={steps}
        status={cursor >= TRACE.length ? "Pull request opened" : undefined}
        announce={false}
      />
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/* Agent Hive                                                                */
/* ------------------------------------------------------------------------ */

function Mark({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

const MODELS: AgentHiveModel[] = [
  {
    id: "aster",
    label: "Aster 3",
    description: "Long context",
    accent: "oklch(0.63 0.19 42)",
    icon: (
      <Mark>
        <path d="M12 2.9v18.2M4.12 7.45l15.76 9.1M4.12 16.55l15.76-9.1" />
      </Mark>
    ),
  },
  {
    id: "prism",
    label: "Prism Flash",
    description: "Drafts and rewrites",
    accent: "oklch(0.52 0.2 268)",
    icon: (
      <Mark>
        <path d="M10.4 2.8c.5 4.1 2.1 5.7 6.2 6.2-4.1.5-5.7 2.1-6.2 6.2-.5-4.1-2.1-5.7-6.2-6.2 4.1-.5 5.7-2.1 6.2-6.2Z" />
        <path d="M17.6 14.4c.26 2 1.04 2.78 3.04 3.04-2 .26-2.78 1.04-3.04 3.04-.26-2-1.04-2.78-3.04-3.04 2-.26 2.78-1.04 3.04-3.04Z" />
      </Mark>
    ),
  },
  {
    id: "nimbus",
    label: "Nimbus 2",
    description: "Code and structured output",
    accent: "oklch(0.55 0.13 195)",
    icon: (
      <Mark>
        <circle cx="12" cy="7.9" r="4.1" />
        <circle cx="8.3" cy="14.3" r="4.1" />
        <circle cx="15.7" cy="14.3" r="4.1" />
      </Mark>
    ),
  },
  {
    id: "quartz",
    label: "Quartz Mini",
    description: "Cheap enough for every row",
    accent: "oklch(0.5 0.15 155)",
    icon: (
      <Mark>
        <path d="M12 3.2 5.6 12 12 20.8 18.4 12 12 3.2Z" />
        <path d="M6.4 12h11.2" />
      </Mark>
    ),
  },
]

const PROMPTS = [
  "Find every component still missing an accessible name",
  "Draft release notes from this week's merged pull requests",
  "Profile the catalog page and suggest what to lazy-load",
  "Summarise the open issues into three themes",
]

const SEED: AgentHiveRun[] = [
  {
    id: "seed-2",
    prompt: "Rewrite the onboarding copy for the empty dashboard",
    modelId: "prism",
    state: "done",
  },
  {
    id: "seed-1",
    prompt: "Trace the failing checkout webhook back to its retry",
    modelId: "aster",
    state: "done",
  },
]

export function AgentHiveScene() {
  const [runs, setRuns] = React.useState<AgentHiveRun[]>(SEED)
  const asked = React.useRef(0)
  const timers = React.useRef<Array<ReturnType<typeof setTimeout>>>([])

  React.useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  function onGenerate(model: AgentHiveModel) {
    const id = `run-${Date.now()}`
    const prompt = PROMPTS[asked.current % PROMPTS.length] ?? PROMPTS[0]!
    asked.current += 1
    setRuns((current) =>
      [{ id, prompt, modelId: model.id, state: "working" as const }, ...current].slice(0, 4)
    )
    timers.current.push(
      setTimeout(() => {
        setRuns((current) =>
          current.map((run) => (run.id === id ? { ...run, state: "done" } : run))
        )
      }, 2800)
    )
  }

  return (
    <div className="w-full max-w-[40rem]">
      <AgentHive
        models={MODELS}
        defaultValue="nimbus"
        runs={runs}
        onGenerate={onGenerate}
        label="Dispatch a run"
      />
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/* Approval Gate                                                             */
/* ------------------------------------------------------------------------ */

export function ApprovalGateScene() {
  const [take, setTake] = React.useState(0)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  return (
    <div className="w-full max-w-[34rem]">
      <ApprovalGate
        key={take}
        title="Push the release tag"
        reason="The changelog is written and every check has passed."
        tool="bash"
        meta="~/join-ui"
        prefix="$"
        command="git tag v0.4.0 && git push origin v0.4.0"
        risk="medium"
        onDecision={() => {
          if (timer.current) clearTimeout(timer.current)
          timer.current = setTimeout(() => setTake((value) => value + 1), 2600)
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/* Status Timeline                                                           */
/* ------------------------------------------------------------------------ */

const DELIVERY = [
  { id: "confirmed", title: "Order confirmed", timestamp: "Mon, 13:45", icon: <ShoppingBag /> },
  { id: "packed", title: "Packed", timestamp: "Mon, 16:02", icon: <Package /> },
  { id: "transit", title: "In transit", timestamp: "Tue, 08:20", icon: <Truck /> },
  { id: "delivered", title: "Delivered", timestamp: "Wed, 11:10", icon: <MapPin /> },
]

export function StatusTimelineScene() {
  const ref = React.useRef<HTMLDivElement>(null)
  const playing = useScript(ref)
  const [active, setActive] = React.useState(2)

  React.useEffect(() => {
    if (!playing) return
    const timer = setTimeout(
      () => setActive((value) => (value >= DELIVERY.length ? 1 : value + 1)),
      active >= DELIVERY.length ? 3200 : 2200
    )
    return () => clearTimeout(timer)
  }, [playing, active])

  return (
    <div ref={ref} className="w-full max-w-[22rem]">
      <StatusTimeline label="Delivery" size="sm" activeStep={active} steps={DELIVERY} />
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/* Focus Stack                                                               */
/* ------------------------------------------------------------------------ */

const FOCUS: FocusStackItem[] = [
  {
    id: "language",
    label: "Design Language",
    icon: <Compass />,
    accent: "oklch(0.55 0.22 275)",
  },
  { id: "modules", label: "Visual Modules", icon: <Boxes />, accent: "oklch(0.72 0.19 350)" },
  {
    id: "architecture",
    label: "UI Architecture",
    icon: <Layers />,
    accent: "oklch(0.58 0.26 305)",
  },
  { id: "motion", label: "Motion System", icon: <Waves />, accent: "oklch(0.65 0.2 22)" },
  { id: "brand", label: "Brand Framework", icon: <Sparkles />, accent: "oklch(0.7 0.15 158)" },
]

export function FocusStackScene() {
  return (
    <div className="flex w-full justify-center">
      <FocusStack label="Design system" items={FOCUS} size="md" interval={2200} />
    </div>
  )
}
