"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { CopyButton } from "@/components/docs/copy-button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CodeBlockShellProps {
  code: string
  title?: string
  language?: string
  copy?: boolean
  collapsible?: boolean
  collapsedHeight?: number
  className?: string
  children: React.ReactNode
}

/**
 * Chrome around a highlighted code block: filename bar, copy control and the
 * optional expand/collapse affordance.
 *
 * Split from `CodeBlock` so the highlighting itself stays on the server — this
 * is the only part that needs to be a Client Component.
 */
export function CodeBlockShell({
  code,
  title,
  language,
  copy = true,
  collapsible = false,
  collapsedHeight = 420,
  className,
  children,
}: CodeBlockShellProps) {
  const [expanded, setExpanded] = React.useState(false)
  const regionId = React.useId()

  return (
    <figure
      className={cn(
        "group relative my-4 overflow-hidden rounded-xl border border-border bg-code-bg",
        className
      )}
    >
      {title ? (
        <figcaption className="flex items-center justify-between gap-2 border-b border-border bg-muted/50 py-1.5 pl-4 pr-1.5">
          <span className="truncate font-mono text-xs text-muted-foreground">
            {title}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            {language ? (
              <span className="hidden font-mono text-[0.6875rem] uppercase text-muted-foreground/70 sm:inline">
                {language}
              </span>
            ) : null}
            {copy ? <CopyButton value={code} label="Copy code" /> : null}
          </div>
        </figcaption>
      ) : copy ? (
        <div className="absolute right-1.5 top-1.5 z-10 opacity-0 transition-opacity duration-[var(--duration-fast)] focus-within:opacity-100 group-hover:opacity-100">
          <CopyButton
            value={code}
            label="Copy code"
            className="bg-card/80 backdrop-blur-sm"
          />
        </div>
      ) : null}

      <div
        id={regionId}
        style={
          collapsible && !expanded
            ? { maxHeight: collapsedHeight, overflow: "hidden" }
            : undefined
        }
        className="relative"
      >
        {children}

        {collapsible && !expanded ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-code-bg to-transparent"
          />
        ) : null}
      </div>

      {collapsible ? (
        <div className="flex justify-center border-t border-border bg-muted/40 p-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={expanded}
            aria-controls={regionId}
            onClick={() => setExpanded((value) => !value)}
          >
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "transition-transform duration-[var(--duration-base)]",
                expanded && "rotate-180"
              )}
            />
            {expanded ? "Collapse code" : "Expand code"}
          </Button>
        </div>
      ) : null}
    </figure>
  )
}
