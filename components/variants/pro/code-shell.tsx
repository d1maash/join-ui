"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

import { CopyIcon } from "./copy"

/*
 * A code panel on the Pro stage: a near-black slab with a hairline, a quiet
 * title bar, and a listing that can fold to a fixed height with a fade.
 */
export function ProCodeShell({
  html,
  code,
  title,
  language,
  collapsible = false,
  collapsedHeight = 380,
  showLineNumbers = false,
  bare = false,
  className,
}: {
  html: string
  code: string
  title?: string
  language?: string
  collapsible?: boolean
  collapsedHeight?: number
  showLineNumbers?: boolean
  /** No title bar — the copy button floats in the corner instead. */
  bare?: boolean
  className?: string
}) {
  const [expanded, setExpanded] = React.useState(false)
  const lineCount = React.useMemo(() => code.trimEnd().split("\n").length, [code])
  const collapses = collapsible && lineCount > 18
  const clipped = collapses && !expanded

  return (
    <figure
      className={cn(
        "pro-code relative overflow-hidden rounded-[18px] bg-[#111112] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]",
        className
      )}
    >
      {bare ? (
        <div className="absolute top-2.5 right-2.5 z-10">
          <CopyIcon value={code} label="Copy code" toastMessage="Code copied" />
        </div>
      ) : (
        <figcaption className="flex h-12 items-center gap-3 border-b border-white/[0.07] pr-2 pl-5">
          <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-[#a1a1a6]">
            {title ?? language ?? "code"}
          </span>
          <span className="hidden text-[12px] text-[#86868b] sm:inline">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
          <CopyIcon value={code} label="Copy code" toastMessage="Code copied" />
        </figcaption>
      )}

      <div
        className={cn(
          "overflow-x-auto py-4 font-mono text-[13px] leading-[1.75]",
          bare && "pr-12",
          clipped && "pro-code-clip"
        )}
        style={clipped ? { maxHeight: collapsedHeight, overflowY: "hidden" } : undefined}
        data-line-numbers={showLineNumbers ? "" : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {collapses ? (
        <div className="flex justify-center border-t border-white/[0.07] py-2.5">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[14px] text-[#2997ff]",
              "transition-colors hover:bg-white/[0.06]",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2997ff]"
            )}
          >
            {expanded ? "Show less" : `Show all ${lineCount} lines`}
            <ChevronDown
              aria-hidden="true"
              className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
            />
          </button>
        </div>
      ) : null}
    </figure>
  )
}
