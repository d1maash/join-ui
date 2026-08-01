"use client"

import dynamic from "next/dynamic"
import type { ComponentType } from "react"

function PreviewSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading preview"
      className="flex w-full max-w-md flex-col gap-3"
    >
      <div className="h-8 w-1/3 animate-pulse rounded-md bg-muted" />
      <div className="h-24 w-full animate-pulse rounded-lg bg-muted" />
    </div>
  )
}

/**
 * Slug → preview component.
 *
 * Each entry is a separate `next/dynamic` import, so a component page only
 * downloads its own demo instead of every demo on the site. SSR stays on, which
 * keeps previews present in the HTML and avoids layout shift on load.
 */
export const previewRegistry: Record<string, ComponentType> = {
  "magnetic-button": dynamic(() => import("./magnetic-button-preview"), {
    loading: PreviewSkeleton,
  }),
  "spotlight-card": dynamic(() => import("./spotlight-card-preview"), {
    loading: PreviewSkeleton,
  }),
  "morphing-tabs": dynamic(() => import("./morphing-tabs-preview"), {
    loading: PreviewSkeleton,
  }),
  "aurora-background": dynamic(() => import("./aurora-background-preview"), {
    loading: PreviewSkeleton,
  }),
  "gradient-border-card": dynamic(() => import("./gradient-border-card-preview"), {
    loading: PreviewSkeleton,
  }),
  "animated-command-menu": dynamic(() => import("./animated-command-menu-preview"), {
    loading: PreviewSkeleton,
  }),
  "floating-dock": dynamic(() => import("./floating-dock-preview"), {
    loading: PreviewSkeleton,
  }),
  "text-scramble": dynamic(() => import("./text-scramble-preview"), {
    loading: PreviewSkeleton,
  }),
  "expandable-feature-card": dynamic(
    () => import("./expandable-feature-card-preview"),
    { loading: PreviewSkeleton }
  ),
  "cursor-highlight": dynamic(() => import("./cursor-highlight-preview"), {
    loading: PreviewSkeleton,
  }),
  "animated-field": dynamic(() => import("./animated-field-preview"), {
    loading: PreviewSkeleton,
  }),
  "status-pulse": dynamic(() => import("./status-pulse-preview"), {
    loading: PreviewSkeleton,
  }),
  "metric-card": dynamic(() => import("./metric-card-preview"), {
    loading: PreviewSkeleton,
  }),
  "bento-grid": dynamic(() => import("./bento-grid-preview"), {
    loading: PreviewSkeleton,
  }),
}

export function getPreviewComponent(slug: string): ComponentType | undefined {
  return previewRegistry[slug]
}
