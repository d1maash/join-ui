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
    accent: "oklch(0.72 0.19 350)",
  },
  {
    id: "design-language",
    label: "Design Language",
    description: "The rules the whole product is written in.",
    icon: <Compass />,
    accent: "oklch(0.55 0.22 275)",
  },
  {
    id: "art-direction",
    label: "Art Direction",
    description: "How a page is meant to feel before it is read.",
    icon: <PenTool />,
    accent: "oklch(0.68 0.19 42)",
  },
  {
    id: "ui-architecture",
    label: "UI Architecture",
    description: "Layout, hierarchy and the shape of a screen.",
    icon: <Layers />,
    accent: "oklch(0.58 0.26 305)",
  },
  {
    id: "visual-modules",
    label: "Visual Modules",
    description: "Blocks that assemble into a page in any order.",
    icon: <Shapes />,
    accent: "oklch(0.82 0.16 88)",
  },
  {
    id: "motion-system",
    label: "Motion System",
    description: "Duration, easing and what earns an animation.",
    icon: <Waves />,
    accent: "oklch(0.65 0.2 22)",
  },
  {
    id: "brand-framework",
    label: "Brand Framework",
    description: "The voice everything above has to speak in.",
    icon: <Sparkles />,
    accent: "oklch(0.78 0.14 158)",
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
const PAIR = "grid gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-3"
const ALIGNED = "lg:row-span-2 lg:grid lg:grid-rows-subgrid"

export default function FocusStackPreview() {
  const [paused, setPaused] = React.useState(false)
  const [auto, setAuto] = React.useState(3)
  const [scrolled, setScrolled] = React.useState(0)

  return (
    <div className="flex w-full max-w-5xl flex-col gap-10">
      <div className={PAIR}>
        <Panel
          className={ALIGNED}
          caption={<Code>mode=&quot;auto&quot;</Code>}
          description="Advances on a timer, and stops the moment a pointer, a caret or a reduced-motion setting says so. Click a pill or arrow into it to take the turn yourself."
          aside={
            <Pill onClick={() => setPaused((value) => !value)}>
              {paused ? (
                <Play aria-hidden="true" className="size-3" />
              ) : (
                <Pause aria-hidden="true" className="size-3" />
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
          caption={<Code>mode=&quot;scroll&quot;</Code>}
          description="The same drawing, with the focus handed to the page. Scroll this preview through the viewport and the stack turns with it — no timer, and nothing moves that the reader did not move."
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
        caption="Labels only, tighter coil"
        description="No accents and no second line, with tilt and depth pulled in — a quieter stack for a sidebar or a narrow column."
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

function Panel({
  caption,
  description,
  aside,
  readout,
  className,
  children,
}: {
  /** A `<Code>` where the caption names an actual prop, plain text otherwise. */
  caption: React.ReactNode
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
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="label-section flex-1 text-foreground">{caption}</span>
          {readout ? (
            <span className="truncate text-xs text-muted-foreground">{readout}</span>
          ) : null}
          {aside}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

/** Mono is reserved for the captions that really are quoting the API. */
function Code({ children }: { children: string }) {
  return (
    <code className="font-mono text-[0.75rem] font-medium text-foreground">
      {children}
    </code>
  )
}

/** Pill-shaped, tinted control — a demo affordance, not the site's own button. */
function Pill({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
