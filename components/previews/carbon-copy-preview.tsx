"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"

import { CarbonCopy } from "@/registry/components/carbon-copy"
import { cn } from "@/lib/utils"

/*
 * Every stage is keyed on a counter so a replay is a remount — the component
 * has no notion of playing twice, and it should not: a headline is set once.
 * What a reader of these docs needs is to see it again, and a fresh instance
 * is the honest way to give them that.
 */
function useReplay() {
  const [take, setTake] = React.useState(0)
  return [take, () => setTake((n) => n + 1)] as const
}

export default function CarbonCopyPreview() {
  const [first, replayFirst] = useReplay()
  const [second, replaySecond] = useReplay()
  const [third, replayThird] = useReplay()
  const [fourth, replayFourth] = useReplay()
  const [settled, setSettled] = React.useState(false)

  return (
    <div className="flex w-full max-w-5xl flex-col gap-12">
      <Panel
        caption="The line, and a copy of it"
        description="The first line inks up from a hairline. Then a copy is taken: the second line peels off the first, travels down a line and seats with a spring, and on the way its first word turns over in a window — the old word rolls out below, the new one drops in from above. It plays when it comes into view."
        onReplay={replayFirst}
      >
        <Stage>
          <CarbonCopy
            key={first}
            as="h2"
            lines={["Copy the code.", "Keep the code."]}
            className="text-[clamp(2.25rem,6vw,4.5rem)] leading-none tracking-[-0.042em]"
          />
        </Stage>
      </Panel>

      <div className="grid gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-3">
        <Panel
          className="lg:row-span-2 lg:grid lg:grid-rows-subgrid"
          caption="Three lines"
          description="Each line is a copy of the one before, so a third line is taken from the second once it has seated. Only the words that differ turn over; the rest of the line comes down unchanged."
          onReplay={replaySecond}
        >
          <Stage>
            <CarbonCopy
              key={second}
              as="h3"
              lines={["Build it fast.", "Build it right.", "Build it once."]}
              className="text-[clamp(1.75rem,3.6vw,2.75rem)] leading-none tracking-[-0.04em]"
            />
          </Stage>
        </Panel>

        <Panel
          className="lg:row-span-2 lg:grid lg:grid-rows-subgrid"
          caption={
            <>
              <Code>ink={"{false}"}</Code>, <Code>align</Code>
            </>
          }
          description="Without the ink the first line is simply there, and the copy is the whole event. Set from the left edge, at body size. These two lines have different numbers of words, so the copy turns over as a whole rather than word by word."
          onReplay={replayThird}
        >
          <Stage className="items-start px-8">
            <CarbonCopy
              key={third}
              as="p"
              align="start"
              ink={false}
              weight={500}
              lines={["Deploys in seconds.", "Rolls back in one click."]}
              className="text-[clamp(1.25rem,2.4vw,1.75rem)] leading-tight tracking-[-0.02em] text-muted-foreground"
            />
          </Stage>
        </Panel>
      </div>

      <Panel
        caption={
          <>
            <Code>{'trigger="mount"'}</Code>, <Code>timing</Code>,{" "}
            <Code>onComplete</Code>
          </>
        }
        description="Played the moment it mounts, on a slower clock, and what comes after the headline is cued from its last seat rather than from a timer of its own — the sentence and the call to action are set down only once the copy has landed."
        onReplay={() => {
          setSettled(false)
          replayFourth()
        }}
      >
        <Stage className="gap-6 py-14">
          <CarbonCopy
            key={fourth}
            as="h2"
            trigger="mount"
            timing={{ ink: 1400, copy: 950, roll: 650, pause: 240 }}
            lines={["Ship on Friday.", "Sleep on Friday."]}
            onComplete={() => setSettled(true)}
            className="text-[clamp(2rem,5vw,3.75rem)] leading-none tracking-[-0.042em]"
          />
          <div
            aria-hidden={!settled}
            className={cn(
              "flex flex-col items-center gap-4 transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]",
              settled ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
            )}
          >
            <p className="max-w-[38ch] text-center text-sm leading-relaxed text-muted-foreground">
              Preview deployments, instant rollbacks and a release that does not need
              anyone awake to watch it.
            </p>
            <button
              type="button"
              tabIndex={settled ? 0 : -1}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Start deploying
            </button>
          </div>
        </Stage>
      </Panel>
    </div>
  )
}

function Stage({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-xl border border-border bg-background px-6 py-12 sm:px-10",
        className
      )}
    >
      {children}
    </div>
  )
}

function Panel({
  caption,
  description,
  onReplay,
  className,
  children,
}: {
  caption: React.ReactNode
  description: string
  onReplay: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="label-section text-foreground">{caption}</span>
          <button
            type="button"
            onClick={onReplay}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md border border-border px-2 text-xs text-muted-foreground",
              "transition-colors hover:border-border-hover hover:text-foreground",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            )}
          >
            <RotateCcw aria-hidden="true" className="size-3" />
            Replay
          </button>
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
