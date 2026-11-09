"use client"

import * as React from "react"

import { PROOF_OF_WORK_MARKS, ProofOfWork } from "@/registry/components/proof-of-work"

/*
 * The product shot: the whole family at once, each mark at work on its own
 * problem. Nothing here is scripted — the marks keep their own clocks, and
 * under reduced motion each one holds a frame from the middle of its work.
 * Laid out at one fixed size and scaled to the tile.
 */
const SCENE = { width: 480, height: 340 }

export default function ProofOfWorkThumbnail() {
  const [frame, scale] = useFit(SCENE.width, SCENE.height)

  return (
    <div
      ref={frame}
      className="relative flex size-full items-center justify-center overflow-hidden"
    >
      {scale === null ? null : (
        <div
          className="grid shrink-0 animate-fade-in grid-cols-3 place-items-center text-foreground"
          style={{
            width: SCENE.width,
            height: SCENE.height,
            padding: "30px 40px",
            transform: `scale(${scale})`,
          }}
        >
          {PROOF_OF_WORK_MARKS.map((mark) => (
            <ProofOfWork key={mark} mark={mark} size={92} />
          ))}
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
