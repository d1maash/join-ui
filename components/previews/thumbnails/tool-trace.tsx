"use client"

import { ToolTrace, type ToolTraceStep } from "@/registry/components/tool-trace"

import { useBeats } from "./clock"

const RUN: ToolTraceStep[] = [
  {
    id: "read",
    name: "read_file",
    summary: "components.ts",
    meta: "0.3s",
    output: ["→ 1096 lines, 38.2 kB", "export const components = ["],
  },
  {
    id: "grep",
    name: "grep_search",
    summary: "defineComponent(",
    meta: "0.4s",
    output: ["components.ts:23", "components.ts:363", "→ 4 matches"],
  },
  {
    id: "edit",
    name: "edit_file",
    summary: "tool-trace.tsx",
    meta: "1.1s",
    output: ["+ 612 insertions", "→ 1 file changed"],
  },
  {
    id: "test",
    name: "run_tests",
    summary: "pnpm check",
    meta: "4.6s",
    output: ["✓ registry valid", "✓ typecheck", "✓ lint"],
  },
]

/*
 * One beat per tool — long enough for its output to finish writing before it
 * folds — and a last one on the finished run, at rest.
 */
const BEATS = [1300, 1500, 1300, 1600, 2200] as const

export default function ToolTraceThumbnail() {
  const { beat } = useBeats(BEATS, RUN.length)

  const steps = RUN.map((step, index) => {
    const done = index < beat
    return {
      ...step,
      state: done ? "done" : index === beat ? "running" : "pending",
      /* A duration on a step that has not run yet would be a lie. */
      meta: done ? step.meta : undefined,
    } satisfies ToolTraceStep
  })

  return (
    <ToolTrace
      label="Agent run"
      steps={steps}
      size="sm"
      maxConsoleHeight="4.5rem"
      announce={false}
      className="w-full max-w-72"
    />
  )
}
