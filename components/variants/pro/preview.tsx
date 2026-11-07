"use client"

import { renderPreview } from "@/components/previews/registry"

/*
 * The workbench demo for a component, rendered on the client — the preview
 * registry is a client module, so a server page cannot call into it directly.
 */
export function ProPreview({ slug }: { slug: string }) {
  const demo = renderPreview(slug)
  if (demo) return <>{demo}</>
  return (
    <p className="max-w-sm text-center text-[15px] leading-relaxed text-[#86868b]">
      No live demo is registered for this component yet.
    </p>
  )
}
