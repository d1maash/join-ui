"use client"

import { renderPreview } from "@/components/previews/registry"

/**
 * The bare stage the full-screen preview draws on: the component's demo,
 * centred on the site's surface with room to breathe, and an explicit empty
 * state for a slug that has no demo registered yet.
 */
export function PreviewStage({ slug }: { slug: string }) {
  const demo = renderPreview(slug)

  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--g-bg)] p-4 text-[var(--g-ink)] sm:p-8">
      {demo ?? (
        <p className="max-w-sm text-center text-sm leading-relaxed text-[var(--g-ink-3)]">
          No demo is registered for <code className="font-mono text-[var(--g-ink)]">{slug}</code>{" "}
          yet. Add one to{" "}
          <code className="font-mono text-[var(--g-ink)]">components/previews/registry.tsx</code>.
        </p>
      )}
    </div>
  )
}
