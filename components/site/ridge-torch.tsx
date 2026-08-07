"use client"

import * as React from "react"

/**
 * Pointer light over the masthead photograph.
 *
 * The whole component is one `div` and a `pointermove` handler; everything that
 * decides how it looks lives in `.ridge-torch` in `globals.css`. Nothing is
 * mirrored into React state — position is written straight onto the node as two
 * custom properties inside a rAF, so moving the pointer never renders a tree.
 *
 * It declines to run at all where it would be wrong rather than shipping a
 * degraded version: on a device with no hovering pointer there is no way to aim
 * it and it would sit lit wherever the last tap landed, and under
 * `prefers-reduced-motion` a light that chases the cursor is exactly the kind of
 * unrequested movement that setting is asking about.
 */
export function RidgeTorch() {
  const fieldRef = React.useRef<HTMLDivElement>(null)
  const torchRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const field = fieldRef.current
    const torch = torchRef.current
    if (!field || !torch) return

    if (!window.matchMedia("(hover: hover)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    let clientX = 0
    let clientY = 0

    const paint = () => {
      frame = 0
      /*
       * Read once per frame rather than per event: the box moves under a still
       * pointer on every scroll, so the offset cannot be cached across frames.
       */
      const rect = field.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top

      torch.style.setProperty("--torch-x", `${x}px`)
      torch.style.setProperty("--torch-y", `${y}px`)
      torch.dataset.lit = String(
        x >= 0 && y >= 0 && x <= rect.width && y <= rect.height
      )
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }

    const onMove = (event: PointerEvent) => {
      clientX = event.clientX
      clientY = event.clientY
      schedule()
    }

    /* The pointer leaving the window stops firing moves, so darken explicitly. */
    const onLeave = () => {
      torch.dataset.lit = "false"
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("scroll", schedule, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)

    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("scroll", schedule)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={fieldRef} className="absolute inset-0">
      <div ref={torchRef} className="ridge-torch" data-lit="false" />
    </div>
  )
}
