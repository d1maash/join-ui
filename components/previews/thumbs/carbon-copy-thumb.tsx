"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { CarbonCopy } from "@/registry/components/carbon-copy"
import { cn } from "@/lib/utils"

/*
 * The product shot: a headline inking up, its copy peeling off and turning a
 * word over as it seats — then a breath, and the next pair. Under reduced
 * motion the component renders its finished lines and the loop never starts,
 * so the still frame is the first pair, set. Laid out at one fixed size and
 * scaled to the tile.
 */
const SCENE = { width: 560, height: 300 }

const PAIRS = [
  ["Copy the code.", "Keep the code."],
  ["Build it fast.", "Build it right."],
  ["Ship on Friday.", "Sleep on Friday."],
] as const

/** How long one pair holds the stage, and how long it takes to leave it. */
const HOLD = 4600
const LEAVE = 520

export default function CarbonCopyThumb() {
  const [frame, scale] = useFit(SCENE.width, SCENE.height)
  const reduceMotion = useReducedMotion()
  const [take, setTake] = React.useState(0)
  const [leaving, setLeaving] = React.useState(false)

  React.useEffect(() => {
    if (reduceMotion) return
    const timers: number[] = []
    const cycle = () => {
      timers.push(
        window.setTimeout(() => setLeaving(true), HOLD),
        window.setTimeout(() => {
          setLeaving(false)
          setTake((n) => n + 1)
          cycle()
        }, HOLD + LEAVE)
      )
    }
    cycle()
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [reduceMotion])

  const lines = PAIRS[take % PAIRS.length]!

  return (
    <div ref={frame} className="relative size-full overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 flex items-center justify-center"
        style={{
          width: SCENE.width,
          height: SCENE.height,
          transform: `translate(-50%, -50%) scale(${scale ?? 1})`,
          opacity: scale === null ? 0 : 1,
        }}
      >
        <div
          className={cn(
            "transition-[opacity,filter,translate] ease-[cubic-bezier(0.32,0.72,0,1)]",
            leaving
              ? "-translate-y-1.5 opacity-0 blur-[6px] duration-500"
              : "translate-y-0 opacity-100 blur-none duration-0"
          )}
        >
          <CarbonCopy
            key={take}
            as="p"
            trigger="mount"
            lines={lines}
            className="text-[4.25rem] leading-[1.05] tracking-[-0.042em] whitespace-nowrap text-foreground"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * The scale at which a `width` × `height` scene fits its frame, read off the
 * frame's own box and kept current as it resizes. Null until the first
 * measurement, so the scene is never painted at the wrong size.
 */
function useFit(width: number, height: number) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState<number | null>(null)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const box = entry.contentRect
      if (box.width === 0 || box.height === 0) return
      setScale(Math.min(box.width / width, box.height / height))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [width, height])

  return [ref, scale] as const
}
