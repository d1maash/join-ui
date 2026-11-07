"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

import { AirCopy } from "./copy"

export function AirCodeShell({
  html,
  code,
  title,
  language,
  collapsible = false,
  collapsedHeight = 360,
  showLineNumbers = false,
  tone = "band",
  className,
}: {
  html: string
  code: string
  title?: string
  language?: string
  collapsible?: boolean
  collapsedHeight?: number
  showLineNumbers?: boolean
  tone?: "white" | "band"
  className?: string
}) {
  const [expanded, setExpanded] = React.useState(false)
  const lines = React.useMemo(() => code.trimEnd().split("\n").length, [code])
  const collapses = collapsible && lines > 18
  const clipped = collapses && !expanded

  return (
    <figure
      className={cn(
        "relative min-w-0 overflow-hidden rounded-[18px]",
        tone === "white"
          ? "bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.04),0_2px_8px_rgb(0_0_0/0.04)]"
          : "bg-[#fbfbfd] shadow-[inset_0_0_0_1px_#e8e8ed]",
        className
      )}
    >
      <figcaption className="flex h-11 items-center gap-3 border-b border-[#e8e8ed] pr-2 pl-5">
        <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[#6e6e73]">
          {title ?? language ?? "code"}
        </span>
        <AirCopy value={code} label="Copy code" copiedLabel="Copied" iconOnly />
      </figcaption>

      <div className="relative">
        <div
          className="overflow-x-auto py-4 font-mono text-[13px] leading-[1.65]"
          style={clipped ? { maxHeight: collapsedHeight, overflowY: "hidden" } : undefined}
          data-air-numbers={showLineNumbers ? "" : undefined}
          // Highlighted on the server by Shiki, from source in this repository.
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {clipped ? (
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent",
              tone === "white" ? "to-white" : "to-[#fbfbfd]"
            )}
          />
        ) : null}
      </div>

      {collapses ? (
        <div className="flex justify-center pt-1 pb-4">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[14px] text-[#0066cc] hover:underline focus-visible:outline-2 focus-visible:outline-[#0071e3]"
          >
            {expanded ? "Show less" : `Show all ${lines} lines`}
            <ChevronDown
              aria-hidden="true"
              strokeWidth={2.4}
              className={cn("size-3.5 transition-transform duration-300", expanded && "rotate-180")}
            />
          </button>
        </div>
      ) : null}
    </figure>
  )
}
