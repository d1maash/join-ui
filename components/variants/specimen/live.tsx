"use client"

import { renderPreview } from "@/components/previews/registry"
import { renderThumb } from "@/components/previews/thumbs/registry"

/*
 * Client doorways to the two demo registries, so server pages can set a
 * component's full preview or its miniature without importing either.
 */

export function Bench({ slug }: { slug: string }) {
  return <>{renderPreview(slug)}</>
}

/** The miniature. Always inside an inert, hidden frame: it is a picture. */
export function Thumb({ slug }: { slug: string }) {
  return (
    <div inert aria-hidden="true" className="size-full">
      {renderThumb(slug)}
    </div>
  )
}
