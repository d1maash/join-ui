import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Numbered procedure.
 *
 * The counter is driven by CSS so steps renumber themselves when one is added
 * or removed in MDX, and a continuous rule ties the sequence together.
 */
export function Steps({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("my-6 [counter-reset:step] flex flex-col", className)}>
      {children}
    </div>
  )
}

export function Step({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative border-l border-border pb-8 pl-8 last:border-transparent last:pb-0",
        "[counter-increment:step]",
        // The marker sits on the rule and carries the generated number.
        "before:absolute before:top-0 before:left-0 before:flex before:size-6 before:-translate-x-1/2",
        "before:items-center before:justify-center before:rounded-full before:border before:border-border",
        "before:bg-card before:text-[0.6875rem] before:font-semibold before:text-foreground before:shadow-xs",
        "before:[font-variant-numeric:tabular-nums]",
        "before:content-[counter(step)]"
      )}
    >
      <h3 className="mt-0.5 mb-2 text-[0.9375rem] font-semibold">
        {title}
      </h3>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground [&>p]:my-0">
        {children}
      </div>
    </div>
  )
}
