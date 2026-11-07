"use client"

import { CarbonCopy } from "@/registry/components/carbon-copy"
import { cn } from "@/lib/utils"

import { useBeats, useThumbnail } from "./clock"

const LINES = ["Copy the code.", "Keep the code."] as const
const TYPE = "text-[1.875rem] leading-none tracking-[-0.042em]"

/* The ink, the copy and the seat take a little over two seconds; the rest is the line at rest. */
const BEATS = [4200] as const

export default function CarbonCopyThumbnail() {
  const { session } = useThumbnail()
  const clock = useBeats(BEATS)

  /*
   * At rest, the headline as it is once set: the same element, classes and
   * weight the component leaves behind, without the component. It has no way
   * to be drawn already finished, and a headline is set once — so each take
   * is a fresh one, mounted to play.
   */
  if (!clock) {
    return (
      <p className={cn("relative text-center", TYPE)} style={{ fontWeight: 600 }}>
        {LINES.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
    )
  }

  return (
    <CarbonCopy
      key={`${session}-${clock.take}`}
      as="p"
      trigger="mount"
      lines={LINES}
      className={TYPE}
    />
  )
}
