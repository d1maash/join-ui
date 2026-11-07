"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { IxCopyButton } from "./copy"

const LINE = 22.1 // 0.8125rem × 1.7

export function IxCodeShell({
  html,
  code,
  title,
  language,
  lineNumbers,
  collapsible,
  collapsedLines,
  bare,
  className,
}: {
  html: string
  code: string
  title?: string
  language?: string
  lineNumbers: boolean
  collapsible: boolean
  collapsedLines: number
  bare: boolean
  className?: string
}) {
  const [expanded, setExpanded] = React.useState(false)
  const lines = React.useMemo(() => code.trimEnd().split("\n").length, [code])
  const collapses = collapsible && lines > collapsedLines + 4
  const clipped = collapses && !expanded

  return (
    <figure className={cn(bare ? "min-w-0 bg-[var(--ix-cell)]" : "ix-codebox", className)}>
      <figcaption className="ix-codebar">
        <span className="ix-mono min-w-0 flex-1 truncate text-[var(--ix-fg-2)]">
          {title ?? language ?? "code"}
        </span>
        <span className="ix-mono ix-fg-3 hidden sm:inline">
          {language ? `${language} · ` : ""}
          {lines} {lines === 1 ? "line" : "lines"}
        </span>
        <IxCopyButton value={code} label="Copy code" copiedLabel="Copied" hideLabel />
      </figcaption>
      <div className="relative">
        <div
          className="ix-code"
          data-ln={lineNumbers ? "" : undefined}
          style={clipped ? { maxHeight: collapsedLines * LINE + 14, overflowY: "hidden" } : undefined}
          // Highlighted on the server by Shiki, from source in this repository.
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {clipped ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--ix-cell)] to-transparent"
          />
        ) : null}
      </div>
      {collapses ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="ix-mono flex h-9 w-full cursor-pointer items-center justify-center gap-2 border-t border-[var(--ix-line)] text-[var(--ix-fg-2)] transition-colors hover:bg-white/[0.02] hover:text-[var(--ix-fg)]"
        >
          {expanded ? "Collapse" : `Show all ${lines} lines`}
        </button>
      ) : null}
    </figure>
  )
}
