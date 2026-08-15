"use client"

import * as React from "react"

/** Furthest the plate travels from centre, in pixels, at the edge of the viewport. */
const DRIFT = 16

/**
 * How much of the remaining distance is covered each frame.
 *
 * Low on purpose. The plate arriving exactly where the pointer is turns the
 * ring field into a cursor read-out; trailing well behind it is what makes the
 * movement read as mass rather than as tracking.
 */
const EASE = 0.06

/** Below this the plate has effectively arrived and the loop can stop. */
const SETTLED = 0.05

/**
 * Pointer parallax for the masthead plate.
 *
 * Takes the picture as `children` so this file only ever touches a wrapper and
 * the plate itself stays server-rendered markup — which is what keeps it in the
 * initial HTML, discoverable by the preload scanner on the first byte.
 *
 * Nothing goes through React state either: the drift is written onto the node
 * as two custom properties inside a rAF, so a pointer crossing the page renders
 * no tree and the transform stays on the compositor.
 *
 * The loop is not free-running. It starts on movement and stops itself once the
 * plate has settled, so an idle tab is not holding a rAF open.
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
     * enlargement in the stylesheet never applies and the picture stays put.
     */
    if (!window.matchMedia("(hover: hover)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    node.dataset.drift = "on"

    let frame = 0
    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0

    const tick = () => {
      x += (targetX - x) * EASE
      y += (targetY - y) * EASE
      node.style.setProperty("--drift-x", `${x.toFixed(2)}px`)
      node.style.setProperty("--drift-y", `${y.toFixed(2)}px`)

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
