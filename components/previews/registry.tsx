"use client"

import dynamic from "next/dynamic"
import type { ReactNode } from "react"

/**
 * Demo lookup for the live previews.
 *
 * Each entry maps a registry slug to a function that renders its demo. Storing
 * render functions rather than component types keeps `ComponentPreview` from
 * instantiating a component value it received at runtime, and leaves the entry
 * free to pass props or wrap the demo in a stage.
 *
 * Load demos through `next/dynamic` so a catalog page only downloads what is
 * actually on screen, and so a demo that measures layout on mount can opt out
 * of server rendering.
 *
 * `ComponentPreview` renders an explicit empty state for any missing slug, and
 * `pnpm registry:validate` fails for any component without an entry here.
 */
const StatusTimelinePreview = dynamic(() => import("./status-timeline-preview"))
const FocusStackPreview = dynamic(() => import("./focus-stack-preview"))
const AgentHivePreview = dynamic(() => import("./agent-hive-preview"))
const ToolTracePreview = dynamic(() => import("./tool-trace-preview"))
const GlassCrestPreview = dynamic(() => import("./glass-crest-preview"))
const CarbonCopyPreview = dynamic(() => import("./carbon-copy-preview"))

export const previews: Record<string, () => ReactNode> = {
  "status-timeline": () => <StatusTimelinePreview />,
  "focus-stack": () => <FocusStackPreview />,
  "agent-hive": () => <AgentHivePreview />,
  "tool-trace": () => <ToolTracePreview />,
  "glass-crest": () => <GlassCrestPreview />,
  "carbon-copy": () => <CarbonCopyPreview />,
}

export function renderPreview(slug: string): ReactNode | null {
  const render = previews[slug]
  return render ? render() : null
}
