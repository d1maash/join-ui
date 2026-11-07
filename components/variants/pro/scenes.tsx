"use client"

import * as React from "react"
import {
  Accessibility,
  Asterisk,
  Atom,
  Compass,
  Gem,
  Layers,
  Package,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Terminal,
  Truck,
  Wand2,
  MapPin,
} from "lucide-react"
import { useReducedMotion } from "motion/react"

import {
  AgentHive,
  type AgentHiveModel,
  type AgentHiveRun,
} from "@/registry/components/agent-hive"
import {
  ApprovalGate,
  type ApprovalGateDecision,
} from "@/registry/components/approval-gate"
import { CarbonCopy } from "@/registry/components/carbon-copy"
import { FocusStack, type FocusStackItem } from "@/registry/components/focus-stack"
import {
  CrestAction,
  CrestQuiet,
  GlassCrest,
  type GlassCrestMark,
} from "@/registry/components/glass-crest"
import { StatusTimeline } from "@/registry/components/status-timeline"
import { ToolTrace, type ToolTraceStep } from "@/registry/components/tool-trace"
import { cn } from "@/lib/utils"

/*
 * One scene per component: the real registry component, given props that show
 * it at its best, on its own. These are what the landing page lights up — the
 * product is the picture, so nothing here is a screenshot or a mock.
 *
 * Scenes that tell a story over time (a run, a delivery) run it on a timer
 * while they are mounted, and hold one complete, representative frame when
 * Reduce Motion is on.
 */

/** A timer-driven phase counter that stands still under Reduce Motion. */
function usePhase(count: number, interval: number, still: number) {
  const reduce = useReducedMotion()
  const [phase, setPhase] = React.useState(0)

  React.useEffect(() => {
    if (reduce) return
    const id = window.setInterval(
      () => setPhase((value) => (value + 1) % count),
      interval
    )
    return () => window.clearInterval(id)
  }, [reduce, count, interval])

  return reduce ? still : phase
}

function Replay({
  onClick,
  label = "Replay",
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-white/[0.08] px-3.5 text-[13px] text-[#e8e8ed]",
        "transition-colors hover:bg-white/[0.14]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2997ff]"
      )}
    >
      <RotateCcw aria-hidden="true" className="size-3.5" />
      {label}
    </button>
  )
}

/* ------------------------------------------------------------------------ */

export function ApprovalScene() {
  const [decision, setDecision] = React.useState<ApprovalGateDecision | null>(null)

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5">
      <ApprovalGate
        className="w-full"
        title="Reinstall the dependencies"
        reason="The lockfile no longer matches node_modules."
        tool="bash"
        meta="~/join-ui"
        prefix="$"
        command="rm -rf node_modules .next && pnpm install"
        risk="high"
        timeout={30_000}
        decision={decision}
        onDecision={setDecision}
      />
      <div className="flex h-8 items-center">
        {decision === null ? (
          <p className="text-[13px] text-[#86868b]">
            Focus the card, then press Y or N.
          </p>
        ) : (
          <Replay onClick={() => setDecision(null)} label="Ask again" />
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ */

const TRACE: Array<Omit<ToolTraceStep, "state">> = [
  {
    id: "read",
    name: "read_file",
    summary: "lib/registry/components.ts",
    meta: "0.3s",
    output: ["→ 2,506 lines, 96.4 kB"],
  },
  {
    id: "edit",
    name: "edit_file",
    summary: "registry/components/tool-trace.tsx",
    meta: "1.2s",
    output: ["@@ -212,6 +212,18 @@", "+ 18 lines, − 6"],
  },
  {
    id: "test",
    name: "run_tests",
    summary: "pnpm check",
    meta: "31s",
    output: ["✓ registry:validate", "✓ typecheck", "✓ lint"],
  },
  {
    id: "pr",
    name: "open_pull_request",
    summary: "Fold finished steps away",
    meta: "0.8s",
    output: ["→ #128 opened against main"],
  },
]

export function TraceScene() {
  // Four steps run one after another, the finished run rests, and it starts over.
  const phase = usePhase(TRACE.length + 2, 2600, 2)
  const steps: ToolTraceStep[] = TRACE.map((step, index) => ({
    ...step,
    state: index < phase ? "done" : index === phase ? "running" : "pending",
    meta: index < phase ? step.meta : undefined,
  }))

  return (
    <ToolTrace
      className="w-full max-w-xl"
      label="Agent run"
      status={phase >= TRACE.length ? "Finished" : undefined}
      steps={steps}
    />
  )
}

/* ------------------------------------------------------------------------ */

const DELIVERY = [
  {
    id: "confirmed",
    title: "Order confirmed",
    timestamp: "17 Nov, 13:45",
    icon: <ShoppingBag />,
  },
  { id: "packed", title: "Packed", timestamp: "17 Nov, 16:02", icon: <Package /> },
  { id: "transit", title: "In transit", timestamp: "18 Nov, 08:20", icon: <Truck /> },
  { id: "delivered", title: "Delivered", timestamp: "Today", icon: <MapPin /> },
]

export function TimelineScene() {
  const phase = usePhase(DELIVERY.length + 1, 2200, 2)

  return (
    <StatusTimeline
      className="w-full max-w-md"
      label="Delivery"
      activeStep={phase}
      steps={DELIVERY}
    />
  )
}

/* ------------------------------------------------------------------------ */

export function CarbonScene() {
  const [take, setTake] = React.useState(0)

  return (
    <div className="flex w-full flex-col items-center gap-10 px-4">
      <CarbonCopy
        key={take}
        as="p"
        trigger="mount"
        lines={["Build it fast.", "Build it right.", "Build it once."]}
        className="text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.02] tracking-[-0.045em] text-[#f5f5f7]"
      />
      <Replay onClick={() => setTake((value) => value + 1)} />
    </div>
  )
}

/* ------------------------------------------------------------------------ */

const FOCUS: FocusStackItem[] = [
  { id: "language", label: "Design language", icon: <Compass />, accent: "#5e5ce6" },
  { id: "motion", label: "Motion system", icon: <Sparkles />, accent: "#ff375f" },
  { id: "a11y", label: "Accessibility", icon: <Accessibility />, accent: "#0a84ff" },
  { id: "layers", label: "UI architecture", icon: <Layers />, accent: "#bf5af2" },
  { id: "cli", label: "Registry and CLI", icon: <Terminal />, accent: "#30d158" },
  { id: "prompt", label: "Agent prompts", icon: <Wand2 />, accent: "#ff9f0a" },
]

export function FocusScene() {
  return <FocusStack className="w-full" items={FOCUS} label="Capabilities" size="md" />
}

/* ------------------------------------------------------------------------ */

const MODELS: AgentHiveModel[] = [
  {
    id: "aster",
    label: "Aster 3",
    description: "Long context",
    icon: <Asterisk />,
    accent: "oklch(0.68 0.19 42)",
  },
  {
    id: "prism",
    label: "Prism Flash",
    description: "Drafts and rewrites",
    icon: <Sparkles />,
    accent: "oklch(0.6 0.2 268)",
  },
  {
    id: "nimbus",
    label: "Nimbus 2",
    description: "Code and structured output",
    icon: <Atom />,
    accent: "oklch(0.66 0.13 195)",
  },
  {
    id: "quartz",
    label: "Quartz Mini",
    description: "Cheap enough for every row",
    icon: <Gem />,
    accent: "oklch(0.64 0.15 155)",
  },
]

const PROMPTS = [
  "Find every component still missing an accessible name",
  "Summarise this week's incidents into a changelog entry",
  "Draft migration notes for the new pricing tables",
  "Identify code optimisations in the registry build",
]

export function HiveScene() {
  const [runs, setRuns] = React.useState<AgentHiveRun[]>([
    {
      id: "seed",
      prompt: "Rewrite the onboarding copy for the empty dashboard",
      modelId: "prism",
      state: "done",
      status: "Done",
    },
  ])
  const count = React.useRef(0)
  const timers = React.useRef<number[]>([])

  React.useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])

  function onGenerate(model: AgentHiveModel) {
    const index = count.current++
    const id = `run-${index}`
    const prompt = PROMPTS[index % PROMPTS.length]!
    const run: AgentHiveRun = { id, prompt, modelId: model.id, state: "working" }
    setRuns((current) => [run, ...current].slice(0, 3))
    timers.current.push(
      window.setTimeout(() => {
        setRuns((current) =>
          current.map((run) =>
            run.id === id ? { ...run, state: "done", status: "Done" } : run
          )
        )
      }, 2600)
    )
  }

  return (
    <AgentHive
      className="w-full max-w-md"
      models={MODELS}
      defaultValue="nimbus"
      runs={runs}
      onGenerate={onGenerate}
      maxRuns={3}
    />
  )
}

/* ------------------------------------------------------------------------ */

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {children}
    </svg>
  )
}

const MARKS: GlassCrestMark[] = [
  {
    id: "obol",
    label: "Obol",
    accent: "#dda15e",
    icon: (
      <Glyph>
        <path d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19Zm0 4.2a5.3 5.3 0 1 0 0 10.6 5.3 5.3 0 0 0 0-10.6Z" />
      </Glyph>
    ),
  },
  {
    id: "prism",
    label: "Prism",
    accent: "#2f7a63",
    icon: (
      <Glyph>
        <path d="M12 1.5 19.2 12 12 16.2 4.8 12z" />
        <path d="M12 17.7 19.2 13.5 12 22.5 4.8 13.5z" opacity={0.72} />
      </Glyph>
    ),
  },
  {
    id: "helix",
    label: "Helix",
    accent: "#5cc396",
    icon: (
      <Glyph>
        <path d="M12 1.6 20.6 6.8v10.4L12 22.4 3.4 17.2V6.8z" />
        <path d="M12 6.4 16.6 9.2v5.6L12 17.6 7.4 14.8V9.2z" opacity={0.55} />
      </Glyph>
    ),
  },
  {
    id: "azimuth",
    label: "Azimuth",
    accent: "#8fa2ee",
    icon: (
      <Glyph>
        <path d="M6.6 4.6h13.8l-3.4 3.6H3.2z" />
        <path d="M3.2 10.2h13.8l3.4 3.6H6.6z" opacity={0.72} />
        <path d="M6.6 15.8h13.8l-3.4 3.6H3.2z" opacity={0.5} />
      </Glyph>
    ),
  },
  {
    id: "cadence",
    label: "Cadence",
    accent: "#a6bfd2",
    icon: (
      <Glyph>
        <path d="M3.6 3.4h4.1L12 8.1l4.3-4.7h4.1L14 10.5a2.8 2.8 0 0 1-4 0z" />
        <path
          d="M3.6 20.6h4.1L12 15.9l4.3 4.7h4.1L14 13.5a2.8 2.8 0 0 0-4 0z"
          opacity={0.72}
        />
      </Glyph>
    ),
  },
]

export function CrestScene() {
  return (
    <GlassCrest
      className="mx-auto w-full max-w-xl"
      size="sm"
      marks={MARKS}
      crestLabel="Supported assets"
      headingLevel={3}
      headline={
        <>
          Every asset, <CrestQuiet>in one place</CrestQuiet>
        </>
      }
      description="Drag a disc out of the arc and let it spring back."
      actions={<CrestAction>Get started</CrestAction>}
    />
  )
}

/* ------------------------------------------------------------------------ */

export const SCENES: Record<string, React.ComponentType> = {
  "approval-gate": ApprovalScene,
  "tool-trace": TraceScene,
  "status-timeline": TimelineScene,
  "carbon-copy": CarbonScene,
  "focus-stack": FocusScene,
  "agent-hive": HiveScene,
  "glass-crest": CrestScene,
}

export function Scene({ slug }: { slug: string }) {
  const Component = SCENES[slug]
  return Component ? <Component /> : null
}
