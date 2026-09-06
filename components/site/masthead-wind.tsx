"use client"

import * as React from "react"

/**
 * Seconds for one gust to cross the band, left edge to right.
 *
 * Long, and it has to be. The gust is now wider than half a large monitor, so
 * at a quicker period the leading wisps would still be entering as the trailing
 * ones left — the band would never be at rest and the movement would read as a
 * loop rather than as weather. This is slow enough that a reader gets a still
 * picture, then a crossing, then a still picture again.
 */
const PERIOD = 18

const CALM = "(prefers-reduced-motion: reduce)"

/**
 * Whether the wind should blow at all.
 *
 * Read through `useSyncExternalStore` rather than mirrored into state in an
 * effect, because it is external, mutable and able to change under a running
 * page — turn the motion preference off in system settings and the hero starts
 * moving without a reload.
 */
function readBlowing() {
  return !window.matchMedia(CALM).matches
}

function subscribeBlowing(onStoreChange: () => void) {
  const calm = window.matchMedia(CALM)
  calm.addEventListener("change", onStoreChange)
  return () => calm.removeEventListener("change", onStoreChange)
}

/** The server has no motion preference to read, so it answers no. */
const blowingOnServer = () => false

/**
 * The wind.
 *
 * The band prints the nebula as a one-bit dither: black and white, no midtone,
 * no hue. This element holds the *same photograph in colour*, registered pixel
 * for pixel against it, and windows it to a gust — a drifting cluster of soft
 * horizontal wisps that crosses the band from left to right, over and over.
 * Colour appears only where the gust is passing, and only in the patches the
 * wisps happen to cover, so the picture is never revealed whole: it is blown
 * across, in streaks, the way weather crosses a landscape.
 *
 * The gust knows nothing about the pointer. It blows on its own clock whether
 * anyone is there or not, which is what makes it weather rather than an
 * interaction — `MastheadTrail` is what the reader disturbs, and it settles
 * downwind at roughly this gust's speed so the two read as one system.
 *
 * Why it is built out of two counter-moving transforms
 * ---------------------------------------------------
 * The obvious way is one full-band copy with a mask whose position animates.
 * That works and it re-rasterises a full-screen layer on every frame, because
 * moving a mask's geometry is a paint, not a composite — and this animation
 * never stops, so that cost would be permanent.
 *
 * Instead the gust is a fixed box with a fixed mask on it, moved by
 * `translate3d`, and the colour plate inside it is moved by exactly the
 * opposite translation so that it stays pinned to the band while its window
 * travels across. Two composited transforms per frame, no repaint, and — since
 * what it passes over is a dither — no frame in which the dot grid is
 * resampled.
 *
 * The cost of that trick is that the inner copy can no longer inherit the
 * band's size through `inset: 0`, since its containing block is now the gust.
 * So the band is measured and its box written back out as two custom
 * properties. That is what the `ResizeObserver` is for.
 */
export function MastheadWind({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)

  /*
   * Whether the colour print is in the document at all.
   *
   * This is not a styling concern, it is a request one. `opacity: 0` does not
   * stop an image loading, so leaving the colour plate in the markup would put
   * 34 KB of photograph onto every reader who has asked for no motion and will
   * never see it move.
   */
  const blowing = React.useSyncExternalStore(
    subscribeBlowing,
    readBlowing,
    blowingOnServer
  )

  React.useEffect(() => {
    const node = ref.current
    const band = node?.parentElement
    if (!node || !band || !blowing) return

    /*
     * The band's box, written back onto the node for the inner copy to size
     * against, and cached so the loop never has to measure. `travel` is the
     * full crossing: a gust starts entirely off the left edge and finishes
     * entirely off the right one.
     */
    let width = 0
    let height = 0
    let gust = 0
    let travel = 1

    const measure = () => {
      const rect = band.getBoundingClientRect()
      width = rect.width
      height = rect.height
      gust = node.getBoundingClientRect().width || width * 0.4
      gust = node.firstElementChild?.getBoundingClientRect().width || gust
      travel = width + gust
      node.style.setProperty("--band-w", `${width}px`)
      node.style.setProperty("--band-h", `${height}px`)
    }
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(band)

    /*
     * Paused whenever the band is off screen. An ambient animation that keeps a
     * rAF open while the reader is four sections further down the page is just
     * a battery drain with no audience. (A hidden tab stops the loop on its
     * own; the browser will not schedule frames for it.)
     */
    let visible = true
    const watcher = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting)
        if (visible) start()
      },
      { threshold: 0 }
    )
    watcher.observe(band)

    let frame = 0
    let last = 0
    /** Position along the crossing, 0 to 1, advanced by the clock and nothing else. */
    let phase = 0

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
      last = now

      phase = (phase + dt / PERIOD) % 1
      node.style.setProperty("--wind-x", `${(phase * travel - gust).toFixed(1)}px`)

      frame = visible ? requestAnimationFrame(tick) : 0
    }

    /*
     * Held off the band until the opening has played. The band arrives by
     * exposing the photograph and then screening it into the print, and a
     * gust of colour entering from the left while the colour is being taken
     * from the whole band would be the opening contradicting itself. So the
     * first gust waits for the drain to finish — found as the animation
     * itself rather than as a number copied from the stylesheet, so the two
     * cannot drift apart — and starts from off the left edge the moment the
     * print has settled. If hydration lands after the opening has already
     * played, there is nothing to wait for and the wind starts at once.
     */
    let held = false
    let disposed = false

    const start = () => {
      if (!frame && visible && !held) {
        last = 0
        frame = requestAnimationFrame(tick)
      }
    }

    const drain = band
      .querySelector(".masthead-opening")
      ?.getAnimations()
      .find(
        (animation) =>
          animation instanceof CSSAnimation &&
          animation.animationName === "masthead-drain"
      )
    if (drain && drain.playState !== "finished") {
      held = true
      const release = () => {
        held = false
        if (!disposed) start()
      }
      drain.finished.then(release, release)
    }
    start()

    return () => {
      disposed = true
      observer.disconnect()
      watcher.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [blowing])

  return (
    <div ref={ref} aria-hidden="true" className="masthead-wind">
      <div className="masthead-wind-gust">
        <div className="masthead-wind-shot">{blowing ? children : null}</div>
      </div>
    </div>
  )
}
