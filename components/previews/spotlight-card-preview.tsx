"use client"

import { Globe, ShieldCheck, Zap } from "lucide-react"

import {
  SpotlightCard,
  SpotlightCardContent,
  SpotlightCardDescription,
  SpotlightCardHeader,
  SpotlightCardTitle,
} from "@/registry/components/spotlight-card"

const CARDS = [
  {
    icon: Globe,
    title: "Global edge",
    description: "Requests resolve at the nearest of 42 regions, automatically.",
    stat: "42 regions",
  },
  {
    icon: Zap,
    title: "Instant deploys",
    description: "Push to main and your build is live in a few seconds.",
    stat: "~4s median",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    description: "Every preview is signed and expires when the branch closes.",
    stat: "SOC 2 Type II",
  },
]

export default function SpotlightCardPreview() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CARDS.map(({ icon: Icon, title, description, stat }) => (
        <SpotlightCard key={title}>
          <SpotlightCardHeader>
            <span
              aria-hidden="true"
              className="mb-1 flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground"
            >
              <Icon className="size-4" />
            </span>
            <SpotlightCardTitle>{title}</SpotlightCardTitle>
            <SpotlightCardDescription>{description}</SpotlightCardDescription>
          </SpotlightCardHeader>
          <SpotlightCardContent>
            <p className="font-mono text-xs text-muted-foreground">{stat}</p>
          </SpotlightCardContent>
        </SpotlightCard>
      ))}
    </div>
  )
}
