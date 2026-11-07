"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { RunCopy } from "./copy"

export function RunCodeShell({
  html,
  code,
  title,
  numbers,
  maxHeight,
  bare,
  className,
}: {
  html: string
  code: string
  title?: string
  numbers: boolean
  maxHeight?: number
  bare: boolean
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const lines = React.useMemo(() => code.trimEnd().split("\n").length, [code])
  const clips = maxHeight !== undefined && lines * 22 + 28 > maxHeight
  const clipped = clips && !open

  return (
    <figure className={cn("dark", bare ? "" : "run-code", className)}>
      {title || !bare ? (
        <figcaption className="run-code-head">
          <span className="min-w-0 flex-1 truncate font-mono text-[12px]">{title}</span>
          <span className="hidden text-[12px] tabular-nums sm:inline">
            {lines} {lines === 1 ? "line" : "lines"}
          </span>
          <RunCopy
            value={code}
            label="Copy code"
            variant="ghost"
            size="sm"
            iconOnly
            toastMessage={title ? `${title} copied` : "Code copied"}
          />
        </figcaption>
      ) : null}
      <div className="relative">
        <div
          className="run-code-body"
          data-numbers={numbers ? "" : undefined}
          style={clipped ? { maxHeight, overflowY: "hidden" } : undefined}
          // Highlighted on the server by Shiki, from source in this repository.
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {clipped ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b0b0c] to-transparent"
          />
        ) : null}
      </div>
      {clips ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex h-10 w-full cursor-pointer items-center justify-center text-[13px] text-[#8b8b90] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] transition-colors hover:bg-white/[0.03] hover:text-[#f5f5f7]"
        >
          {open ? "Collapse" : `Show all ${lines} lines`}
        </button>
      ) : null}
    </figure>
  )
}
