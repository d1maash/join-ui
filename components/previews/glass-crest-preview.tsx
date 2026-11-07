"use client"

import * as React from "react"
import { Sparkle } from "lucide-react"

import {
  CrestAction,
  CrestQuiet,
  GlassCrest,
  type GlassCrestMark,
} from "@/registry/components/glass-crest"
import { cn } from "@/lib/utils"

/*
 * The marks are inline SVG rather than an icon set, which is the point: a crest
 * is a row of brands, and an icon library never has the ones you need. They are
 * drawn as solid shapes because the disc prints each glyph twice — once blurred
 * underneath to give it thickness — and a hairline stroke has nothing to cast.
 *
 * Nothing here is a real trademark; they are the shapes a token drawer reaches
 * for, tinted along Apple's system hues from warm to cool, left to right.
 */
const MARKS: GlassCrestMark[] = [
  {
    id: "prism",
    label: "Prism",
    accent: "oklch(0.66 0.21 10)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 1.5 19.2 12 12 16.2 4.8 12z" />
        <path d="M12 17.7 19.2 13.5 12 22.5 4.8 13.5z" opacity={0.72} />
      </svg>
    ),
  },
  {
    id: "tessera",
    label: "Tessera",
    accent: "oklch(0.74 0.17 55)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4 3h16v3.6h-6.1V21h-3.8V6.6H4z" />
        <path d="M6.6 9.4h10.8V13H6.6z" opacity={0.72} />
      </svg>
    ),
  },
  {
    id: "obol",
    label: "Obol",
    accent: "oklch(0.79 0.16 80)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M10 1.5h2.3v3H10zM13.7 1.5H16v3h-2.3zM10 19.5h2.3v3H10zM13.7 19.5H16v3h-2.3z" />
        <path d="M6.4 4h7.2c2.9 0 4.7 1.4 4.7 3.7 0 1.5-.8 2.6-2.1 3.2 1.7.5 2.8 1.8 2.8 3.6 0 2.6-2 4.5-5.2 4.5H6.4zm3.6 3v3.1h3.1c1.1 0 1.8-.6 1.8-1.6S14.2 7 13.1 7zm0 5.8V16h3.5c1.2 0 2-.6 2-1.6s-.8-1.6-2-1.6z" />
      </svg>
    ),
  },
  {
    id: "helix",
    label: "Helix",
    accent: "oklch(0.72 0.18 150)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 1.6 20.6 6.8v10.4L12 22.4 3.4 17.2V6.8z" />
        <path d="M12 6.4 16.6 9.2v5.6L12 17.6 7.4 14.8V9.2z" opacity={0.55} />
      </svg>
    ),
  },
  {
    id: "cadence",
    label: "Cadence",
    accent: "oklch(0.7 0.12 215)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3.6 3.4h4.1L12 8.1l4.3-4.7h4.1L14 10.5a2.8 2.8 0 0 1-4 0z" />
        <path d="M3.6 20.6h4.1L12 15.9l4.3 4.7h4.1L14 13.5a2.8 2.8 0 0 0-4 0z" opacity={0.72} />
      </svg>
    ),
  },
  {
    id: "sterling",
    label: "Sterling",
    accent: "oklch(0.6 0.2 256)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M9.4 2.4h4.2l-2.4 8.9 5.3-1.6-.8 3-5.3 1.6-1 3.8h9v3.5H4.6l1.9-7.1-2.6.8.8-3 2.6-.8z" />
      </svg>
    ),
  },
  {
    id: "azimuth",
    label: "Azimuth",
    accent: "oklch(0.56 0.2 290)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.6 4.6h13.8l-3.4 3.6H3.2z" />
        <path d="M3.2 10.2h13.8l3.4 3.6H6.6z" opacity={0.72} />
        <path d="M6.6 15.8h13.8l-3.4 3.6H3.2z" opacity={0.5} />
      </svg>
    ),
  },
]


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
