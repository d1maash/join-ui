"use client"

import * as React from "react"
import { Sparkle } from "lucide-react"

import { CrestAction, CrestQuiet, GlassCrest } from "@/registry/components/glass-crest"
import { MARKS } from "@/components/previews/fixtures/glass-crest"
import { cn } from "@/lib/utils"

/** Three of the same marks, for the compact crest below. */
const FEW = [MARKS[2]!, MARKS[3]!, MARKS[6]!]

const PAIR = "grid gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-3"
const ALIGNED = "lg:row-span-2 lg:grid lg:grid-rows-subgrid"

export default function GlassCrestPreview() {
  const [picked, setPicked] = React.useState<string | null>(null)

  return (
    <div className="flex w-full max-w-5xl flex-col gap-12">
      <Panel
        caption="The section"
        description="The crest assembles apex-first on mount, then holds still. Move the pointer across it and the arc swings from a pivot below itself, the outer marks travelling further than the inner ones. Pull a disc and it comes out of the pack — neighbours part along the arc — and springs home when you let go. The name of whichever disc is under the cursor prints beneath it."
      >
        <div className="w-full rounded-xl border border-border bg-background px-6 py-12 sm:px-10 sm:py-16">
          <GlassCrest
            className="mx-auto"
            marks={MARKS}
            crestLabel="Supported assets"
            eyebrow="Easy to explore"
            eyebrowIcon={<Sparkle />}
            headline={
              <>
                A simple <CrestQuiet>approach to the complex</CrestQuiet> world of{" "}
                <CrestQuiet>digital assets</CrestQuiet>
              </>
            }
            description="No special knowledge required. It is easy to use and open to anyone who wants to put their savings to work."
            actions={<CrestAction>Learn more</CrestAction>}
          />
        </div>
      </Panel>

      <div className={PAIR}>
        <Panel
          className={ALIGNED}
          caption={<Code>onMarkSelect</Code>}
          description="Pass it and every disc becomes a real button behind one tab stop, with the arrow keys walking the arc. Press one and the crest hands you the mark — the section stops being scenery and starts being a picker."
        >
          <div className="flex w-full flex-col items-center gap-4 rounded-xl border border-border bg-background px-5 py-9">
            <GlassCrest
              size="sm"
              marks={MARKS}
              spread={124}
              overlap={0.36}
              crestLabel="Pick an asset"
              headingLevel={2}
              headline={
                <>
                  Pick one to <CrestQuiet>begin</CrestQuiet>
                </>
              }
              onMarkSelect={(mark) => setPicked(mark.label)}
            />
            <p className="text-xs text-muted-foreground">
              {picked ? (
                <>
                  Selected <span className="font-medium text-foreground">{picked}</span>
                </>
              ) : (
                "Nothing selected yet."
              )}
            </p>
          </div>
        </Panel>

        <Panel
          className={ALIGNED}
          caption={
            <>
              <Code>spread</Code>, <Code>tilt</Code>, <Code>glow</Code>
            </>
          }
          description="Three marks and a shallow spread give a flatter, wider arc; turning the lean and the wash off leaves the discs upright on bare paper. The geometry is solved from the count, so nothing has to be re-measured for it."
        >
          <div className="flex w-full items-center justify-center rounded-xl border border-border bg-background px-5 py-9">
            <GlassCrest
              size="sm"
              marks={FEW}
              spread={78}
              overlap={0.22}
              tilt={false}
              glow={false}
              labels="none"
              crestLabel="Assets"
              headingLevel={2}
              headline={
                <>
                  Three marks, <CrestQuiet>no lean</CrestQuiet>
                </>
              }
              description="A crest is fluid: the discs are a percentage of the arc's own box, so this is the same component at a third of the width."
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
  children,
}: {
  caption: React.ReactNode
  description: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <span className="label-section text-foreground">{caption}</span>
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
