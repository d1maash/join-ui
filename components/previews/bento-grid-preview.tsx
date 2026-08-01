import { Gauge, Globe, Lock, Rocket, Terminal } from "lucide-react"

import { AuroraBackground } from "@/registry/components/aurora-background"
import { BentoGrid, BentoGridItem } from "@/registry/components/bento-grid"

/**
 * `BentoGrid` is a Server Component, so this preview stays server-rendered too —
 * the only client JavaScript comes from the nested aurora layer.
 */
export default function BentoGridPreview() {
  return (
    <BentoGrid columns={3} rowHeight="9rem" className="w-full">
      <BentoGridItem
        colSpan={2}
        rowSpan={2}
        icon={<Globe />}
        title="Global edge network"
        description="42 regions, one deploy. Requests resolve at the closest node automatically."
        background={<AuroraBackground asLayer intensity="subtle" speed={26} />}
      />
      <BentoGridItem
        icon={<Rocket />}
        title="Instant deploys"
        description="Median build 4s."
      />
      <BentoGridItem icon={<Lock />} title="Private previews" />
      <BentoGridItem
        colSpan={2}
        icon={<Gauge />}
        title="Live metrics"
        description="p50, p95 and error rates per region, streamed at five-second resolution."
      />
      <BentoGridItem icon={<Terminal />} title="CLI first" description="One binary." />
    </BentoGrid>
  )
}
