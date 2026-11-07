"use client"

import { SYSTEM } from "@/components/previews/fixtures/focus-stack"
import { FocusStack } from "@/registry/components/focus-stack"

/* Plate 04. The coil, turned by its timer; a click or the arrows take over. */
export default function FocusStackScene() {
  return (
    <FocusStack
      label="Design system"
      items={SYSTEM}
      mode="auto"
      defaultIndex={3}
      interval={2600}
      depth={2}
    />
  )
}
