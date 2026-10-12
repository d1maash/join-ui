"use client"

import { CrestQuiet, GlassCrest } from "@/registry/components/glass-crest"
import { MARKS } from "@/components/previews/fixtures/glass-crest"

import { useBeats } from "./clock"

/* The crest assembles on mount and then holds; the loop is that arrival, again. */
const BEATS = [5200] as const

export default function GlassCrestThumbnail() {
  const { take } = useBeats(BEATS)

  return (
    <GlassCrest
      key={take}
      size="sm"
      className="w-full"
      marks={MARKS}
      spread={124}
      overlap={0.34}
      labels="none"
      crestLabel="Supported assets"
      headingLevel={3}
      headline={
        <span className="text-lg">
          A simple <CrestQuiet>approach to</CrestQuiet> digital assets
        </span>
      }
    />
  )
}
