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
const PAIR = "grid gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-3"
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
    <div className="flex w-full max-w-5xl flex-col gap-10">
      <Panel
        caption="A request, as it arrives"
        description="The agent has stopped and asked. The ring is the time it will wait, and it holds while the pointer is over the card or focus is inside it. Click into the card and the keys come on: Y allows, N denies. Denying strikes the command through."
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
          <p className="px-1 font-mono text-[0.6875rem] text-muted-foreground">
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
          description="A request that cannot break anything waits in the page's own ink, without a clock, for as long as it takes. An icon of your own sits in the marker instead of the pip. Small, and plain, so it lives inside a surface you already own."
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
          description="A gate rendered with its outcome already known is a still drawing: nothing replays. The struck command is what a refusal leaves behind, and the dashed ring is a clock that ran out with nobody there."
        >
          <div className="flex max-w-md flex-col gap-5">
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
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <div className="flex min-h-6 items-center justify-between gap-3">
          <span className="label-section text-foreground">{caption}</span>
          {onReplay ? (
            <button
              type="button"
              onClick={onReplay}
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground",
                "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
                "hover:bg-muted hover:text-foreground",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              )}
            >
              <RotateCcw aria-hidden="true" className="size-3" />
              Ask again
            </button>
          ) : null}
        </div>
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
