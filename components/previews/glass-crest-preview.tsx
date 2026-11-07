"use client"

import * as React from "react"
import { Sparkle } from "lucide-react"

import { CrestAction, CrestQuiet, GlassCrest } from "@/registry/components/glass-crest"
import { MARKS } from "@/components/previews/fixtures/glass-crest"
import { cn } from "@/lib/utils"

/** Three of the same marks, for the compact crest below. */
const FEW = [MARKS[2]!, MARKS[3]!, MARKS[6]!]

const PAIR = "grid gap-14 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-6"
const ALIGNED = "lg:row-span-2 lg:grid lg:grid-rows-subgrid"

export default function GlassCrestPreview() {
  const [picked, setPicked] = React.useState<string | null>(null)

  return (
    <div className="flex w-full max-w-5xl flex-col gap-16 py-4">
      <Panel
        caption="The section"
        description="The crest assembles from its apex, then holds still. Move across it and the arc swings; pull a disc out and it springs home."
      >
        <Stage className="px-6 py-14 sm:px-12 sm:py-20">
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
        </Stage>
      </Panel>

      <div className={PAIR}>
        <Panel
          className={ALIGNED}
          caption="A picker"
          code="onMarkSelect"
          description="Every disc becomes a button behind one tab stop, and the arrow keys walk the arc."
        >
          <Stage className="gap-5 px-5 py-10">
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
            <p className="text-[0.8125rem] tracking-[-0.006em] text-muted-foreground">
              {picked ? (
                <>
                  Selected <span className="font-semibold text-foreground">{picked}</span>
                </>
              ) : (
                "Nothing selected yet."
              )}
            </p>
          </Stage>
        </Panel>

        <Panel
          className={ALIGNED}
          caption="Flatter and upright"
          code="spread, tilt, glow"
          description="Three marks on a shallow spread, with the lean and the wash turned off. The geometry is solved from the count."
        >
          <Stage className="px-5 py-10">
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
              description="The discs are a share of the arc's own box, so this is the same component at a third of the width."
            />
          </Stage>
        </Panel>
      </div>
    </div>
  )
}

/** The surface a crest is shown on: a white tile on the grey page, as Apple sets one. */
function Stage({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-[2rem] bg-card",
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
  className,
  children,
}: {
  caption: string
  /** The props the panel demonstrates, quoted exactly. */
  code?: string
  description: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex max-w-xl flex-col gap-1.5">
        <div className="flex items-baseline gap-2.5">
          <p className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.022em] text-foreground">
            {caption}
          </p>
          {code ? (
            <code className="font-mono text-[0.8125rem] text-muted-foreground">{code}</code>
          ) : null}
        </div>
        <p className="text-[0.9375rem] leading-[1.47] tracking-[-0.009em] text-pretty text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}
