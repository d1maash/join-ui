"use client"

import * as React from "react"
import { Globe, RotateCcw } from "lucide-react"

import {
  ApprovalGate,
  type ApprovalGateDecision,
} from "@/registry/components/approval-gate"
import { cn } from "@/lib/utils"

/*
 * Two panels sharing one grid: the parent owns the rows, each panel spans both
 * of them through `subgrid`, and so the cards start on the same line however
 * many lines the caption above them happens to run to.
 */
const PAIR = "grid grid-cols-1 gap-14 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-5"
const ALIGNED = "lg:row-span-2 lg:grid lg:grid-rows-subgrid"

export default function ApprovalGatePreview() {
  /*
   * The live gate is controlled, the way a real caller would hold it: the
   * demo owns the outcome, and asking again is a matter of clearing it. The
   * gate re-arms its own clock when that happens.
   */
  const [decision, setDecision] = React.useState<ApprovalGateDecision | null>(null)
  const [take, setTake] = React.useState(0)

  return (
    <div className="flex w-full max-w-5xl flex-col gap-14 font-sans">
      <Panel
        caption="A request, as it arrives"
        description="The ring is how long the agent will wait, and it holds while you read. Click into the card and the keys come on — Y allows, N denies. Denying strikes the command through."
        onReplay={decision === null ? undefined : () => setDecision(null)}
      >
        <div className="flex max-w-xl flex-col gap-3">
          <ApprovalGate
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
          <p className="px-1 font-mono text-xs text-muted-foreground">
            {decision === null ? "onDecision — waiting" : `onDecision("${decision}")`}
          </p>
        </div>
      </Panel>

      <div className={PAIR}>
        <Panel
          className={ALIGNED}
          caption={
            <>
              <Code>{'risk="low"'}</Code>, <Code>icon</Code>, no clock
            </>
          }
          description="A request that cannot break anything waits in the page's own ink, for as long as it takes, with your icon in the marker. Small and plain, it lives inside a surface you already own."
          onReplay={() => setTake((n) => n + 1)}
        >
          <ApprovalGate
            key={take}
            size="sm"
            variant="plain"
            className="max-w-md"
            title="Read the open pull requests"
            tool="fetch"
            meta="read-only"
            command="GET https://api.github.com/repos/d1maash/join-ui/pulls?state=open"
            icon={<Globe />}
            risk="low"
          />
        </Panel>

        <Panel
          className={ALIGNED}
          caption="At rest"
          description="Rendered with its outcome already known, a gate is a still drawing. The struck command is what a refusal leaves behind; the hourglass is a clock that ran out with nobody there."
        >
          <div className="flex max-w-md flex-col gap-6">
            <ApprovalGate
              size="sm"
              variant="plain"
              title="Rewrite the remote history"
              tool="git"
              meta="main"
              prefix="$"
              command="git push --force origin main"
              risk="high"
              decision="deny"
              announce={false}
            />
            <ApprovalGate
              size="sm"
              variant="plain"
              title="Publish the package"
              tool="bash"
              meta="~/join-ui"
              prefix="$"
              command={["pnpm build", "pnpm publish --access public"]}
              risk="medium"
              timeout={20_000}
              decision="expire"
              announce={false}
            />
          </div>
        </Panel>
      </div>
    </div>
  )
}

function Panel({
  caption,
  description,
  className,
  onReplay,
  children,
}: {
  /** A `<Code>` where the caption names an actual prop, plain text otherwise. */
  caption: React.ReactNode
  description: string
  /** Carries `ALIGNED` when the panel is one half of a two-up row. */
  className?: string
  onReplay?: () => void
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-5", className)}>
      <div className="flex max-w-xl flex-col gap-1.5 px-1">
        <div className="flex min-h-7 items-center justify-between gap-3">
          <span className="text-[1.0625rem] leading-[1.375rem] font-semibold tracking-[-0.022em] text-foreground">
            {caption}
          </span>
          {onReplay ? (
            <button
              type="button"
              onClick={onReplay}
              className={cn(
                "-mr-2 inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[0.9375rem] font-medium tracking-[-0.009em] text-info",
                "transition-[background-color,opacity] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
                "hover:bg-info-soft active:opacity-60",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              )}
            >
              <RotateCcw aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
              Ask again
            </button>
          ) : null}
        </div>
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
