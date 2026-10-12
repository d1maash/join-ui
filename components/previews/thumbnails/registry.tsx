"use client"

import dynamic from "next/dynamic"
import type { ReactNode } from "react"

/**
 * Thumbnail lookup for the catalog cards.
 *
 * Where a preview is the docs page's demo — several panels, captions, controls
 * — a thumbnail is one configuration of the component, small enough for a
 * card: a still frame at rest, and a short script played on a loop while the
 * card is pointed at. They are kept apart from the previews because they
 * answer a different question: not "what can it do" but "what is it", at a
 * glance, before the click.
 *
 * Each entry is loaded through `next/dynamic`, so a page with three cards
 * downloads three components rather than the registry, and only in the
 * browser. A thumbnail is inert scenery, so there is nothing for the server
 * render to give a reader or a crawler — and rendering it there means
 * hydrating seven components at once, any one of which may draw itself
 * differently once it knows the reader's motion setting. A card whose slug has
 * no entry falls back to its description, and `pnpm registry:validate` fails
 * for any component without one.
 */
const StatusTimelineThumbnail = dynamic(() => import("./status-timeline"), {
  ssr: false,
})
const FocusStackThumbnail = dynamic(() => import("./focus-stack"), { ssr: false })
const AgentHiveThumbnail = dynamic(() => import("./agent-hive"), { ssr: false })
const ToolTraceThumbnail = dynamic(() => import("./tool-trace"), { ssr: false })
const GlassCrestThumbnail = dynamic(() => import("./glass-crest"), { ssr: false })
const CarbonCopyThumbnail = dynamic(() => import("./carbon-copy"), { ssr: false })
const ApprovalGateThumbnail = dynamic(() => import("./approval-gate"), { ssr: false })

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
