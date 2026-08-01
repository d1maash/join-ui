"use client"

import { Check } from "lucide-react"

import { GradientBorderCard } from "@/registry/components/gradient-border-card"

const FEATURES = ["Unlimited projects", "Priority support", "Custom domains"]

export default function GradientBorderCardPreview() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <GradientBorderCard innerClassName="flex h-full flex-col gap-4 p-6">
        <div>
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Pro
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            $24
            <span className="text-sm font-normal text-muted-foreground">/month</span>
          </p>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check aria-hidden="true" className="size-3.5 shrink-0 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </GradientBorderCard>

      <GradientBorderCard
        animate={false}
        glow={false}
        borderWidth={2}
        colors={["var(--accent)", "transparent", "transparent", "var(--accent)"]}
        innerClassName="flex h-full flex-col justify-center gap-2 p-6"
      >
        <p className="text-sm font-semibold">Static variant</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Set <code className="font-mono text-xs">animate=false</code> to keep the
          gradient without the rotation.
        </p>
      </GradientBorderCard>
    </div>
  )
}
