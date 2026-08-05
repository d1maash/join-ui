"use client"

import * as React from "react"

import {
  AgentHive,
  type AgentHiveModel,
  type AgentHiveRun,
} from "@/registry/components/agent-hive"
import { cn } from "@/lib/utils"

/*
 * The marks are drawn here rather than pulled from an icon set, because a model
 * badge is a piece of identity: a stock icon reads as a placeholder, and the
 * `icon` prop takes any node precisely so a real product can hand it a brand
 * mark. Each one is a single stroke weight on a 24-unit grid, sized by the
 * component through `[&_svg]:size-full`.
 */
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

/** Six rays from a point — a burst. */
const ASTER = (
  <Mark>
    <path d="M12 2.9v18.2M4.12 7.45l15.76 9.1M4.12 16.55l15.76-9.1" />
  </Mark>
)

/** A four-point star with a smaller one trailing it. */
const PRISM = (
  <Mark>
    <path d="M10.4 2.8c.5 4.1 2.1 5.7 6.2 6.2-4.1.5-5.7 2.1-6.2 6.2-.5-4.1-2.1-5.7-6.2-6.2 4.1-.5 5.7-2.1 6.2-6.2Z" />
    <path d="M17.6 14.4c.26 2 1.04 2.78 3.04 3.04-2 .26-2.78 1.04-3.04 3.04-.26-2-1.04-2.78-3.04-3.04 2-.26 2.78-1.04 3.04-3.04Z" />
  </Mark>
)

/** Three rings in a knot. */
const NIMBUS = (
  <Mark>
    <circle cx="12" cy="7.9" r="4.1" />
    <circle cx="8.3" cy="14.3" r="4.1" />
    <circle cx="15.7" cy="14.3" r="4.1" />
  </Mark>
)

/** A cut stone: a rhombus with its girdle. */
const QUARTZ = (
  <Mark>
    <path d="M12 3.2 5.6 12 12 20.8 18.4 12 12 3.2Z" />
    <path d="M6.4 12h11.2" />
  </Mark>
)

/** Two chevrons — speed. */
const SWIFT = (
  <Mark>
    <path d="M6.5 5.5 13 12l-6.5 6.5M13.5 5.5 20 12l-6.5 6.5" />
  </Mark>
)

/** Rings inside rings — depth. */
const DEEP = (
  <Mark>
    <circle cx="12" cy="12" r="8.2" />
    <circle cx="12" cy="12" r="3.4" />
  </Mark>
)

/** An orbit, seen edge on — reach. */
const WIDE = (
  <Mark>
    <ellipse cx="12" cy="12" rx="9.4" ry="4.4" transform="rotate(-28 12 12)" />
    <circle cx="12" cy="12" r="1.9" />
  </Mark>
)

const MODELS: AgentHiveModel[] = [
  {
    id: "aster",
    label: "Aster 3",
    description: "Long context",
    icon: ASTER,
    accent: "oklch(0.63 0.19 42)",
  },
  {
    id: "prism",
    label: "Prism Flash",
    description: "Drafts and rewrites",
    icon: PRISM,
    accent: "oklch(0.52 0.2 268)",
  },
  {
    id: "nimbus",
    label: "Nimbus 2",
    description: "Code and structured output",
    icon: NIMBUS,
    accent: "oklch(0.55 0.13 195)",
  },
  {
    id: "quartz",
    label: "Quartz Mini",
    description: "Cheap enough for every row",
    icon: QUARTZ,
    accent: "oklch(0.5 0.15 155)",
  },
]

/* What the demo types out, in the order it is asked for. */
const PROMPTS = [
  "Identify code optimizations and performance improvements",
  "Summarise this week's incidents into a changelog entry",
  "Draft migration notes for the new pricing tables",
  "Find every component still missing an accessible name",
]

const SEED: AgentHiveRun[] = [
  {
    id: "seed-1",
    prompt: "Rewrite the onboarding copy for the empty dashboard",
    modelId: "prism",
    state: "done",
  },
  {
    id: "seed-2",
    prompt: "Trace the failing checkout webhook back to its retry",
    modelId: "aster",
    state: "failed",
  },
]

/** How long a simulated run stays in flight before it lands. */
const RUN_MS = 3400

const COMPACT: AgentHiveModel[] = [
  { id: "swift", label: "Swift", icon: SWIFT, accent: "oklch(0.55 0.13 195)" },
  { id: "deep", label: "Deep", icon: DEEP, accent: "oklch(0.52 0.2 268)" },
  { id: "wide", label: "Wide", icon: WIDE },
]

const QUEUE: AgentHiveRun[] = [
  {
    id: "q-1",
    prompt: "Regenerate the API reference",
    modelId: "deep",
    state: "working",
  },
  {
    id: "q-2",
    prompt: "Diff the schema against staging",
    modelId: "swift",
    state: "queued",
  },
  { id: "q-3", prompt: "Backfill the search index", modelId: "wide", state: "done" },
]

/*
 * Two panels sharing one grid: the parent owns the rows, each panel spans both
 * of them through `subgrid`, so the hives start on the same line however many
 * lines the caption above them happens to run to.
 */
const PAIR = "grid gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-4"
const ALIGNED = "lg:row-span-2 lg:grid lg:grid-rows-subgrid"

export default function AgentHivePreview() {
  const [runs, setRuns] = React.useState<AgentHiveRun[]>(SEED)
  const [model, setModel] = React.useState("prism")
  const counter = React.useRef(0)
  const timers = React.useRef<number[]>([])

  /* Every simulated run is a timer, and none of them may outlive the preview. */
  React.useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])

  function generate(picked: AgentHiveModel) {
    counter.current += 1
    const id = `run-${counter.current}`
    const prompt = PROMPTS[(counter.current - 1) % PROMPTS.length] ?? PROMPTS[0] ?? ""

    setRuns((current) =>
      [{ id, prompt, modelId: picked.id, state: "working" as const }, ...current].slice(
        0,
        6
      )
    )

    timers.current.push(
      window.setTimeout(() => {
        setRuns((current) =>
          current.map((run) =>
            run.id === id ? { ...run, state: "done" as const } : run
          )
        )
      }, RUN_MS)
    )
  }

  return (
    <div className={cn("w-full max-w-4xl", PAIR)}>
      <Panel
        className={ALIGNED}
        caption="Pick, then generate"
        description="The comb is frosted glass over a wash of the selected model's colour, and one tinted tile slides between the cells — stretching along its own direction of travel, with the marker smearing along the rail above. Press the action: a run drops in and types itself out, and the one below it is finished text the moment it does."
      >
        <AgentHive
          label="Model"
          models={MODELS}
          value={model}
          onValueChange={setModel}
          runs={runs}
          onGenerate={generate}
        />
      </Panel>

      <Panel
        className={ALIGNED}
        caption={<Code>size=&quot;sm&quot;</Code>}
        description="A tighter comb and every run state at once. Nothing types here — these rows were on screen at mount, and history does not retype itself."
      >
        <AgentHive
          label="Engine"
          models={COMPACT}
          comb={[2, 3, 2]}
          size="sm"
          runs={QUEUE}
          maxRuns={2}
          actionLabel="Run"
        />
      </Panel>
    </div>
  )
}

function Panel({
  caption,
  description,
  className,
  children,
}: {
  /** A `<Code>` where the caption names an actual prop, plain text otherwise. */
  caption: React.ReactNode
  description: string
  /** Carries `ALIGNED` when the panel is one half of a two-up row. */
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-1">
        <span className="label-section text-foreground">{caption}</span>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-start justify-center">{children}</div>
    </div>
  )
}

/** Mono is reserved for the captions that really are quoting the API. */
function Code({ children }: { children: string }) {
  return (
    <code className="font-mono text-[0.75rem] font-medium text-foreground">
      {children}
    </code>
  )
}
