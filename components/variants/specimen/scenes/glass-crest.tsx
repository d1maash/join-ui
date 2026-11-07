"use client"

import { Sparkle } from "lucide-react"

import { MARKS } from "@/components/previews/fixtures/glass-crest"
import { CrestAction, CrestQuiet, GlassCrest } from "@/registry/components/glass-crest"

/* Plate 05. The section as it would open a page. */
export default function GlassCrestScene() {
  return (
    <GlassCrest
      className="mx-auto"
      marks={MARKS}
      crestLabel="Supported assets"
      eyebrow="Easy to explore"
      eyebrowIcon={<Sparkle />}
      headingLevel={3}
      headline={
        <>
          A simple <CrestQuiet>approach to the complex</CrestQuiet> world of{" "}
          <CrestQuiet>digital assets</CrestQuiet>
        </>
      }
      actions={<CrestAction>Learn more</CrestAction>}
    />
  )
}
