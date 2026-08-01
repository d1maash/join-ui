"use client"

import { ArrowRight, Download } from "lucide-react"

import { GitHubIcon } from "@/components/icons"
import { MagneticButton } from "@/registry/components/magnetic-button"

export default function MagneticButtonPreview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <MagneticButton size="lg">
        Get started
        <ArrowRight />
      </MagneticButton>
      <MagneticButton variant="outline" size="lg">
        <GitHubIcon />
        Star on GitHub
      </MagneticButton>
      <MagneticButton variant="ghost" strength={0.5} radius={90}>
        <Download />
        Download
      </MagneticButton>
    </div>
  )
}
