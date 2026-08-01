"use client"

import { ArrowRight, Download, Github } from "lucide-react"

import { MagneticButton } from "@/registry/components/magnetic-button"

export default function MagneticButtonPreview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <MagneticButton size="lg">
        Get started
        <ArrowRight />
      </MagneticButton>
      <MagneticButton variant="outline" size="lg">
        <Github />
        Star on GitHub
      </MagneticButton>
      <MagneticButton variant="ghost" strength={0.5} radius={90}>
        <Download />
        Download
      </MagneticButton>
    </div>
  )
}
