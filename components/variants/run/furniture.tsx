"use client"

import * as React from "react"
import { motion, type MotionValue } from "motion/react"
import {
  AppWindow,
  ArrowUp,
  FileCode2,
  Hexagon,
  ListTree,
  Rocket,
  ShieldQuestion,
  Square,
} from "lucide-react"

import { MODELS } from "@/components/previews/fixtures/agent-hive"

import { BRANCH, RUN_NO, TASK, type ChapterId, type Decision } from "./script"
import { TONE_COLOR, TONE_LABEL, type RunTone } from "./state"

/*
 * The furniture of the run window — sidebar, toolbar, inspector, composer.
 * None of it is a Join UI component; it is the app the components live in,
 * drawn just carefully enough that the window reads as software rather than
 * as a stage with one thing on it.
 */

const SIDEBAR: Array<{
  id: ChapterId
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { id: "pick", label: "Models", icon: Hexagon },
  { id: "work", label: "Trace", icon: ListTree },
  { id: "ask", label: "Approvals", icon: ShieldQuestion },
  { id: "ship", label: "Deploys", icon: Rocket },
  { id: "output", label: "Preview", icon: AppWindow },
]

const EARLIER = [
  { title: "Fix the flaky checkout test", tone: "shipped" as const },
  { title: "Move auth to the app router", tone: "shipped" as const },
  { title: "Rename the Button variants", tone: "denied" as const },
]

export function WindowSidebar({
  active,
  waiting,
  onJump,
}: {
  active: number
  waiting: boolean
  onJump: (index: number) => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-2.5 pb-3">
      <div className="mb-4 flex items-center gap-2 px-2">
        <span className="flex size-[18px] items-center justify-center rounded-[5px] bg-white/[0.1] text-[10px] font-semibold text-[#f5f5f7]">
          L
        </span>
        <span className="text-[13px] font-medium text-[#f5f5f7]">lumen/web</span>
      </div>

      <p className="px-2 pb-1 text-[11px] font-medium text-[#77777c]">{RUN_NO}</p>
      <ul className="flex flex-col gap-px">
        {SIDEBAR.map((item, index) => {
          const Icon = item.icon
          return (
            <li key={item.id}>
              <button
                type="button"
                className="run-side-item"
                aria-current={active === index ? "step" : undefined}
                onClick={() => onJump(index)}
                aria-label={`${item.label} — go to chapter ${index + 1}`}
              >
                <Icon />
                <span className="flex-1">{item.label}</span>
                {item.id === "ask" && waiting ? (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ffb340]/15 px-1 text-[10px] font-semibold text-[#ffb340]">
                    1
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-5 px-2 pb-1 text-[11px] font-medium text-[#77777c]">Earlier</p>
      <ul className="flex flex-col gap-px" aria-label="Earlier runs">
        {EARLIER.map((run) => (
          <li
            key={run.title}
            className="flex h-[1.75rem] items-center gap-2 px-2 text-[12px] text-[#77777c]"
          >
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: TONE_COLOR[run.tone] }}
            />
            <span className="truncate">{run.title}</span>
            <span className="sr-only">{run.tone === "shipped" ? "Shipped" : "Denied"}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center gap-2 px-2 pt-3 text-[12px] text-[#77777c]">
        <span className="flex size-5 items-center justify-center rounded-full bg-white/[0.08] text-[10px] font-medium text-[#c7c7cc]">
          D
        </span>
        <span className="truncate">dimash · 3 runs today</span>
      </div>
    </div>
  )
}

export function WindowToolbar({
  title,
  tone,
  compact = false,
}: {
  title: string
  tone: RunTone
  compact?: boolean
}) {
  return (
    <>
      <div className="flex min-w-0 flex-1 items-baseline gap-2.5">
        <span className="truncate text-[13px] font-medium text-[#f5f5f7]">{title}</span>
        {compact ? null : (
          <span className="hidden truncate font-mono text-[11px] text-[#77777c] lg:inline">
            {BRANCH}
          </span>
        )}
      </div>
      <span className="run-chip" data-tone={tone}>
        <i aria-hidden="true" />
        {TONE_LABEL[tone]}
      </span>
    </>
  )
}

function ModelMark({ model }: { model: string }) {
  const current = MODELS.find((entry) => entry.id === model)
  if (!current) return null
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="size-3.5 shrink-0 text-[#c7c7cc] [&_svg]:size-full" aria-hidden="true">
        {current.icon}
      </span>
      <span className="truncate">{current.label}</span>
    </span>
  )
}

/** The task as it is typed, then as it runs. */
export function Composer({
  text,
  typing,
  running,
  model,
}: {
  text: string
  typing: boolean
  running: boolean
  model: string
}) {
  return (
    <div className="px-4 pt-1 pb-4">
      <div className="run-composer">
        <span
          className={
            text
              ? running
                ? "min-w-0 flex-1 truncate text-[13px] text-[#8b8b90]"
                : "min-w-0 flex-1 truncate text-[13px] text-[#f5f5f7]"
              : "min-w-0 flex-1 truncate text-[13px] text-[#5c5c61]"
          }
        >
          {text || "Describe a task for the agent…"}
          {typing ? (
            <span
              aria-hidden="true"
              className="ml-px inline-block h-[1.05em] w-px translate-y-[0.18em] animate-pulse bg-[#f5f5f7]"
            />
          ) : null}
        </span>
        <span className="flex h-7 shrink-0 items-center rounded-full bg-white/[0.06] px-2.5 text-[12px] text-[#c7c7cc]">
          <ModelMark model={model} />
        </span>
        <span
          aria-hidden="true"
          className={
            running
              ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-white/[0.1] text-[#f5f5f7]"
              : text
                ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-black"
                : "flex size-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[#5c5c61]"
          }
        >
          {running ? (
            <Square className="size-2.5 fill-current" />
          ) : (
            <ArrowUp className="size-3.5" strokeWidth={2.4} />
          )}
        </span>
      </div>
    </div>
  )
}

export interface InspectorData {
  tone: RunTone
  model: string
  started: boolean
  toolCalls: string
  files: string
  branch: string
  decision: Decision
  asking: boolean
  edited: boolean
  shipped: boolean
}

function approvalWord(decision: Decision, asking: boolean) {
  if (decision === "allow") return "Allowed by you"
  if (decision === "deny") return "Denied by you"
  if (decision === "expire") return "Expired"
  return asking ? "Waiting on you" : "—"
}

/** The run, as metadata — what a person checks without reading the trace. */
export function Inspector({
  data,
  elapsed,
  tokens,
}: {
  data: InspectorData
  elapsed: MotionValue<string>
  tokens: MotionValue<string>
}) {
  const files = [
    {
      path: "app/(marketing)/page.tsx",
      stat: data.edited ? (
        <>
          <span className="text-[#30d158]">+64</span>{" "}
          <span className="text-[#ff6961]">−18</span>
        </>
      ) : (
        <span className="text-[#77777c]">read</span>
      ),
    },
    ...(data.edited
      ? [
          { path: "components/joinui/glass-crest.tsx", stat: <span className="text-[#30d158]">new</span> },
          { path: "components/joinui/carbon-copy.tsx", stat: <span className="text-[#30d158]">new</span> },
          { path: "components/joinui/focus-stack.tsx", stat: <span className="text-[#30d158]">new</span> },
        ]
      : []),
  ]

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden px-4 pt-4 pb-4">
      <section aria-label="Run details">
        <p className="mb-2 text-[11px] font-medium text-[#77777c]">Details</p>
        <dl className="flex flex-col">
          <div className="run-meta">
            <dt>State</dt>
            <dd>
              <span className="run-chip" data-tone={data.tone}>
                <i aria-hidden="true" />
                {TONE_LABEL[data.tone]}
              </span>
            </dd>
          </div>
          <div className="run-meta">
            <dt>Model</dt>
            <dd>
              <ModelMark model={data.model} />
            </dd>
          </div>
          <div className="run-meta">
            <dt>Elapsed</dt>
            <dd className="font-mono !text-[11.5px]">
              {data.started ? <motion.span>{elapsed}</motion.span> : "—"}
            </dd>
          </div>
          <div className="run-meta">
            <dt>Tokens</dt>
            <dd className="font-mono !text-[11.5px]">
              {data.started ? <motion.span>{tokens}</motion.span> : "—"}
            </dd>
          </div>
          <div className="run-meta">
            <dt>Tool calls</dt>
            <dd>{data.toolCalls}</dd>
          </div>
          <div className="run-meta">
            <dt>Files</dt>
            <dd>{data.files}</dd>
          </div>
          <div className="run-meta">
            <dt>Branch</dt>
            <dd className="font-mono !text-[11.5px]">{data.branch}</dd>
          </div>
          <div className="run-meta">
            <dt>Approval</dt>
            <dd
              style={{
                color:
                  data.decision === "deny"
                    ? "#ff6961"
                    : data.decision === "allow"
                      ? "#30d158"
                      : data.asking && data.decision === null
                        ? "#ffb340"
                        : undefined,
              }}
            >
              {approvalWord(data.decision, data.asking)}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-label="Files in context" className="min-h-0">
        <p className="mb-2 text-[11px] font-medium text-[#77777c]">Context</p>
        <ul className="flex flex-col gap-1">
          {files.map((file) => (
            <li
              key={file.path}
              className="flex items-center gap-2 text-[11.5px] leading-[1.6] text-[#c7c7cc]"
            >
              <FileCode2 aria-hidden="true" className="size-3.5 shrink-0 text-[#77777c]" />
              <span className="min-w-0 flex-1 truncate font-mono">{file.path.split("/").pop()}</span>
              <span className="shrink-0 font-mono text-[11px]">{file.stat}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-auto text-[11px] leading-[1.5] text-[#5c5c61]">
        {data.shipped ? "Live at lumen.app" : TASK}
      </p>
    </div>
  )
}
