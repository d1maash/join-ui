"use client"

import * as React from "react"

import {
  AgentHive,
  type AgentHiveModel,
  type AgentHiveRun,
} from "@/registry/components/agent-hive"
import {
  DEEP,
  MODELS,
  PROMPTS,
  SWIFT,
  WIDE,
} from "@/components/previews/fixtures/agent-hive"
import { cn } from "@/lib/utils"

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
const PAIR = "grid gap-14 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-7"
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
    <div className={cn("w-full max-w-4xl py-4", PAIR)}>
      <Panel
        className={ALIGNED}
        caption="Pick, then generate"
        description="One tinted tile glides between frosted cells and lights the glass around it. Press Generate and the run types itself into the queue."
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
        caption="Compact"
        code={'size="sm"'}
        description="A tighter comb, with every run state at once. Rows that were there at mount are history, and never retype."
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

/*
 * Captions in Apple's two text styles: a 17pt semibold headline over a 15pt
 * subhead in the secondary ink. Mono appears only where a caption quotes the
 * API, as a quiet tag beside the title rather than as the title itself.
 */
function Panel({
  caption,
  code,
  description,
  className,
  children,
}: {
  caption: string
  /** The prop the panel demonstrates, quoted exactly. */
  code?: string
  description: string
  /** Carries `ALIGNED` when the panel is one half of a two-up row. */
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex max-w-md flex-col gap-1.5">
        <div className="flex items-baseline gap-2.5">
          <p className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.022em] text-foreground">
            {caption}
          </p>
          {code ? (
            <code className="font-mono text-[0.8125rem] text-muted-foreground">{code}</code>
          ) : null}
        </div>
        <p className="text-[0.9375rem] leading-[1.47] tracking-[-0.009em] text-pretty text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex items-start justify-center">{children}</div>
    </div>
  )
}
