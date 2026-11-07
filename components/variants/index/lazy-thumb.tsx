"use client"

import * as React from "react"

import { renderThumb } from "@/components/previews/thumbs/registry"

/*
 * A live miniature that only exists while it is near the screen.
 *
 * It mounts when the stage comes within a screen's height of the viewport and
 * unmounts once it is several screens away, so a catalog of three hundred
 * cells only ever runs the dozen or so around the reader. The two distances
 * differ on purpose: a stage hovering at the edge of one threshold would
 * otherwise mount and unmount on every scroll tick.
 *
 * The stage is `inert` and hidden from assistive technology — it is scenery
 * inside a link, and the link already names the component.
 */
const MOUNT_MARGIN = "600px 0px"
const UNMOUNT_MARGIN = "2400px 0px"

export function LazyThumb({
  slug,
  code,
  replayKey = 0,
}: {
  slug: string
  code: string
  /** Changing it remounts the miniature from its first frame. */
  replayKey?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") {
      setMounted(true)
      return
    }
    const near = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setMounted(true)
      },
      { rootMargin: MOUNT_MARGIN }
    )
    const far = new IntersectionObserver(
      (entries) => {
        if (entries.every((entry) => !entry.isIntersecting)) setMounted(false)
      },
      { rootMargin: UNMOUNT_MARGIN }
    )
    near.observe(node)
    far.observe(node)
    return () => {
      near.disconnect()
      far.disconnect()
    }
  }, [])

  const thumb = mounted ? renderThumb(slug) : null

  return (
    <div ref={ref} inert aria-hidden="true" className="ix-stage-inner select-none">
      {thumb ? (
        <div key={replayKey} className="ix-mounted absolute inset-0">
          {thumb}
        </div>
      ) : (
        <div className="ix-placeholder">
          <span>{mounted ? `${code} · no preview` : `${code} · loading`}</span>
        </div>
      )}
    </div>
  )
}
