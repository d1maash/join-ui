"use client"

import { renderPreview } from "@/components/previews/registry"

/**
 * The bare stage the full-screen preview draws on: the component's demo,
 * centred on the site's surface with room to breathe, and an explicit empty
 * state for a slug that has no demo registered yet.
 *
 * It is painted in the shared tokens rather than the site's own, and it is
 * marked, because the component page's workbench frames this route for its
 * tablet and phone widths and themes the frame by putting `.light` on this
 * element: the stage and the demo then re-theme together, exactly as the
 * full-width canvas does.
 */
export function PreviewStage({ slug }: { slug: string }) {
  const demo = renderPreview(slug)

  return (
    <div
      data-preview-stage=""
      className="flex flex-1 items-center justify-center bg-background p-4 text-foreground sm:p-8"
    >
      {demo ?? (
        <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
          No demo is registered for <code className="font-mono text-foreground">{slug}</code>{" "}
          yet. Add one to{" "}
          <code className="font-mono text-foreground">components/previews/registry.tsx</code>.
        </p>
      )}
    </div>
  )
}
