"use client"

import { CrestQuiet, GlassCrest } from "@/registry/components/glass-crest"
import { MARKS } from "@/components/previews/fixtures/glass-crest"

import { useThumbnail } from "./clock"

/**
 * The crest assembles on mount and then holds still, so the hover is that
 * arrival: each one is a fresh crest, keyed on the session, dealt apex first.
 * Letting go leaves it standing — it has nowhere to go back to.
 */
export default function GlassCrestThumbnail() {
  const { session } = useThumbnail()

  return (
    <GlassCrest
      key={session}
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
