import {
  BellRing,
  CandlestickChart,
  Fingerprint,
  Repeat2,
  ShieldCheck,
  Snowflake,
} from "lucide-react"

import type { ApprovalGateDecision } from "@/registry/components/approval-gate"
import type { FocusStackItem } from "@/registry/components/focus-stack"
import type { StatusTimelineStep } from "@/registry/components/status-timeline"
import type { ToolTraceStep } from "@/registry/components/tool-trace"

/*
 * The script. One run, start to finish: a model is picked, the work is done,
 * a person is asked, the thing ships, and the page it built is shown. Every
 * line of copy the window displays lives here, so the story can be read top
 * to bottom without any of the machinery around it.
 */

export const TASK = "Build the launch page and ship it"
export const BRANCH = "feat/launch-page"
export const RUN_NO = "Run 148"

export type ChapterId = "pick" | "work" | "ask" | "ship" | "output"

export interface Chapter {
  id: ChapterId
  no: string
  name: string
  /** Where the chapter sits on the story's scroll, 0–1. */
  start: number
  end: number
  /** The component performing it. */
  slug: string
  component: string
  /** The caption: a first clause in ink, the rest in grey. */
  lead: string
  body: string
}

export const CHAPTERS: Chapter[] = [
  {
    id: "pick",
    no: "01",
    name: "Pick",
    start: 0.02,
    end: 0.19,
    slug: "agent-hive",
    component: "Agent Hive",
    lead: "Pick a model, press Generate.",
    body: "One tinted tile glides across a comb of glass, and the run types itself into the queue.",
  },
  {
    id: "work",
    no: "02",
    name: "Work",
    start: 0.19,
    end: 0.39,
    slug: "tool-trace",
    component: "Tool Trace",
    lead: "Watch the work, not a spinner.",
    body: "Each tool call opens as it starts, streams what came back, and folds away when it lands.",
  },
  {
    id: "ask",
    no: "03",
    name: "Ask",
    start: 0.39,
    end: 0.53,
    slug: "approval-gate",
    component: "Approval Gate",
    lead: "It stops before anything it can’t take back.",
    body: "A force-push rewrites history, so the agent asks first. This one is yours.",
  },
  {
    id: "ship",
    no: "04",
    name: "Ship",
    start: 0.53,
    end: 0.67,
    slug: "status-timeline",
    component: "Status Timeline",
    lead: "Four steps to production, one at a time.",
    body: "The rail runs on only when a step clears, and every colour comes with a word.",
  },
  {
    id: "output",
    no: "05",
    name: "Output",
    start: 0.67,
    end: 0.86,
    slug: "glass-crest",
    component: "Glass Crest",
    lead: "And this is what it shipped.",
    body: "Glass Crest, Carbon Copy and Focus Stack — the same files the CLI writes into your project.",
  },
]

/** The last stretch of the story: pull back, and see the cast. */
export const CAST_START = 0.86

export const CAST = [
  { slug: "agent-hive", title: "Agent Hive", chapter: "01 Pick" },
  { slug: "tool-trace", title: "Tool Trace", chapter: "02 Work" },
  { slug: "approval-gate", title: "Approval Gate", chapter: "03 Ask" },
  { slug: "status-timeline", title: "Status Timeline", chapter: "04 Ship" },
  { slug: "glass-crest", title: "Glass Crest", chapter: "05 Output" },
  { slug: "carbon-copy", title: "Carbon Copy", chapter: "05 Output" },
  { slug: "focus-stack", title: "Focus Stack", chapter: "05 Output" },
] as const

/* ─── 01 Pick ─────────────────────────────────────────────────────────────── */

/** The model the selection walks through on its way to the one that runs. */
export const PICK_PATH = ["prism", "aster", "nimbus"] as const
export const CHOSEN_MODEL = "nimbus"

/* ─── 02 Work ─────────────────────────────────────────────────────────────── */

const WORK: Array<Omit<ToolTraceStep, "state">> = [
  {
    id: "read",
    name: "read_file",
    summary: "app/(marketing)/page.tsx",
    meta: "0.2s",
    output: ["→ 182 lines, 6.4 kB", "export default function Home() {"],
  },
  {
    id: "grep",
    name: "grep_search",
    summary: 'pattern: "<Hero", glob: "app/**"',
    meta: "0.3s",
    output: ["app/(marketing)/page.tsx:14", "→ 1 match"],
  },
  {
    id: "edit",
    name: "edit_file",
    summary: "app/(marketing)/page.tsx",
    meta: "1.1s",
    output: [
      "+ 64 insertions  − 18 deletions",
      "+ GlassCrest, CarbonCopy, FocusStack",
      "→ 1 file changed",
    ],
  },
  {
    id: "test",
    name: "run_tests",
    summary: "pnpm test",
    meta: "3.8s",
    output: ["✓ 52 passed", "✓ 0 failed", "→ exit 0"],
  },
]

/** How far into the chapter each step starts and lands, 0–1. */
const WORK_BEATS = WORK.map((_, index) => ({
  start: 0.04 + index * 0.23,
  done: 0.04 + index * 0.23 + 0.17,
}))

/** Beats crossed so far: two per step (start, land). 0–8. */
export function workBeat(t: number): number {
  let beat = 0
  for (const step of WORK_BEATS) {
    if (t >= step.start) beat += 1
    if (t >= step.done) beat += 1
  }
  return beat
}

export const PUSH_COMMAND = `git push --force-with-lease origin ${BRANCH}`

export type Decision = ApprovalGateDecision | null

/**
 * The trace, at a given beat, with whatever the person decided. The push sits
 * at the bottom from the start — queued, waiting to be allowed — so the reader
 * can see the question coming before the gate asks it.
 */
export function traceSteps(
  beat: number,
  decision: Decision,
  asking: boolean
): ToolTraceStep[] {
  const steps: ToolTraceStep[] = WORK.map((step, index) => {
    const started = beat >= index * 2 + 1
    const landed = beat >= index * 2 + 2
    return {
      ...step,
      state: landed ? "done" : started ? "running" : "pending",
      meta: landed ? step.meta : undefined,
    }
  })

  if (decision === "allow") {
    steps.push({
      id: "push",
      name: "git_push",
      summary: "--force-with-lease origin feat/launch-page",
      state: "done",
      meta: "0.9s",
      output: ["→ feat/launch-page", "1 commit rewritten, allowed by you"],
    })
  } else if (decision === "deny" || decision === "expire") {
    steps.push(
      {
        id: "push",
        name: "git_push",
        summary: "--force-with-lease origin feat/launch-page",
        state: "skipped",
        meta: decision === "deny" ? "denied" : "expired",
      },
      {
        id: "push-safe",
        name: "git_push",
        summary: "origin feat/launch-page-2",
        state: "done",
        meta: "0.7s",
        output: ["→ new branch, nothing overwritten"],
      }
    )
  } else {
    steps.push({
      id: "push",
      name: "git_push",
      summary: "--force-with-lease origin feat/launch-page",
      state: asking ? "running" : "pending",
      meta: "needs approval",
    })
  }

  return steps
}

/* ─── 03 Ask ──────────────────────────────────────────────────────────────── */

export const DECISION_LINE: Record<
  ApprovalGateDecision,
  { lead: string; body: string }
> = {
  allow: {
    lead: "Allowed.",
    body: "It pushes over the stale commit and moves on.",
  },
  deny: {
    lead: "Denied.",
    body: "It pushes a fresh branch instead. Nothing is overwritten.",
  },
  expire: {
    lead: "Nobody answered.",
    body: "So it took the safe path: a fresh branch, nothing overwritten.",
  },
}

/* ─── 04 Ship ─────────────────────────────────────────────────────────────── */

export function shipActive(t: number): number {
  if (t < 0.08) return 0
  return Math.min(4, Math.floor((t - 0.08) / 0.19) + 1)
}

export function shipSteps(active: number, safePath: boolean): StatusTimelineStep[] {
  const rows: Array<Omit<StatusTimelineStep, "timestamp"> & { took: string }> = [
    {
      id: "build",
      title: "Build",
      description: "next build — 41 routes",
      took: "0:38",
    },
    {
      id: "preview",
      title: "Preview",
      description: safePath ? "launch-page-2.lumen.dev" : "launch-page.lumen.dev",
      took: "0:12",
    },
    {
      id: "checks",
      title: "Checks",
      description: "52 tests · axe 0 issues · LCP 0.9s",
      took: "1:04",
    },
    {
      id: "production",
      title: "Production",
      description: "lumen.app",
      took: "0:09",
    },
  ]
  return rows.map(({ took, ...row }, index) => ({
    ...row,
    timestamp: index < active ? took : undefined,
  }))
}

/* ─── 05 Output ───────────────────────────────────────────────────────────── */

export const SITE = {
  name: "Lumen",
  url: "lumen.app",
}

export const FEATURES: FocusStackItem[] = [
  {
    id: "swaps",
    label: "Instant swaps",
    description: "Between any two assets, at the quoted price.",
    icon: <Repeat2 />,
    accent: "oklch(0.6 0.2 256)",
  },
  {
    id: "cold",
    label: "Cold storage",
    description: "Keys that never touch the network.",
    icon: <Snowflake />,
    accent: "oklch(0.62 0.13 215)",
  },
  {
    id: "passkeys",
    label: "Passkeys",
    description: "Sign with your face, not a seed phrase.",
    icon: <Fingerprint />,
    accent: "oklch(0.6 0.21 300)",
  },
  {
    id: "alerts",
    label: "Price alerts",
    description: "One line, when it matters.",
    icon: <BellRing />,
    accent: "oklch(0.72 0.17 60)",
  },
  {
    id: "charts",
    label: "Live charts",
    description: "Every pair, to the second.",
    icon: <CandlestickChart />,
    accent: "oklch(0.66 0.21 18)",
  },
  {
    id: "insured",
    label: "Insured custody",
    description: "Covered up to $250k per account.",
    icon: <ShieldCheck />,
    accent: "oklch(0.66 0.17 152)",
  },
]

