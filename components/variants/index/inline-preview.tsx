"use client"

import Link from "next/link"
import { Maximize2 } from "lucide-react"

import { renderPreview } from "@/components/previews/registry"

/** `<ComponentPreview slug title minHeight />` inside the docs, as a boxed cell. */
export function IxInlinePreview({
  slug,
  title,
  minHeight = "22rem",
}: {
  slug: string
  title?: string
  minHeight?: string
}) {
  const demo = renderPreview(slug)
  return (
    <div className="ix-codebox my-6">
      <div className="ix-codebar">
        <span className="ix-mono min-w-0 flex-1 truncate text-[var(--ix-fg-2)]">{title ?? slug}</span>
        <Link href={`/preview/${slug}`} className="ix-icon-btn" aria-label="Open the full-page preview">
          <Maximize2 aria-hidden="true" className="!size-3.5" />
        </Link>
      </div>
      <div
        className="flex items-center justify-center bg-[var(--ix-bg)] p-6 text-[var(--foreground)]"
        style={{ minHeight }}
      >
        {demo ?? <p className="ix-mono ix-fg-3">No demo is registered for {slug}.</p>}
      </div>
    </div>
  )
}
