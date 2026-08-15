"use client"

import * as React from "react"

/**
 * How much of the remaining distance the lens covers each frame.
 *
 * Higher than the old plate drift used, because this one is a light rather than
 * a mass: a torch that trails a long way behind the hand holding it reads as
 * broken, where a photograph that leans slowly reads as heavy. Still short of
 * 1, so the light arrives just after the cursor instead of being welded to it.
 */
const EASE = 0.16

/** Below this the lens has effectively arrived and the loop can stop. */
const SETTLED = 0.15

/**
 * The torch.
 *
 * The plate underneath is printed at half strength, so the dither reads as grey
 * on black. This element is a soft white disc that follows the pointer and
 * blends `overlay` with everything painted below it, which on those two tones
 * does something very specific: `overlay` leaves a near-black backdrop
 * near-black and drives a mid-grey one to white. The black stays black and the
 * dots under the disc come up to full white — the picture is not lit, it is
 * developed, in a circle, wherever the reader is looking.
 *
 * Nothing is resampled to do it, which is the whole reason it is built this
 * way. The obvious version of this effect moves a mask or a gradient's centre,
 * and both of those re-rasterise a full-screen layer on every frame; this is a
 * fixed disc with a fixed gradient in it, moved by `translate3d`. The blend is
 * a per-pixel GPU operation over one 44rem circle and the transform never
 * leaves the compositor, so a pointer crossing the page renders no React tree,
 * repaints nothing, and cannot touch the dot grid.
 */
export function MastheadLens() {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const node = ref.current
    const band = node?.parentElement
    if (!node || !band) return

    /*
     * A light that follows a pointer needs a pointer that hovers, and under
     * reduced motion an unrequested thing chasing the cursor is exactly what
     * the setting is asking not to happen. In both cases the marker is never
     * set, the element keeps its zero opacity, and the plate is simply the
     * dimmer picture it already is.
     */
    if (!window.matchMedia("(hover: hover)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    /*
     * Cached, and refreshed on the two things that can move the band under a
     * stationary pointer. Measuring inside the frame loop would be correct and
     * would also force a layout on every one of them.
     */
    let rect = band.getBoundingClientRect()
    const remeasure = () => {
      rect = band.getBoundingClientRect()
    }

    let frame = 0
    let targetX = rect.width / 2
    let targetY = rect.height / 2
    let x = targetX
    let y = targetY
    let placed = false

    const write = () => {
      node.style.setProperty("--lens-x", `${x.toFixed(1)}px`)
      node.style.setProperty("--lens-y", `${y.toFixed(1)}px`)
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
       * Outside the band the light is off rather than parked against the
       * nearest edge, which is what the clip would otherwise leave behind: a
       * bright crescent stuck to the bottom of the picture for as long as the
       * reader is anywhere further down the page.
       */
      const inside = targetY >= 0 && targetY <= rect.height
      if (!inside) {
        delete node.dataset.on
        return
      }

      /*
       * The first placement is a jump, not a glide. Easing in from the middle
       * of the band would draw a streak across the picture on the way to a
       * cursor that was already sitting still somewhere else.
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
    window.addEventListener("scroll", remeasure, { passive: true })
    window.addEventListener("resize", remeasure)
    document.documentElement.addEventListener("pointerleave", onLeave)

    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("scroll", remeasure)
      window.removeEventListener("resize", remeasure)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      if (frame) cancelAnimationFrame(frame)
      delete node.dataset.on
    }
  }, [])

  return <div ref={ref} aria-hidden="true" className="masthead-lens" />
}
