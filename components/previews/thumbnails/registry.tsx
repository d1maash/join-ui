"use client"

import dynamic from "next/dynamic"
import type { ReactNode } from "react"

/**
 * Thumbnail lookup for the catalog cards, the rails and the workbench's
 * neighbours.
 *
 * A preview is the docs page's demo — several panels, captions, controls. A
 * thumbnail is one composed shot of the component doing the thing it is for,
 * small enough for a card. The contract every `<slug>.tsx` here keeps:
 *
 * - Default export, no props. It fills its parent and centres itself; the card
 *   decides the size. It reads well from ~300×220 up to ~640×420, because the
 *   scene is laid out at one fixed size and scaled to the box.
 * - Purely presentational. Cards render it inside a link, wrapped in `inert`
 *   and `aria-hidden`, so it never depends on focus, clicks or hover to look
 *   finished.
 * - It may play a gentle loop of its own, and sits still — and complete —
 *   under `prefers-reduced-motion: reduce`.
 * - Token-driven like the components, so it works on light and dark surfaces.
 *
 * Cards mount a thumbnail only once it is near the viewport and unmount it
 * when it is far away (`components/site/lazy-thumb.tsx`), so a catalog of
 * hundreds keeps a dozen alive at a time. Each entry loads through
 * `next/dynamic`, so a page downloads only the thumbnails it shows.
 *
 * Entries are `"<slug>": () => <Thumbnail />`: `pnpm registry:validate` reads
 * that shape out of this file and fails for any component without one.
 */
const AgentHiveThumbnail = dynamic(() => import("./agent-hive"))
const ApprovalGateThumbnail = dynamic(() => import("./approval-gate"))
const CarbonCopyThumbnail = dynamic(() => import("./carbon-copy"))
const FocusStackThumbnail = dynamic(() => import("./focus-stack"))
const GlassCrestThumbnail = dynamic(() => import("./glass-crest"))
const StatusTimelineThumbnail = dynamic(() => import("./status-timeline"))
const ToolTraceThumbnail = dynamic(() => import("./tool-trace"))

export const thumbnails: Record<string, () => ReactNode> = {
  "agent-hive": () => <AgentHiveThumbnail />,
  "approval-gate": () => <ApprovalGateThumbnail />,
  "carbon-copy": () => <CarbonCopyThumbnail />,
  "focus-stack": () => <FocusStackThumbnail />,
  "glass-crest": () => <GlassCrestThumbnail />,
  "status-timeline": () => <StatusTimelineThumbnail />,
  "tool-trace": () => <ToolTraceThumbnail />,
}

export function hasThumbnail(slug: string): boolean {
  return slug in thumbnails
}

export function renderThumbnail(slug: string): ReactNode | null {
  const render = thumbnails[slug]
  return render ? render() : null
}
