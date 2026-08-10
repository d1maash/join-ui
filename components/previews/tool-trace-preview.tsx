"use client"

import * as React from "react"
import {
  FileText,
  GitPullRequest,
  PenLine,
  Play,
  RefreshCw,
  Search,
  TestTube,
} from "lucide-react"

import { ToolTrace, type ToolTraceStep } from "@/registry/components/tool-trace"
import { cn } from "@/lib/utils"

/**
 * The run the live panel plays back.
 *
 * `dwell` is how long the tool spends in flight — long enough for its output to
 * finish writing itself, so the console is never cut off mid-line by the step
 * resolving under it.
 */
const SCRIPT: Array<{
  step: ToolTraceStep
  result: "done" | "failed"
  dwell: number
}> = [
  {
    result: "done",
    dwell: 1400,
    step: {
      id: "read",
      name: "read_file",
      summary: "lib/registry/components.ts",
      meta: "0.3s",
      output: [
        "→ 1096 lines, 38.2 kB",
        "export const components: ComponentMetadata[] = [",
        "  defineComponent({ slug: \"status-timeline\", … }),",
        "  defineComponent({ slug: \"focus-stack\", … }),",
        "]",
      ],
    },
  },
  {
    result: "done",
    dwell: 1700,
    step: {
      id: "grep",
      name: "grep_search",
      summary: 'pattern: "defineComponent\\("',
      meta: "0.4s",
      output: [
        "lib/registry/components.ts:23",
        "lib/registry/components.ts:363",
        "lib/registry/components.ts:630",
        "lib/registry/define.ts:11",
        "→ 4 matches in 2 files",
      ],
    },
  },
  {
    result: "done",
    dwell: 1500,
    step: {
      id: "edit",
      name: "edit_file",
      summary: "registry/components/tool-trace.tsx",
      meta: "1.1s",
      detail: (
        <>
          Wrote the component and registered its preview. Anything you pass to{" "}
          <Code>detail</Code> lands here, above the console — prose, a diff, a
          link back to the file.
        </>
      ),
      output: ["+ 612 insertions", "- 0 deletions", "→ formatted, 1 file changed"],
    },
  },
  {
    result: "failed",
    dwell: 2100,
    step: {
      id: "test",
      name: "run_tests",
      summary: "pnpm check",
      meta: "4.6s",
      output: [
        "✓ registry valid — 4 components",
        "✓ typecheck",
        "✗ lint",
        "  tool-trace.tsx:284  react-hooks/exhaustive-deps",
        "→ 1 error, exit 1",
      ],
    },
  },
  {
    result: "done",
    dwell: 900,
    step: {
      id: "pr",
      name: "open_pull_request",
      summary: "feat/tool-trace → main",
    },
  },
]

/** The same run, at rest, with the step that failed already open. */
const FINISHED: ToolTraceStep[] = [
  {
    id: "read",
    name: "read_file",
    summary: "lib/registry/components.ts",
    meta: "0.3s",
    state: "done",
    icon: <FileText />,
  },
  {
    id: "grep",
    name: "grep_search",
    summary: 'pattern: "defineComponent\\("',
    meta: "0.4s",
    state: "done",
    icon: <Search />,
  },
  {
    id: "edit",
    name: "edit_file",
    summary: "registry/components/tool-trace.tsx",
    meta: "1.1s",
    state: "done",
    icon: <PenLine />,
  },
  {
    id: "test",
    name: "run_tests",
    summary: "pnpm check",
    meta: "4.6s",
    state: "failed",
    icon: <TestTube />,
    defaultOpen: true,
    output: [
      "✗ lint",
      "  tool-trace.tsx:284  react-hooks/exhaustive-deps",
      "→ 1 error, exit 1",
    ],
  },
  {
    id: "pr",
    name: "open_pull_request",
    summary: "feat/tool-trace → main",
    state: "skipped",
    icon: <GitPullRequest />,
  },
]

const RETRIEVAL: ToolTraceStep[] = [
  {
    id: "embed",
    name: "embed_query",
    meta: "38 tok",
    state: "done",
    detail: "Two sentences, one vector. Nothing worth a console.",
  },
  {
    id: "search",
    name: "vector_search",
    summary: "top_k: 4",
    meta: "0.2s",
    state: "done",
    output: [
      "0.91  docs/registry-setup.mdx",
      "0.88  docs/installation.mdx",
      "0.74  docs/theming.mdx",
      "0.61  docs/ai.mdx",
    ],
  },
  {
    id: "rerank",
    name: "rerank",
    summary: "keep: 2",
    meta: "0.5s",
    state: "done",
    output: ["0.94  docs/registry-setup.mdx", "0.79  docs/installation.mdx"],
  },
  {
    id: "answer",
    name: "compose_answer",
    meta: "1.4k tok",
    state: "done",
    detail:
      "One panel at a time: opening this one folded the last shut, because multiple is off.",
  },
]

/*
 * Two panels sharing one grid: the parent owns the rows, each panel spans both
 * of them through `subgrid`, and so the cards start on the same line however
 * many lines the caption above them happens to run to. `1fr` on the second row
 * then holds the two cards to a single height.
 */
const PAIR = "grid gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-3"
const ALIGNED = "lg:row-span-2 lg:grid lg:grid-rows-subgrid"

export default function ToolTracePreview() {
  const { steps, running, start, reset } = useScriptedRun()

  return (
    <div className="flex w-full max-w-5xl flex-col gap-10">
      <Panel
        caption="A run, as it happens"
        description="Press play. Each tool opens itself as it starts, writes its output a line at a time, then folds away and hands the rail to the next one — until one of them fails and the rest are skipped."
      >
        <ToolTrace
          label="Agent run"
          steps={steps}
          className="max-w-2xl"
          footer={
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                {steps.filter((step) => step.state === "done").length} / {SCRIPT.length}
              </span>
              <div className="flex items-center gap-1.5">
                <Pill onClick={start} disabled={running}>
                  <Play aria-hidden="true" className="size-3.5" />
                  Run
                </Pill>
                <Pill tone="quiet" onClick={reset}>
                  <RefreshCw aria-hidden="true" className="size-3.5" />
                  Reset
                </Pill>
              </div>
            </div>
          }
        />
      </Panel>

      <div className={PAIR}>
        <Panel
          className={ALIGNED}
          caption={<Code>icon</Code>}
          description="At rest the trace is a still drawing. A glyph per tool replaces the state marker while the ring, the rail and the hidden label keep carrying the outcome — and the step that failed is the one left open."
        >
          <ToolTrace
            label="Run 4812"
            steps={FINISHED}
            size="sm"
            variant="plain"
            showHeader={false}
            className="max-w-md"
          />
        </Panel>

        <Panel
          className={ALIGNED}
          caption={<Code>{"multiple={false}"}</Code>}
          description="Opening a step folds the last one shut, which keeps a long retrieval chain to one screen. detail takes markup, so a step with nothing to print still has somewhere to explain itself."
        >
          <ToolTrace
            label="Retrieval"
            steps={RETRIEVAL}
            size="sm"
            multiple={false}
            defaultExpanded={["search"]}
            className="max-w-md"
          />
        </Panel>
      </div>
    </div>
  )
}

/**
 * Plays `SCRIPT` back one tool at a time.
 *
 * The trace itself is stateless — it draws whatever `steps` say — so the demo
 * owns the run exactly the way a real caller would: a cursor, a timer per step,
 * and everything past a failure marked skipped.
 */
function useScriptedRun() {
  const [cursor, setCursor] = React.useState(0)
  const [running, setRunning] = React.useState(false)

  React.useEffect(() => {
    if (!running) return
    const current = SCRIPT[cursor]
    if (!current) {
      setRunning(false)
      return
    }

    const timer = window.setTimeout(() => {
      if (current.result === "failed") setRunning(false)
      setCursor((index) => index + 1)
    }, current.dwell)

    return () => window.clearTimeout(timer)
  }, [running, cursor])

  const failedAt = SCRIPT.findIndex(
    (entry, index) => entry.result === "failed" && index < cursor
  )

  const steps = SCRIPT.map((entry, index) => {
    const resolved = index < cursor
    const state = resolved
      ? entry.result
      : failedAt !== -1
        ? "skipped"
        : running && index === cursor
          ? "running"
          : "pending"

    return {
      ...entry.step,
      state,
      /* A duration on a step that has not run yet would be a lie. */
      meta: resolved ? entry.step.meta : undefined,
    } satisfies ToolTraceStep
  })

  return {
    steps,
    running,
    start: () => {
      setCursor(0)
      setRunning(true)
    },
    reset: () => {
      setRunning(false)
      setCursor(0)
    },
  }
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
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <span className="label-section text-foreground">{caption}</span>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

/** Mono is reserved for the captions that really are quoting the API. */
function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[0.75rem] font-medium text-foreground">
      {children}
    </code>
  )
}

/** Pill-shaped, tinted control — a demo affordance, not the site's own button. */
function Pill({
  tone = "neutral",
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  tone?: "neutral" | "quiet"
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-40",
        tone === "neutral" &&
          "bg-info-soft text-info hover:bg-info hover:text-info-foreground",
        tone === "quiet" && "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
