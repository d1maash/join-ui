import * as React from "react"

import { cn } from "@/lib/utils"

export interface StepsProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode
}

/**
 * Numbered walkthrough.
 *
 * Rendered as an ordered list so the sequence and the total count are exposed
 * to assistive technology; the numbered markers are generated with a CSS
 * counter rather than typed into the content.
 */
export function Steps({ className, children, ...props }: StepsProps) {
  return (
    <div
      className={cn(
        "my-6 [counter-reset:joinway-step]",
        "[&>ol]:m-0 [&>ol]:list-none [&>ol]:p-0",
        className
      )}
      {...props}
    >
      <ol className="flex flex-col">{children}</ol>
    </div>
  )
}

export interface StepProps extends React.ComponentPropsWithoutRef<"li"> {
  title: string
}

export function Step({ title, className, children, ...props }: StepProps) {
  return (
    <li
      className={cn(
        "relative border-l border-border pb-6 pl-9 last:border-transparent last:pb-0",
        "[counter-increment:joinway-step]",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-0 -left-[0.9375rem] flex size-[1.875rem] items-center justify-center rounded-full border border-border bg-card",
          "font-mono text-xs font-medium text-muted-foreground",
          "before:content-[counter(joinway-step)]"
        )}
      />
      <h3 className="mt-0.5 text-[0.9375rem] font-semibold tracking-tight">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </li>
  )
}
