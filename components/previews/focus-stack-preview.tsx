"use client"

import * as React from "react"
import {
  Boxes,
  Compass,
  Layers,
  MousePointer2,
  Pause,
  PenTool,
  Play,
  Shapes,
  Sparkles,
  Waves,
} from "lucide-react"

import { FocusStack, type FocusStackItem } from "@/registry/components/focus-stack"
import { cn } from "@/lib/utils"

const SYSTEM: FocusStackItem[] = [
  {
    id: "asset-library",
    label: "Asset Library",
    description: "Every mark, icon and photograph in one place.",
    icon: <Boxes />,
    accent: "oklch(0.65 0.22 12)",
  },
  {
    id: "design-language",
    label: "Design Language",
    description: "The rules the whole product is written in.",
    icon: <Compass />,
    accent: "oklch(0.55 0.19 280)",
  },
  {
    id: "art-direction",
    label: "Art Direction",
    description: "How a page is meant to feel before it is read.",
    icon: <PenTool />,
    accent: "oklch(0.72 0.18 55)",
  },
  {
    id: "ui-architecture",
    label: "UI Architecture",
    description: "Layout, hierarchy and the shape of a screen.",
    icon: <Layers />,
    accent: "oklch(0.6 0.21 308)",
  },
  {
    id: "visual-modules",
    label: "Visual Modules",
    description: "Blocks that assemble into a page in any order.",
    icon: <Shapes />,
    accent: "oklch(0.61 0.2 256)",
  },
  {
    id: "motion-system",
    label: "Motion System",
    description: "Duration, easing and what earns an animation.",
    icon: <Waves />,
    accent: "oklch(0.64 0.22 28)",
  },
  {
    id: "brand-framework",
    label: "Brand Framework",
    description: "The voice everything above has to speak in.",
    icon: <Sparkles />,
    accent: "oklch(0.7 0.17 152)",
  },
]

const PLAIN: FocusStackItem[] = [
  { id: "research", label: "Research", icon: <Compass /> },
  { id: "wireframe", label: "Wireframe", icon: <Shapes /> },
  { id: "prototype", label: "Prototype", icon: <MousePointer2 /> },
  { id: "handoff", label: "Handoff", icon: <Layers /> },
  { id: "ship", label: "Ship", icon: <Sparkles /> },
]

/*
 * Two panels sharing one grid: the parent owns the rows, each panel spans both
 * of them through `subgrid`, so the stacks start on the same line however many
 * lines the caption above them happens to run to.
 */
const PAIR = "grid gap-14 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-6"
const ALIGNED = "lg:row-span-2 lg:grid lg:grid-rows-subgrid"

export default function FocusStackPreview() {
  const [paused, setPaused] = React.useState(false)
  const [auto, setAuto] = React.useState(3)
  const [scrolled, setScrolled] = React.useState(0)

  return (
    <div className="flex w-full max-w-5xl flex-col gap-16 py-4">
      <div className={PAIR}>
        <Panel
          className={ALIGNED}
          caption="Autoplay"
          code={'mode="auto"'}
          description="Turns on a timer, and holds for a pointer, a caret or reduced motion. Click a pill, or arrow into it."
          aside={
            <Pill onClick={() => setPaused((value) => !value)}>
              {paused ? (
                <Play aria-hidden="true" className="size-3 fill-current" />
              ) : (
                <Pause aria-hidden="true" className="size-3 fill-current" />
              )}
              {paused ? "Play" : "Pause"}
            </Pill>
          }
          readout={SYSTEM[auto]?.label}
        >
          <FocusStack
            label="Design system"
            items={SYSTEM}
            mode="auto"
            paused={paused}
            index={auto}
            onIndexChange={setAuto}
            size="sm"
          />
        </Panel>

        <Panel
          className={ALIGNED}
          caption="Scroll-driven"
          code={'mode="scroll"'}
          description="The same coil, turned by the page. Scroll it through the viewport — nothing moves that you did not move."
          readout={SYSTEM[scrolled]?.label}
        >
          <FocusStack
            label="Design system"
            items={SYSTEM}
            mode="scroll"
            onIndexChange={setScrolled}
            size="sm"
          />
        </Panel>
      </div>

      <Panel
        caption="Labels only"
        description="No accents and no second line, with the tilt and depth pulled in — a quieter coil for a sidebar."
      >
        <FocusStack
          label="Process"
          items={PLAIN}
          size="sm"
          depth={2}
          tilt={3}
          blur={0.4}
          interval={2000}
        />
      </Panel>
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
  aside,
  readout,
  className,
  children,
}: {
  caption: string
  /** The prop the panel demonstrates, quoted exactly. */
  code?: string
  description: string
  /** A control belonging to the demo, not to the component. */
  aside?: React.ReactNode
  /** The focused label, echoed back so the callback is visibly wired up. */
  readout?: string
  /** Carries `ALIGNED` when the panel is one half of a two-up row. */
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-1.5">
        <div className="flex min-h-8 items-center gap-3">
          <div className="flex min-w-0 flex-1 items-baseline gap-2.5">
            <p className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.022em] text-foreground">
              {caption}
            </p>
            {code ? (
              <code className="truncate font-mono text-[0.8125rem] text-muted-foreground">
                {code}
              </code>
            ) : null}
          </div>
          {aside}
        </div>
        <p className="max-w-md text-[0.9375rem] leading-[1.47] tracking-[-0.009em] text-pretty text-muted-foreground">
          {description}
        </p>
        {readout ? (
          <p
            aria-live="polite"
            className="mt-1 text-[0.8125rem] tracking-[-0.006em] text-muted-foreground"
          >
            In focus <span className="font-semibold text-foreground">{readout}</span>
          </p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

/** Apple's gray capsule button — a demo control, not the site's own button. */
function Pill({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-muted px-3.5",
        "text-[0.8125rem] font-semibold tracking-[-0.006em] text-foreground",
        "transition-[background-color,scale] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
        "hover:bg-border active:scale-[0.96]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
