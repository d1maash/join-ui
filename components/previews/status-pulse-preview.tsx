"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  StatusPulse,
  type StatusPulseTone,
} from "@/registry/components/status-pulse"

const TONES: StatusPulseTone[] = [
  "operational",
  "degraded",
  "outage",
  "maintenance",
  "idle",
]

export default function StatusPulsePreview() {
  const [index, setIndex] = React.useState(0)
  const tone = TONES[index] ?? "operational"

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex w-full flex-col items-start gap-3 rounded-xl border border-border bg-card p-5">
        <StatusPulse tone={tone} variant="chip" size="lg" />
        <StatusPulse tone="degraded" live={false} detail="since 14:02" />
        <StatusPulse
          tone="outage"
          live={false}
          size="sm"
          label="eu-west-1 unreachable"
        />
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIndex((value) => (value + 1) % TONES.length)}
      >
        Cycle status ({tone})
      </Button>
    </div>
  )
}
