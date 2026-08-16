"use client"

import * as React from "react"

/** Furthest the plate travels from centre, in pixels, at the edge of the viewport. */
const DRIFT = 26

/**
 * How much of the remaining distance is covered each frame.
 *
 * Low on purpose. The plate arriving exactly where the pointer is turns the
 * picture into a cursor read-out; trailing well behind it is what makes the
 * movement read as mass rather than as tracking. It also matters more here than
 * it would on a photograph: the travel is quantised, so a fast follow would
 * skip three cells at a time and the steps would stop being legible as steps.
 */
const EASE = 0.075

/** Below this the plate has effectively arrived and the loop can stop. */
const SETTLED = 0.05

/** Dots across the wide plate and across the tall one. Set by the dither. */
const GRID_WIDE = 480
const GRID_TALL = 215

/**
 * Quantised pointer parallax for the masthead plate.
 *
 * The plate answers the pointer — move across the page and the dust drifts
 * against you — but it does not glide. Every position it is allowed to take is
 * a whole number of dither cells from centre, so the picture *steps*: it holds,
 * clicks over by one cell, holds again. On a photograph that would read as
 * jank. On a one-bit image it is the only honest way to move at all.
 *
 * Why: a dither has no sub-pixel. Translate it by two and a half device pixels
 * and the compositor has to resample, every white dot lands across two output
 * pixels as a pair of greys, and the entire picture — whose only content is the
 * arrangement of hard black and hard white — turns to mush for the whole
 * duration of the movement. Snapping the translation to a whole cell means the
 * bitmap is blitted rather than filtered, so the pattern that arrives at rest
 * is byte for byte the pattern that was moving.
 *
 * The cell is measured rather than assumed. It is the plate's dot size in
 * source pixels — its natural width over the grid it was dithered on —
 * multiplied by whatever `object-fit: cover` is currently scaling it by, then
 * rounded to a whole CSS pixel so the result is a whole device pixel at every
 * sensible ratio. That is a different number at 1440 than at 1920, and a
 * different one again on the phone plate, which is exactly why it is not a
 * constant in the stylesheet.
 *
 * Nothing goes through React state: the drift is written onto the node as two
 * custom properties inside a rAF, so a pointer crossing the page renders no
 * tree and the transform stays on the compositor. The loop is not
 * free-running either — it starts on movement and stops once the plate has
 * settled, so an idle tab is not holding a rAF open.
 */
export function MastheadDrift({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    /*
     * A plate that leans away from a pointer needs a pointer that hovers, and
     * under reduced motion an unrequested drift is exactly what the setting is
     * asking not to happen. In both cases the marker is never set, so the
     * overscan in the stylesheet never applies and the picture stays put.
     */
    if (!window.matchMedia("(hover: hover)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const img = node.querySelector("img")
    if (!img) return

    node.dataset.drift = "on"

    /*
     * The cell, in CSS pixels. Recomputed on resize and after the image lands,
     * because both change which source `srcset` picked and what `cover` is
     * doing with it.
     */
    let cell = 4
    const measure = () => {
      const box = img.getBoundingClientRect()
      const { naturalWidth: natW, naturalHeight: natH } = img
      if (!natW || !natH || !box.width) return
      const cover = Math.max(box.width / natW, box.height / natH)
      const grid = /mobile/.test(img.currentSrc) ? GRID_TALL : GRID_WIDE
      cell = Math.max(1, Math.round((natW / grid) * cover))
    }

    measure()
    if (!img.complete) img.addEventListener("load", measure)

    const observer = new ResizeObserver(measure)
    observer.observe(node)

    let frame = 0
    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0
    /* The last values actually written, so a frame that lands on the same cell
       as the previous one does not touch the DOM at all. */
    let wroteX = 0
    let wroteY = 0

    const tick = () => {
      x += (targetX - x) * EASE
      y += (targetY - y) * EASE

      const snappedX = Math.round(x / cell) * cell
      const snappedY = Math.round(y / cell) * cell

      if (snappedX !== wroteX) {
        wroteX = snappedX
        node.style.setProperty("--drift-x", `${snappedX}px`)
      }
      if (snappedY !== wroteY) {
        wroteY = snappedY
        node.style.setProperty("--drift-y", `${snappedY}px`)
      }

      frame =
        Math.abs(targetX - x) > SETTLED || Math.abs(targetY - y) > SETTLED
          ? requestAnimationFrame(tick)
          : 0
    }

    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const onMove = (event: PointerEvent) => {
      /*
       * Measured against the viewport rather than the band's own box: the
       * masthead scrolls away while the pointer keeps moving, and reading a
       * rect every frame to chase it would buy nothing a reader can see.
       */
      targetX = -((event.clientX / window.innerWidth) * 2 - 1) * DRIFT
      targetY = -((event.clientY / window.innerHeight) * 2 - 1) * DRIFT
      start()
    }

    /* Pointer gone from the window: settle back to centre rather than freeze. */
    const onLeave = () => {
      targetX = 0
      targetY = 0
      start()
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)

    return () => {
      window.removeEventListener("pointermove", onMove)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      img.removeEventListener("load", measure)
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
      delete node.dataset.drift
    }
  }, [])

  return (
    <div ref={ref} className="masthead-drift">
      {children}
    </div>
  )
}
