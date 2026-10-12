"use client"

import { CarbonCopy } from "@/registry/components/carbon-copy"

import { useBeats } from "./clock"

/* The ink, the copy and the seat take a little over two seconds; the rest is the line at rest. */
const BEATS = [4600] as const

export default function CarbonCopyThumbnail() {
  const { take } = useBeats(BEATS)

  /* A headline is set once, so a replay is a fresh one. */
  return (
    <CarbonCopy
      key={take}
      as="p"
      lines={["Copy the code.", "Keep the code."]}
      className="text-[1.875rem] leading-none tracking-[-0.042em]"
    />
  )
}
