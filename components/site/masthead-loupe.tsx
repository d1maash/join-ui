"use client"

import * as React from "react"

/**
 * How much of the remaining distance the loupe covers each frame.
 *
 * Higher than the plate drift this replaced used, because this is an instrument
 * rather than a mass: a lens that trails a long way behind the hand holding it
 * reads as broken. Still short of 1, so it arrives just after the cursor
 * instead of being welded to it.
 */
const EASE = 0.16

/** Below this the loupe has effectively arrived and the loop can stop. */
const SETTLED = 0.15

/**
 * The loupe.
 *
 * The plate underneath is printed at about a quarter strength — a ghost of the
 * picture, present but not yet resolved. This element holds a second copy of
 * exactly the same plate at full strength, masked to a soft disc that follows
 * the pointer, so the hands develop under the cursor and fall back to the
 * ghost behind it. Nothing is lit, tinted or blended: it is the same image at
 * two exposures, and the reader carries the boundary between them.
 *
 * Why it is built out of two counter-moving transforms
 * ---------------------------------------------------
 * The obvious way to do this is one full-band copy with a radial mask whose
 * centre is a pair of custom properties. That works and it re-rasterises a
 * full-screen layer on every frame, because moving a mask's geometry is a
 * paint, not a composite.
 *
 * Instead the disc is a fixed box with a fixed mask on it, moved by
 * `translate3d`, and the plate inside it is moved by exactly the opposite
 * translation so that it stays pinned to the band while its window slides
 * across. Two composited transforms, no repaint, and the dot grid is never
 * resampled — which on a one-bit image is not a performance nicety but the
 * difference between dots and grey mush.
 *
 * The cost of that trick is that the inner copy can no longer inherit the
 * band's size through `inset: 0`, since its containing block is now the disc.
 * So the band is measured and its box written back out as two custom
 * properties. That is what the `ResizeObserver` is for.
 */
export function MastheadLoupe({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const node = ref.current
    const band = node?.parentElement
    if (!node || !band) return

    /*
     * A lens that follows a pointer needs a pointer that hovers, and under
     * reduced motion an unrequested thing chasing the cursor is exactly what
     * the setting is asking not to happen. In both cases nothing here runs, the
     * loupe keeps its zero opacity, and the stylesheet prints the plate at the
     * higher of its two strengths instead — see the `(hover: hover)` query on
     * `.masthead-plate`.
     */
    if (!window.matchMedia("(hover: hover)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    /*
     * The band's box, written back onto the node for the inner copy to size
     * against, and cached for turning client coordinates into band ones.
     * Refreshed by the observer on layout and by the listeners on the two
     * things that move the band under a stationary pointer.
     */
    let rect = band.getBoundingClientRect()
    const measure = () => {
      rect = band.getBoundingClientRect()
      node.style.setProperty("--band-w", `${rect.width}px`)
      node.style.setProperty("--band-h", `${rect.height}px`)
    }
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(band)

    const reposition = () => {
      rect = band.getBoundingClientRect()
    }

    let frame = 0
    let targetX = rect.width / 2
    let targetY = rect.height / 2
    let x = targetX
    let y = targetY
    let placed = false

    const write = () => {
      node.style.setProperty("--loupe-x", `${x.toFixed(1)}px`)
      node.style.setProperty("--loupe-y", `${y.toFixed(1)}px`)
    }
    write()

    const tick = () => {
      x += (targetX - x) * EASE
      y += (targetY - y) * EASE
      write()

      frame =
        Math.abs(targetX - x) > SETTLED || Math.abs(targetY - y) > SETTLED
          ? requestAnimationFrame(tick)
          : 0
    }

    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX - rect.left
      targetY = event.clientY - rect.top

      /*
       * Outside the band the loupe is off rather than parked against the
       * nearest edge, which is what the clip would otherwise leave behind: a
       * developed crescent stuck to the bottom of the picture for as long as
       * the reader is anywhere further down the page.
       */
      if (targetY < 0 || targetY > rect.height) {
        delete node.dataset.on
        return
      }

      /*
       * The first placement is a jump, not a glide. Easing in from the middle
       * of the band would wipe a developed streak across the picture on the way
       * to a cursor that was already sitting still somewhere else.
       */
      if (!placed) {
        placed = true
        x = targetX
        y = targetY
        write()
      }

      node.dataset.on = "on"
      start()
    }

    const onLeave = () => {
      delete node.dataset.on
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("scroll", reposition, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)

    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("scroll", reposition)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
      delete node.dataset.on
    }
  }, [])

  return (
    <div ref={ref} aria-hidden="true" className="masthead-loupe">
      <div className="masthead-loupe-disc">
        <div className="masthead-loupe-shot">{children}</div>
      </div>
    </div>
  )
}
