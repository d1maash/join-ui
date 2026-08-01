"use client"

import { MetricCard } from "@/registry/components/metric-card"

export default function MetricCardPreview() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        label="Monthly revenue"
        value={48250}
        prefix="$"
        delta={12.4}
        series={[12, 18, 15, 24, 22, 31, 38]}
      />
      <MetricCard
        label="p95 latency"
        value={182}
        suffix="ms"
        delta={-8.3}
        invertTrend
        series={[240, 232, 218, 205, 198, 190, 182]}
      />
      <MetricCard
        label="Error rate"
        value={0.42}
        suffix="%"
        precision={2}
        delta={0}
        deltaLabel="flat week over week"
        series={[0.4, 0.45, 0.41, 0.43, 0.4, 0.44, 0.42]}
      />
    </div>
  )
}
