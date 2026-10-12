"use client"

import { FocusStack } from "@/registry/components/focus-stack"
import { SYSTEM } from "@/components/previews/fixtures/focus-stack"

import { useThumbnail } from "./clock"

/**
 * The stack keeps its own timer, so all the thumbnail has to do is hand it the
 * card's clock: it turns while the card is on screen and holds otherwise.
 */
export default function FocusStackThumbnail() {
  const { live } = useThumbnail()

  return (
    <FocusStack
      label="Design system"
      items={SYSTEM}
      mode="auto"
      size="sm"
      depth={2}
      interval={1700}
      paused={!live}
      interactive={false}
      className="w-full"
    />
  )
}
