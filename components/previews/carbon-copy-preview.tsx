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

/** Display type the way Apple sets it: semibold, tight, and nearly solid. */
const DISPLAY = "leading-[1.05] tracking-[-0.038em]"

export default function CarbonCopyPreview() {
  const [first, replayFirst] = useReplay()
  const [second, replaySecond] = useReplay()
  const [third, replayThird] = useReplay()
  const [fourth, replayFourth] = useReplay()
  const [settled, setSettled] = React.useState(false)

  return (
    <div className="flex w-full max-w-5xl flex-col gap-16 py-4">
      <Panel
        caption="A line, and its copy"
        description="The first line inks up from a hairline. The second peels off it, seats with a spring, and turns its first word over on the way."
        onReplay={replayFirst}
      >
        <Stage className="py-16 sm:py-20">
          <CarbonCopy
            key={first}
            as="h2"
            lines={["Copy the code.", "Keep the code."]}
            className={cn("text-[clamp(2.5rem,6.4vw,4.75rem)]", DISPLAY)}
          />
        </Stage>
      </Panel>

      <div className="grid gap-14 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-6">
        <Panel
          className="lg:row-span-2 lg:grid lg:grid-rows-subgrid"
          caption="Three lines"
          description="Each line is a copy of the one before. Only the words that differ turn over."
          onReplay={replaySecond}
        >
          <Stage>
            <CarbonCopy
              key={second}
              as="h3"
              lines={["Build it fast.", "Build it right.", "Build it once."]}
              className={cn("text-[clamp(2rem,3.8vw,3rem)]", DISPLAY)}
            />
          </Stage>
        </Panel>

        <Panel
          className="lg:row-span-2 lg:grid lg:grid-rows-subgrid"
          caption="No ink, set left"
          code="ink={false}, align"
          description="The first line is simply there. These lines differ in length, so the copy turns over whole."
          onReplay={replayThird}
        >
          <Stage className="items-start px-8 sm:px-10">
            <CarbonCopy
              key={third}
              as="p"
              align="start"
              ink={false}
              weight={500}
              lines={["Deploys in seconds.", "Rolls back in one click."]}
              className="text-[clamp(1.3125rem,2.4vw,1.75rem)] leading-[1.2] tracking-[-0.022em] text-muted-foreground"
            />
          </Stage>
        </Panel>
      </div>

      <Panel
        caption="Cue what follows"
        code={'trigger="mount", timing, onComplete'}
        description="Played on mount, on a slower clock. The sentence and the button are set down only once the copy has landed."
        onReplay={() => {
          setSettled(false)
          replayFourth()
        }}
      >
        <Stage className="gap-7 py-16 sm:py-20">
          <CarbonCopy
            key={fourth}
            as="h2"
            trigger="mount"
            timing={{ ink: 1400, copy: 950, roll: 650, pause: 240 }}
            lines={["Ship on Friday.", "Sleep on Friday."]}
            onComplete={() => setSettled(true)}
            className={cn("text-[clamp(2.25rem,5.4vw,4rem)]", DISPLAY)}
          />
          <div
            aria-hidden={!settled}
            className={cn(
              "flex flex-col items-center gap-6 transition-[opacity,translate,filter] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
              settled
                ? "translate-y-0 opacity-100 blur-none"
                : "translate-y-2 opacity-0 blur-[3px]"
            )}
          >
            <p className="max-w-[34ch] text-center text-[1.0625rem] leading-[1.47] tracking-[-0.022em] text-pretty text-muted-foreground">
              Preview deployments, instant rollbacks and a release that does not need
              anyone awake to watch it.
            </p>
            <button
              type="button"
              tabIndex={settled ? 0 : -1}
              className={cn(
                "inline-flex h-11 cursor-pointer items-center rounded-full bg-primary px-[1.375rem]",
                "text-[1.0625rem] font-medium tracking-[-0.022em] text-primary-foreground",
                "transition-[background-color,scale] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
                "hover:bg-primary-hover active:scale-[0.97]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              )}
            >
              Start deploying
            </button>
          </div>
        </Stage>
      </Panel>
    </div>
  )
}

/** The surface a headline is shown on: a white tile on the grey page, as Apple sets one. */
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
        "flex w-full flex-col items-center justify-center rounded-[2rem] bg-card px-6 py-14 sm:px-10",
        className
      )}
    >
      {children}
    </div>
  )
}

/*
 * Captions in Apple's two text styles: a 17pt semibold headline over a 15pt
 * subhead in the secondary ink. Mono appears only where a caption quotes the
 * API, as a quiet tag beside the title rather than as the title itself.
 */
function Panel({
  caption,
  code,
  description,
  onReplay,
  className,
  children,
}: {
  caption: string
  /** The props the panel demonstrates, quoted exactly. */
  code?: string
  description: string
  onReplay: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <p className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.022em] text-foreground">
              {caption}
            </p>
            {code ? (
              <code className="font-mono text-[0.8125rem] text-muted-foreground">{code}</code>
            ) : null}
          </div>
          <p className="max-w-xl text-[0.9375rem] leading-[1.47] tracking-[-0.009em] text-pretty text-muted-foreground">
            {description}
          </p>
        </div>
        {/* Apple's gray capsule button — a demo control, not the site's own. */}
        <button
          type="button"
          onClick={onReplay}
          className={cn(
            "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-muted px-3.5",
            "text-[0.8125rem] font-semibold tracking-[-0.006em] text-foreground",
            "transition-[background-color,scale] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
            "hover:bg-border active:scale-[0.96]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          )}
        >
          <RotateCcw aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
          Replay
        </button>
      </div>
      {children}
    </div>
  )
}
