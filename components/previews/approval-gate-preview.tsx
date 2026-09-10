"use client"

import * as React from "react"
import { Globe, RefreshCw } from "lucide-react"

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

/** What the live gate reports back, in the shape a caller would see it. */
const CALL: Record<ApprovalGateDecision, string> = {
  allow: 'onDecision("allow")',
  deny: 'onDecision("deny")',
  expire: 'onDecision("expire")',
}

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
        description="The agent has stopped and asked. The ring is the time it will wait, and it holds while the pointer is over the card or focus is inside it — the clock is for a gate nobody is looking at. Click into the card, or tab to it, and Y allows while N denies. Allowing parts the rule and folds the buttons away; denying strikes the command through."
      >
        <ApprovalGate
          className="max-w-2xl"
          title="Reinstall the dependencies"
          reason="The lockfile no longer matches node_modules, and the failing import is one pnpm resolves differently from npm. Clearing both and installing again is the shortest route to a clean run."
          tool="bash"
          meta="~/join-ui"
          prefix="$"
          command="rm -rf node_modules .next && pnpm install"
          risk="high"
          timeout={30_000}
          decision={decision}
          onDecision={setDecision}
          footer={
            <div className="flex min-h-7 items-center justify-between gap-3">
              <span
                className={cn(
                  "min-w-0 truncate text-xs",
                  decision ? "font-mono text-foreground" : "text-muted-foreground"
                )}
              >
                {decision
                  ? CALL[decision]
                  : "Answer with the buttons or the keys, or let the clock run out."}
              </span>
              <Pill onClick={() => setDecision(null)} disabled={decision === null}>
                <RefreshCw aria-hidden="true" className="size-3.5" />
                Ask again
              </Pill>
            </div>
          }
        />
      </Panel>

      <div className={PAIR}>
        <Panel
          className={ALIGNED}
          caption={
            <>
              <Code>{'risk="low"'}</Code>, <Code>icon</Code>, no clock
            </>
          }
          description="A request that cannot break anything waits in blue, without a clock, for as long as it takes. An icon of your own replaces the marker's glyph while it waits; the ring and the chip keep carrying the outcome. Small, and plain, so it sits inside a surface you already own."
          onReplay={() => setTake((n) => n + 1)}
        >
          <ApprovalGate
            key={take}
            size="sm"
            variant="plain"
            className="max-w-md"
            title="Read the open pull requests"
            reason="To find the one that last touched the registry."
            tool="fetch"
            meta="GET · read-only"
            command="https://api.github.com/repos/d1maash/join-ui/pulls?state=open"
            icon={<Globe />}
            risk="low"
          />
        </Panel>

        <Panel
          className={ALIGNED}
          caption="At rest"
          description="A gate rendered with its outcome already known is a still drawing: nothing replays. The struck command is what a refusal leaves behind, and the dashed ring is a clock that ran out with nobody there."
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
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <span className="label-section text-foreground">{caption}</span>
          {onReplay ? (
            <Pill tone="quiet" onClick={onReplay}>
              <RefreshCw aria-hidden="true" className="size-3.5" />
              Ask again
            </Pill>
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
        "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
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
