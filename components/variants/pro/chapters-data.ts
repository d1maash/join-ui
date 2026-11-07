import { allComponents } from "@/lib/registry"
import type { ComponentMetadata } from "@/types/registry"

import type { Chapter } from "./chapters"
import { proHref } from "./href"

/*
 * Each component's line on the landing page: a headline that says what it is
 * for, a sentence that says how, and the hue its stage is lit in. A component
 * added to the registry later still gets a chapter — it falls back to its own
 * description and a neutral light.
 */
const COPY: Record<string, { headline: string; body: string; accent: string }> = {
  "approval-gate": {
    headline: "Ask before it acts.",
    body: "The agent stops, shows the command and waits. A clock that holds while you read, two keys to answer, and colour only where there is risk.",
    accent: "#ff9f0a",
  },
  "tool-trace": {
    headline: "Watch the work happen.",
    body: "Every tool call, in order. The step in flight opens, writes its output a line at a time, then folds away and hands the rail to the next.",
    accent: "#64d2ff",
  },
  "agent-hive": {
    headline: "Pick a model. Send the work.",
    body: "A honeycomb of frosted glass, one tinted tile that travels to your pick, and the queue of runs it dispatches.",
    accent: "#bf5af2",
  },
  "status-timeline": {
    headline: "Progress, at a glance.",
    body: "Orders, deploys, onboarding. Still at rest, and animated only at the moment a step advances.",
    accent: "#30d158",
  },
  "focus-stack": {
    headline: "One in focus. The rest in orbit.",
    body: "A coil of pills that keeps one item front and centre, turned by a timer or by your scroll.",
    accent: "#7d7aff",
  },
  "carbon-copy": {
    headline: "Headlines that revise themselves.",
    body: "The first line inks in. The next peels off it, and only the words that change turn over.",
    accent: "#ffd60a",
  },
  "glass-crest": {
    headline: "Open with glass.",
    body: "An arc of tinted glass discs that assembles on arrival, then answers only the pointer.",
    accent: "#66d4cf",
  },
}

const ORDER = [
  "approval-gate",
  "tool-trace",
  "agent-hive",
  "status-timeline",
  "focus-stack",
  "carbon-copy",
  "glass-crest",
]

function rank(component: ComponentMetadata): number {
  const index = ORDER.indexOf(component.slug)
  return index === -1 ? ORDER.length : index
}

export function getChapters(): Chapter[] {
  return [...allComponents]
    .sort((a, b) => rank(a) - rank(b))
    .map((component) => {
      const copy = COPY[component.slug]
      return {
        slug: component.slug,
        title: component.title,
        headline: copy?.headline ?? component.title,
        body: copy?.body ?? component.description,
        accent: copy?.accent ?? "#a1a1a6",
        href: proHref(`/components/${component.slug}`),
      }
    })
}

/** The hue a component is lit in, wherever it appears in the variant. */
export function accentFor(slug: string): string {
  return COPY[slug]?.accent ?? "#a1a1a6"
}
