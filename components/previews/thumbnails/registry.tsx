"use client"

import dynamic from "next/dynamic"
import type { ReactNode } from "react"

/**
 * Thumbnail lookup for the catalog cards.
 *
 * Where a preview is the docs page's demo — several panels, captions, controls
 * — a thumbnail is one configuration of the component, small enough for a
 * card, playing a short script on a loop with nobody touching it. They are
 * kept apart from the previews because they answer a different question: not
 * "what can it do" but "what is it", at a glance, before the click.
 *
 * Each entry is loaded through `next/dynamic`, so a page with three cards
 * downloads three components rather than the registry. A card whose slug has
 * no entry falls back to its description, and `pnpm registry:validate` fails
 * for any component without one.
 */
const StatusTimelineThumbnail = dynamic(() => import("./status-timeline"))
const FocusStackThumbnail = dynamic(() => import("./focus-stack"))
const AgentHiveThumbnail = dynamic(() => import("./agent-hive"))
const ToolTraceThumbnail = dynamic(() => import("./tool-trace"))
const GlassCrestThumbnail = dynamic(() => import("./glass-crest"))
const CarbonCopyThumbnail = dynamic(() => import("./carbon-copy"))
const ApprovalGateThumbnail = dynamic(() => import("./approval-gate"))

export const thumbnails: Record<string, () => ReactNode> = {
  "status-timeline": () => <StatusTimelineThumbnail />,
  "focus-stack": () => <FocusStackThumbnail />,
  "agent-hive": () => <AgentHiveThumbnail />,
  "tool-trace": () => <ToolTraceThumbnail />,
  "glass-crest": () => <GlassCrestThumbnail />,
  "carbon-copy": () => <CarbonCopyThumbnail />,
  "approval-gate": () => <ApprovalGateThumbnail />,
}

export function renderThumbnail(slug: string): ReactNode | null {
  const render = thumbnails[slug]
  return render ? render() : null
}
