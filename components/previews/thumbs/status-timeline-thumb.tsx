"use client"

import * as React from "react"
import { MapPin, Package, ShoppingBag, Truck } from "lucide-react"
import { useInView, useReducedMotion } from "motion/react"

import {
  StatusTimeline,
  type StatusTimelineStep,
} from "@/registry/components/status-timeline"

/*
 * The product shot: a delivery being tracked, one step at a time. Advances on
 * its own while the tile is on screen, holds on the finished card, then
 * starts again. Under reduced motion it is the same card, still, mid-journey.
 */

const SCENE = { width: 480, height: 372 }

const STEPS: StatusTimelineStep[] = [
  {
    id: "confirmed",
    title: "Order confirmed",
    description: "Payment captured.",
    timestamp: "13:45",
    icon: <ShoppingBag />,
  },
  {
    id: "packed",
    title: "Packed",
    description: "Leaving the warehouse.",
    timestamp: "16:02",
    icon: <Package />,
  },
  {
    id: "transit",
    title: "In transit",
    description: "Handed to the courier.",
    timestamp: "08:20",
    icon: <Truck />,
  },
  {
    id: "delivered",
    title: "Delivered",
    description: "Signed for at the front desk.",
    timestamp: "11:07",
    icon: <MapPin />,
  },
]

/** How long each index is held, in ms. The last entry is the finished card. */
const BEATS = [1500, 1700, 1700, 1700, 2600]
const STILL = 2

export default function Thumb() {
  const [ref, scale] = useFit(SCENE.width, SCENE.height)
  const reduceMotion = useReducedMotion()
  const inView = useInView(ref, { amount: 0.3 })
  const [active, setActive] = React.useState(0)

  React.useEffect(() => {
    if (reduceMotion || !inView) return
    const timer = window.setTimeout(
      () => setActive((index) => (index + 1) % BEATS.length),
      BEATS[active]
    )
    return () => window.clearTimeout(timer)
  }, [active, inView, reduceMotion])

  return (
    <div ref={ref} className="relative flex size-full items-center justify-center overflow-hidden">
      {scale === null ? null : (
        <div
          className="relative flex shrink-0 animate-fade-in items-center justify-center"
          style={{ width: SCENE.width, height: SCENE.height, transform: `scale(${scale})` }}
        >
          {/* A soft aura of the in-flight hue, so the card reads on any surface. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-6 top-10 bottom-0 rounded-full opacity-70 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--info) 22%, transparent), color-mix(in oklab, var(--positive) 10%, transparent) 60%, transparent)",
            }}
          />
          <StatusTimeline
            label="Delivery"
            steps={STEPS}
            activeStep={reduceMotion ? STILL : active}
            className="relative w-[408px] shadow-[0_1px_2px_rgb(0_0_0/0.04),0_18px_44px_-14px_rgb(0_0_0/0.18)]"
          />
        </div>
      )}
    </div>
  )
}

/**
 * Scales a fixed-size scene to fit its parent. Nothing is drawn until the
 * parent has been measured, so the shot never flashes at the wrong size.
 */
function useFit(width: number, height: number, fill = 0.92) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState<number | null>(null)

  React.useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const measure = () => {
      const w = node.clientWidth
      const h = node.clientHeight
      if (w > 0 && h > 0) setScale(Math.min(w / width, h / height) * fill)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [width, height, fill])

  return [ref, scale] as const
}
