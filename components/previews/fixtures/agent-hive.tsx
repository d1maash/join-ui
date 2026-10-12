import type * as React from "react"

import type { AgentHiveModel } from "@/registry/components/agent-hive"

/*
 * The marks are drawn here rather than pulled from an icon set, because a model
 * badge is a piece of identity: a stock icon reads as a placeholder, and the
 * `icon` prop takes any node precisely so a real product can hand it a brand
 * mark. Each one is a single stroke weight on a 24-unit grid, sized by the
 * component through `[&_svg]:size-full`.
 */
function Mark({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

/** Six rays from a point — a burst. */
const ASTER = (
  <Mark>
    <path d="M12 2.9v18.2M4.12 7.45l15.76 9.1M4.12 16.55l15.76-9.1" />
  </Mark>
)

/** A four-point star with a smaller one trailing it. */
const PRISM = (
  <Mark>
    <path d="M10.4 2.8c.5 4.1 2.1 5.7 6.2 6.2-4.1.5-5.7 2.1-6.2 6.2-.5-4.1-2.1-5.7-6.2-6.2 4.1-.5 5.7-2.1 6.2-6.2Z" />
    <path d="M17.6 14.4c.26 2 1.04 2.78 3.04 3.04-2 .26-2.78 1.04-3.04 3.04-.26-2-1.04-2.78-3.04-3.04 2-.26 2.78-1.04 3.04-3.04Z" />
  </Mark>
)

/** Three rings in a knot. */
const NIMBUS = (
  <Mark>
    <circle cx="12" cy="7.9" r="4.1" />
    <circle cx="8.3" cy="14.3" r="4.1" />
    <circle cx="15.7" cy="14.3" r="4.1" />
  </Mark>
)

/** A cut stone: a rhombus with its girdle. */
const QUARTZ = (
  <Mark>
    <path d="M12 3.2 5.6 12 12 20.8 18.4 12 12 3.2Z" />
    <path d="M6.4 12h11.2" />
  </Mark>
)

/** Two chevrons — speed. */
export const SWIFT = (
  <Mark>
    <path d="M6.5 5.5 13 12l-6.5 6.5M13.5 5.5 20 12l-6.5 6.5" />
  </Mark>
)

/** Rings inside rings — depth. */
export const DEEP = (
  <Mark>
    <circle cx="12" cy="12" r="8.2" />
    <circle cx="12" cy="12" r="3.4" />
  </Mark>
)

/** An orbit, seen edge on — reach. */
export const WIDE = (
  <Mark>
    <ellipse cx="12" cy="12" rx="9.4" ry="4.4" transform="rotate(-28 12 12)" />
    <circle cx="12" cy="12" r="1.9" />
  </Mark>
)

export const MODELS: AgentHiveModel[] = [
  {
    id: "aster",
    label: "Aster 3",
    description: "Long context",
    icon: ASTER,
    accent: "oklch(0.63 0.19 42)",
  },
  {
    id: "prism",
    label: "Prism Flash",
    description: "Drafts and rewrites",
    icon: PRISM,
    accent: "oklch(0.52 0.2 268)",
  },
  {
    id: "nimbus",
    label: "Nimbus 2",
    description: "Code and structured output",
    icon: NIMBUS,
    accent: "oklch(0.55 0.13 195)",
  },
  {
    id: "quartz",
    label: "Quartz Mini",
    description: "Cheap enough for every row",
    icon: QUARTZ,
    accent: "oklch(0.5 0.15 155)",
  },
]

/* What a demo types out, in the order it is asked for. */
export const PROMPTS = [
  "Identify code optimizations and performance improvements",
  "Summarise this week's incidents into a changelog entry",
  "Draft migration notes for the new pricing tables",
  "Find every component still missing an accessible name",
]
