"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"

import {
  PROOF_OF_WORK_MARKS,
  ProofOfWork,
  type ProofOfWorkMark,
} from "@/registry/components/proof-of-work"
import { cn } from "@/lib/utils"

/** What each mark is actually running, said in a line. */
const WORK: Record<ProofOfWorkMark, string> = {
  sort: "A shaker sort of five bars.",
  hanoi: "The Tower of Hanoi, seven moves a crossing.",
  life: "A glider in Conway's Game of Life.",
  tape: "A busy-beaver Turing machine, run until it halts.",
  branch: "A depth-first search, backing out of dead ends.",
  descent: "Gradient descent to the floor of a valley.",
}

const PAIR = "grid grid-cols-1 gap-14 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-5"
const ALIGNED = "lg:row-span-2 lg:grid lg:grid-rows-subgrid"

export default function ProofOfWorkPreview() {
  const [resting, setResting] = React.useState(false)

  return (
    <div className="flex w-full max-w-5xl flex-col gap-14 font-sans">
      <Panel
        caption="Six marks, six real problems"
        description="None of them is a loop drawn to look busy. Each one runs an algorithm and plays back what happened — and stopped, each settles on the answer it was working towards."
        action={
          <Toggle pressed={resting} onPressedChange={setResting}>
            {resting ? "Resume" : "Finish"}
          </Toggle>
        }
      >
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PROOF_OF_WORK_MARKS.map((mark) => (
            <li
              key={mark}
              className="flex flex-col items-center gap-6 rounded-soft-lg bg-card px-5 pt-10 pb-6 text-center"
            >
              <ProofOfWork mark={mark} active={!resting} className="size-16 text-foreground" />
              <div className="flex flex-col gap-1">
                <code className="font-mono text-[0.8125rem] font-medium text-foreground">
                  {mark}
                </code>
                <p className="text-[0.8125rem] leading-[1.35] text-pretty text-muted-foreground">
                  {WORK[mark]}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <div className={PAIR}>
        <Panel
          className={ALIGNED}
          caption="Beside a line of text"
          description="At text size, in the text's own colour. When the answer arrives the mark is not swapped for a tick: it finishes, and stays as the record of the work."
        >
          <Conversation />
        </Panel>

        <Panel
          className={ALIGNED}
          caption={
            <>
              <Code>size</Code>, <Code>speed</Code>, <Code>className</Code>
            </>
          }
          description="One 24-unit drawing, so it holds from a caption to a hero. The tempo is one number, and the colour is whatever the text around it is."
        >
          <div className="flex flex-col gap-3">
            <Tile className="items-end justify-between">
              {[14, 16, 20, 28, 40].map((size) => (
                <div key={size} className="flex flex-col items-center gap-3">
                  <ProofOfWork mark="hanoi" size={size} />
                  <span className="font-mono text-xs text-muted-foreground">{size}</span>
                </div>
              ))}
            </Tile>
            <Tile className="items-end justify-between">
              {[0.5, 1, 2].map((speed) => (
                <div key={speed} className="flex flex-col items-center gap-3">
                  <ProofOfWork mark="sort" speed={speed} className="size-8" />
                  <span className="font-mono text-xs text-muted-foreground">{`${speed}×`}</span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-3">
                <ProofOfWork mark="branch" className="size-8 text-info" />
                <span className="font-mono text-xs text-muted-foreground">text-info</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <ProofOfWork mark="life" className="size-8 text-positive" />
                <span className="font-mono text-xs text-muted-foreground">text-positive</span>
              </div>
            </Tile>
          </div>
        </Panel>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * The conversation
 * ------------------------------------------------------------------------- */

/** What the assistant is doing, in order, and which mark does it. */
const STAGES: ReadonlyArray<{ mark: ProofOfWorkMark; label: string; for: number }> = [
  { mark: "branch", label: "Searching the repository", for: 4200 },
  { mark: "tape", label: "Reading ci.yml", for: 3800 },
  { mark: "descent", label: "Narrowing it down", for: 4400 },
]

const THINKING = STAGES.reduce((total, stage) => total + stage.for, 0)

/**
 * One turn of a chat, played on a clock: a question, three stretches of
 * thinking each with the mark that suits it, and then the answer — at which
 * point the last mark finishes rather than leaves.
 */
function Conversation() {
  const [take, setTake] = React.useState(0)
  const [elapsed, setElapsed] = React.useState(0)

  React.useEffect(() => {
    const started = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now() - started
      setElapsed(Math.min(now, THINKING))
      if (now >= THINKING) window.clearInterval(timer)
    }, 100)
    return () => window.clearInterval(timer)
  }, [take])

  const done = elapsed >= THINKING
  let stage = STAGES[STAGES.length - 1]!
  let boundary = 0
  for (const candidate of STAGES) {
    boundary += candidate.for
    if (elapsed < boundary) {
      stage = candidate
      break
    }
  }

  return (
    <div className="flex min-h-64 flex-col gap-5 rounded-soft-lg bg-card p-5 sm:p-6">
      <p className="max-w-[85%] self-end rounded-[1.25rem] bg-muted px-4 py-2.5 text-[0.9375rem] leading-[1.4] tracking-[-0.009em] text-foreground">
        Why does the build pass locally and fail on CI?
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5 text-[0.9375rem] leading-none tracking-[-0.009em]">
          <ProofOfWork mark={stage.mark} active={!done} className="text-foreground" />
          <span
            className={cn(
              "transition-colors duration-[var(--duration-slow)]",
              done ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {done ? `Thought for ${Math.round(THINKING / 1000)}s` : stage.label}
          </span>
          {done ? null : (
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {`${Math.floor(elapsed / 1000)}s`}
            </span>
          )}
        </div>

        <p
          aria-hidden={!done}
          className={cn(
            "text-[0.9375rem] leading-[1.5] tracking-[-0.009em] text-pretty text-foreground",
            "transition-[opacity,translate] duration-[var(--duration-enter)] ease-[var(--ease-out-soft)]",
            done ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          )}
        >
          CI installs from the lockfile and your machine does not. The lockfile still
          pins the old version of the parser, so the types it builds against are a
          release behind the ones in your editor.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setElapsed(0)
          setTake((n) => n + 1)
        }}
        className={cn(
          "mt-auto inline-flex h-7 cursor-pointer items-center gap-1.5 self-start rounded-full px-2.5 text-[0.8125rem] font-medium text-muted-foreground",
          "-ml-2.5 transition-[background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
          "hover:bg-muted hover:text-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        )}
      >
        <RotateCcw aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
        Ask again
      </button>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Furniture
 * ------------------------------------------------------------------------- */

function Tile({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex min-h-[7.5rem] rounded-soft-lg bg-card px-6 py-6 sm:px-8", className)}>
      {children}
    </div>
  )
}

function Panel({
  caption,
  description,
  action,
  className,
  children,
}: {
  /** A `<Code>` where the caption names an actual prop, plain text otherwise. */
  caption: React.ReactNode
  description: string
  action?: React.ReactNode
  /** Carries `ALIGNED` when the panel is one half of a two-up row. */
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-5", className)}>
      <div className="flex items-start justify-between gap-6 px-1">
        <div className="flex max-w-xl flex-col gap-1.5">
          <span className="text-[1.0625rem] leading-[1.375rem] font-semibold tracking-[-0.022em] text-foreground">
            {caption}
          </span>
          <p className="text-[0.9375rem] leading-[1.35rem] tracking-[-0.009em] text-pretty text-muted-foreground">
            {description}
          </p>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

/** The demo's one control: stop the work, or start it again. */
function Toggle({
  pressed,
  onPressedChange,
  children,
}: {
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        "inline-flex h-8 min-w-[5.25rem] shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted px-3.5",
        "text-[0.8125rem] font-semibold tracking-[-0.006em] text-foreground",
        "transition-[background-color,scale] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
        "hover:bg-border active:scale-[0.96]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      )}
    >
      {children}
    </button>
  )
}

/** Mono is reserved for the captions that really are quoting the API. */
function Code({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-[0.92em] font-medium text-foreground">{children}</code>
}
