"use client"

import { TextScramble } from "@/registry/components/text-scramble"

export default function TextScramblePreview() {
  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <TextScramble
        as="h3"
        text="Build faster interfaces"
        speed={2}
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
      />
      <TextScramble
        text="hover to decode this line"
        trigger="hover"
        speed={1}
        className="cursor-default rounded-md border border-border bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground"
      />
      <TextScramble
        text="build 0.4.12 · 01001010"
        characters="01"
        speed={3}
        className="font-mono text-xs text-muted-foreground"
      />
    </div>
  )
}
