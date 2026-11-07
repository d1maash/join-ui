"use client"

import * as React from "react"
import {
  FileText,
  GitPullRequest,
  PenLine,
  Play,
  RotateCcw,
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
          Wrote the component and registered its preview. Anything passed to{" "}
          <Code>detail</Code> lands here, above the console.
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
    detail: "Opening this one folded the last shut, because multiple is off.",
  },
]

/*
 * Two panels sharing one grid: the parent owns the rows, each panel spans both
 * of them through `subgrid`, and so the cards start on the same line however
 * many lines the caption above them happens to run to.
 */
const PAIR = "grid gap-14 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-5"
const ALIGNED = "lg:row-span-2 lg:grid lg:grid-rows-subgrid"

export default function ToolTracePreview() {
  const { steps, running, start, reset } = useScriptedRun()
  const done = steps.filter((step) => step.state === "done").length

  return (
    <div className="flex w-full max-w-5xl flex-col gap-14 font-sans">
      <Panel
        caption="A run, as it happens"
        description="Press Run. Each tool opens as it starts, writes its output line by line, then folds away and hands the rail on — until one fails and the rest are skipped."
      >
        <ToolTrace
          label="Agent run"
          steps={steps}
          className="max-w-2xl"
          footer={
            <div className="flex items-center justify-between gap-3">
              <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                {done} of {SCRIPT.length} done
              </span>
              <div className="flex items-center gap-2">
                <Button tone="gray" onClick={reset}>
                  <RotateCcw aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
                  Reset
                </Button>
                <Button onClick={start} disabled={running}>
                  <Play aria-hidden="true" className="size-3.5 fill-current" strokeWidth={2.5} />
                  Run
                </Button>
              </div>
            </div>
          }
        />
      </Panel>

      <div className={PAIR}>
        <Panel
          className={ALIGNED}
          caption={<Code>icon</Code>}
          description="A glyph per tool in place of the state mark. The tile, the rail and the spoken label still carry the outcome, and the step that failed stays open."
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
          description="Opening a step folds the last one shut, so a long chain stays on one screen. A step with nothing to print explains itself through detail."
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
  const [playing, setPlaying] = React.useState(false)

  const failedAt = SCRIPT.findIndex(
    (entry, index) => entry.result === "failed" && index < cursor
  )

  /*
   * Derived rather than held: the run stops because it reached the end or
   * because a tool failed, and both of those are already in `cursor`. Nothing
   * has to be switched off after the fact.
   */
  const running = playing && failedAt === -1 && cursor < SCRIPT.length

  React.useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(
      () => setCursor((index) => index + 1),
      SCRIPT[cursor]?.dwell ?? 0
    )
    return () => window.clearTimeout(timer)
  }, [running, cursor])

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
      setPlaying(true)
    },
    reset: () => {
      setPlaying(false)
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
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex max-w-xl flex-col gap-1.5 px-1">
        <span className="text-[1.0625rem] leading-[1.375rem] font-semibold tracking-[-0.022em] text-foreground">
          {caption}
        </span>
        <p className="text-[0.9375rem] leading-[1.35rem] tracking-[-0.009em] text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}

/** Mono is reserved for the captions that really are quoting the API. */
function Code({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-[0.92em] font-medium text-foreground">{children}</code>
}

/**
 * The two button styles the demo needs: tinted for the action, grey beside it
 * — a demo affordance, not the site's own button.
 */
function Button({
  tone = "tinted",
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  tone?: "tinted" | "gray"
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[0.8125rem] font-semibold tracking-[-0.006em]",
        "transition-[background-color,opacity,scale] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] active:scale-[0.97]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-40",
        tone === "tinted" && "bg-info-soft text-info hover:bg-info/20",
        tone === "gray" && "bg-muted/70 text-foreground hover:bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
