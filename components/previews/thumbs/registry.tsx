"use client"

import dynamic from "next/dynamic"
import type { ComponentType, ReactNode } from "react"

/*
 * Thumbnails — a compact, live miniature of each component, for the tiles on
 * the landing page and in the catalog. Not the preview: the preview is a
 * workbench with captions and controls, a thumbnail is one composed shot of
 * the component doing the thing it is for.
 *
 * Contract for every `<slug>-thumb.tsx`:
 * - Default export, no props. Fills its parent (`size-full`) and centres
 *   itself; the parent decides the size. It must read well anywhere from
 *   ~300×220 up to ~640×420 — scale the composition, never overflow.
 * - Purely presentational. Consumers render it inside a link, wrapped in an
 *   element with `inert` and `aria-hidden`, so it must not depend on focus,
 *   clicks or hover to look finished.
 * - It may animate on its own (an autoplaying loop is welcome), but must sit
 *   still and look complete under `prefers-reduced-motion: reduce`.
 * - Token-driven like the components, so it works on light and dark surfaces.
 */
const thumbs: Record<string, ComponentType> = {
  "agent-hive": dynamic(() => import("./agent-hive-thumb")),
  "approval-gate": dynamic(() => import("./approval-gate-thumb")),
  "carbon-copy": dynamic(() => import("./carbon-copy-thumb")),
  "focus-stack": dynamic(() => import("./focus-stack-thumb")),
  "glass-crest": dynamic(() => import("./glass-crest-thumb")),
  "status-timeline": dynamic(() => import("./status-timeline-thumb")),
  "tool-trace": dynamic(() => import("./tool-trace-thumb")),
}

export function hasThumb(slug: string): boolean {
  return slug in thumbs
}

export function renderThumb(slug: string): ReactNode | null {
  const Thumb = thumbs[slug]
  return Thumb ? <Thumb /> : null
}

export function ComponentThumb({ slug }: { slug: string }) {
  return <>{renderThumb(slug)}</>
}
