"use client"

import { AuroraBackground } from "@/registry/components/aurora-background"

export default function AuroraBackgroundPreview() {
  return (
    <AuroraBackground className="w-full rounded-xl border border-border">
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center sm:py-24">
        <p className="rounded-full border border-border bg-card/70 px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
          v2.4 · now in general availability
        </p>
        <h3 className="max-w-md text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Ship to the edge without thinking about regions
        </h3>
        <p className="max-w-sm text-balance text-sm text-muted-foreground">
          One command deploys to 42 locations. Rollbacks are instant.
        </p>
      </div>
    </AuroraBackground>
  )
}
