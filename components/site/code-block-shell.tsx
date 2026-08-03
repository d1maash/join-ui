"use client"

import * as React from "react"

import { CopyButton } from "@/components/site/copy-button"
import { cn } from "@/lib/utils"

export interface CodeBlockShellProps {
  /** Pre-highlighted markup from `highlightCode`. */
  html: string
  code: string
  title?: string
  language?: string
  collapsible?: boolean
  collapsedHeight?: number
  showLineNumbers?: boolean
  className?: string
}

/**
 * Chrome around a highlighted listing.
 *
 * Long blocks clip to `collapsedHeight` behind a rule and an explicit
 * "Show all lines" control — deliberately not a soft fade, which would need a
 * gradient and would hide exactly how much is left.
 */
export function CodeBlockShell({
  html,
  code,
  title,
  language,
  collapsible = false,
  collapsedHeight = 360,
  showLineNumbers = false,
  className,
}: CodeBlockShellProps) {
  const [expanded, setExpanded] = React.useState(false)
  const lineCount = React.useMemo(() => code.trimEnd().split("\n").length, [code])

  // Collapsing a block that already fits would add a control for nothing.
  const collapses = collapsible && lineCount > 16
  const clipped = collapses && !expanded

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-code-bg shadow-xs",
        className
      )}
    >
      <figcaption className="flex h-9 items-center gap-3 border-b border-border bg-card/40 px-3">
        <span className="label-micro min-w-0 flex-1 truncate text-muted-foreground">
          {title ?? language ?? "code"}
        </span>
        <span className="label-micro hidden text-muted-foreground sm:inline">
          {lineCount} {lineCount === 1 ? "line" : "lines"}
        </span>
        <CopyButton
          value={code}
          label="Copy code"
          copiedLabel="Copied"
          className="-mr-1.5"
        />
      </figcaption>

      <div
        className="overflow-x-auto py-3 font-mono text-[0.8125rem] leading-[1.7]"
        style={clipped ? { maxHeight: collapsedHeight, overflowY: "hidden" } : undefined}
        // Highlighted server-side by Shiki from source we control.
        dangerouslySetInnerHTML={{ __html: html }}
        data-line-numbers={showLineNumbers ? "" : undefined}
      />

      {collapses ? (
        <button
          type="button"
          onClick={() => setExpanded((previous) => !previous)}
          aria-expanded={expanded}
          className={cn(
            "label-micro flex w-full cursor-pointer items-center justify-center gap-2 border-t border-border py-2.5",
            "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          )}
        >
          {expanded ? "Collapse" : `Show all ${lineCount} lines`}
        </button>
      ) : null}
    </figure>
  )
}
