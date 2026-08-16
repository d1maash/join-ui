"use client"

import * as React from "react"

/**
 * How many puffs the trail is made of.
 *
 * The pool is fixed and recycled oldest-first, so the DOM never grows and the
 * cost of the effect is the same after ten minutes of waving the cursor around
 * as it is after one second.
 */
const PUFFS = 16

/** How far the pointer must travel before another puff is laid down, in pixels. */
const STEP = 26

/** Seconds a puff takes to fade from full to nothing. */
const LIFE = 1.1

/**
 * Pixels per second a puff drifts once it has been laid down.
 *
 * Rightwards, at roughly the speed the gust crosses the band. This is what ties
 * the trail to the weather rather than leaving it as a second, unrelated effect
 * sitting on top: what the reader disturbs does not hang in the air, it gets
 * carried off the way everything else in this band is being carried off.
 */
const CARRY = 46

const CALM = "(prefers-reduced-motion: reduce)"
const HOVERS = "(hover: hover)"

function readActive() {
  return window.matchMedia(HOVERS).matches && !window.matchMedia(CALM).matches
}

function subscribeActive(onStoreChange: () => void) {
  const hover = window.matchMedia(HOVERS)
  const calm = window.matchMedia(CALM)
  hover.addEventListener("change", onStoreChange)
  calm.addEventListener("change", onStoreChange)
  return () => {
    hover.removeEventListener("change", onStoreChange)
    calm.removeEventListener("change", onStoreChange)
  }
}

/** The server has no pointer and no preference to read, so it answers no. */
const activeOnServer = () => false

/**
 * The trail.
 *
 * Drag the cursor across the band and it leaves colour behind it — a line of
 * soft puffs, each one a window onto the colour print, fading out over about a
 * second and drifting downwind as it goes. The reader is not pointing at the
 * picture, they are disturbing it, and what they disturb settles the way
 * everything else here settles.
 *
 * This replaced a lens: a soft disc of colour that followed the cursor exactly.
 * The disc was legible and completely inert — it was the cursor wearing a
 * costume, present only while the pointer was, gone the instant it stopped. A
 * trail has a past. It records where the reader has been, which is the whole
 * difference between an effect that responds and one that merely tracks.
 *
 * How it is built
 * ---------------
 * A fixed pool of puffs, recycled oldest-first. A puff is a small box with a
 * fixed radial mask on it, holding the colour plate translated by exactly the
 * opposite amount so the plate stays pinned to the band — the same
 * counter-transform the gust uses, for the same reason: the geometry moves on
 * the compositor and nothing repaints.
 *
 * Per frame the loop writes at most sixteen opacities and sixteen transforms,
 * all of them on already-composited layers, and stops itself entirely once the
 * last puff has faded. A stationary cursor costs nothing at all.
 */
export function MastheadTrail() {
  const ref = React.useRef<HTMLDivElement>(null)

  /*
   * Whether the colour plate is in the document at all. This is not a styling
   * concern, it is a request one: `opacity: 0` does not stop an image loading,
   * so a device that can never show the trail should never be asked to fetch
   * sixteen references to the photograph behind it.
   */
  const active = React.useSyncExternalStore(
    subscribeActive,
    readActive,
    activeOnServer
  )

  React.useEffect(() => {
    const node = ref.current
    const band = node?.parentElement
    if (!node || !band || !active) return

    const puffs = Array.from(
      node.querySelectorAll<HTMLElement>(".masthead-puff")
    )
    if (!puffs.length) return

    const measure = () => {
      const rect = band.getBoundingClientRect()
      node.style.setProperty("--band-w", `${rect.width}px`)
      node.style.setProperty("--band-h", `${rect.height}px`)
    }
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(band)

    /** Per-puff state, parallel to the pool. `life` of 0 means unused. */
    const life = new Float32Array(PUFFS)
    const posX = new Float32Array(PUFFS)
    const posY = new Float32Array(PUFFS)
    let next = 0

    let frame = 0
    let last = 0
    let lastX = 0
    let lastY = 0
    let seen = false

    const paint = (i: number) => {
      const puff = puffs[i]
      if (!puff) return
      puff.style.setProperty("--puff-x", `${posX[i]!.toFixed(1)}px`)
      puff.style.setProperty("--puff-y", `${posY[i]!.toFixed(1)}px`)
      /* Squared, so a puff holds its colour for the first half of its life and
         then goes quickly — a linear fade reads as a dimmer switch. */
      const l = life[i]!
      puff.style.setProperty("--puff-o", (l * l).toFixed(3))
    }

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
      last = now

      let alive = false
      for (let i = 0; i < PUFFS; i += 1) {
        if (life[i]! <= 0) continue
        life[i] = Math.max(0, life[i]! - dt / LIFE)
        posX[i] = posX[i]! + CARRY * dt
        paint(i)
        if (life[i]! > 0) alive = true
      }

      frame = alive ? requestAnimationFrame(tick) : 0
      if (!alive) last = 0
    }

    const start = () => {
      if (!frame) {
        last = 0
        frame = requestAnimationFrame(tick)
      }
    }

    const onMove = (event: PointerEvent) => {
      const rect = band.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      if (y < 0 || y > rect.height) {
        seen = false
        return
      }

      /*
       * Puffs are laid down by distance rather than by frame, so the trail has
       * the same density however fast the pointer is moving — dropping one per
       * event would leave a dotted line under a flick and a solid smear under a
       * slow drag.
       */
      if (seen) {
        const dx = x - lastX
        const dy = y - lastY
        if (dx * dx + dy * dy < STEP * STEP) return
      }

      lastX = x
      lastY = y
      seen = true

      posX[next] = x
      posY[next] = y
      life[next] = 1
      paint(next)
      next = (next + 1) % PUFFS

      start()
    }

    const onLeave = () => {
      seen = false
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)

    return () => {
      window.removeEventListener("pointermove", onMove)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [active])

  return (
    <div ref={ref} aria-hidden="true" className="masthead-trail">
      {active
        ? Array.from({ length: PUFFS }, (_, i) => (
            <div key={i} className="masthead-puff">
              <div className="masthead-puff-shot" />
            </div>
          ))
        : null}
    </div>
  )
}
