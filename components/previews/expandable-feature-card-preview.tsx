"use client"

import * as React from "react"
import { Gauge, RotateCcw, ShieldCheck } from "lucide-react"

import { ExpandableFeatureCard } from "@/registry/components/expandable-feature-card"

const FEATURES = [
  {
    id: "rollbacks",
    icon: <RotateCcw />,
    title: "Instant rollbacks",
    description: "Every deploy is immutable and reversible.",
    detail:
      "Roll back to any previous deployment in under a second. Traffic shifts atomically, so no request is ever served a half-updated build.",
  },
  {
    id: "metrics",
    icon: <Gauge />,
    title: "Edge metrics",
    description: "p50, p95 and error rates per region, in real time.",
    detail:
      "Metrics stream from every edge node with a five-second resolution. Alerts can target a single region rather than the whole fleet.",
  },
  {
    id: "isolation",
    icon: <ShieldCheck />,
    title: "Tenant isolation",
    description: "Each preview runs in its own sandbox.",
    detail:
      "Preview environments get isolated storage, secrets and network policy. Nothing leaks between branches, and everything expires with the pull request.",
  },
]

export default function ExpandableFeatureCardPreview() {
  // Exclusive expansion — one card open at a time.
  const [openId, setOpenId] = React.useState<string | null>("rollbacks")

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      {FEATURES.map((feature) => (
        <ExpandableFeatureCard
          key={feature.id}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          open={openId === feature.id}
          onOpenChange={(next) => setOpenId(next ? feature.id : null)}
        >
          {feature.detail}
        </ExpandableFeatureCard>
      ))}
    </div>
  )
}
