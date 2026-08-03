"use client"

import * as React from "react"
import Link from "next/link"
import { Maximize2, Moon, Sun } from "lucide-react"

import { renderPreview } from "@/components/previews/registry"
import { cn } from "@/lib/utils"

export interface ComponentPreviewProps {
  slug: string
  title?: string
  /** Hidden on the standalone preview route, where it would link to itself. */
  fullPreviewLink?: boolean
  minHeight?: string
  className?: string
}

/**
 * Live demo frame.
 *
 * The stage is a theme island: forcing `.light` or `.dark` on the wrapper
 * re-declares the design tokens for that subtree only, so a demo can be
 * inspected in the opposite theme without navigating away. This works because
 * no registry component uses a `dark:` utility.
 */
export function ComponentPreview({
  slug,
  title,
  fullPreviewLink = true,
  minHeight = "22rem",
  className,
}: ComponentPreviewProps) {
  const [forced, setForced] = React.useState<"light" | "dark" | null>(null)
  const demo = renderPreview(slug)

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border shadow-xs",
        className
      )}
    >
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border bg-card/40 px-3">
        <span className="label-caps min-w-0 flex-1 truncate text-muted-foreground">
          {title ?? slug}
        </span>

        <div className="flex items-center gap-0.5">
          <PreviewToggle
            active={forced === "light"}
            label="Preview in the light theme"
            onClick={() => setForced((current) => (current === "light" ? null : "light"))}
          >
            <Sun aria-hidden="true" className="size-3.5" />
          </PreviewToggle>
          <PreviewToggle
            active={forced === "dark"}
            label="Preview in the dark theme"
            onClick={() => setForced((current) => (current === "dark" ? null : "dark"))}
          >
            <Moon aria-hidden="true" className="size-3.5" />
          </PreviewToggle>

          {fullPreviewLink ? (
            <Link
              href={`/preview/${slug}`}
              aria-label="Open the full-page preview"
              className={cn(
                "flex size-7 items-center justify-center rounded-md border border-transparent text-muted-foreground",
                "transition-colors hover:bg-muted hover:text-foreground",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              )}
            >
              <Maximize2 aria-hidden="true" className="size-3.5" />
            </Link>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 items-center justify-center bg-background p-6 text-foreground",
          forced
        )}
        style={{ minHeight }}
      >
        {demo ?? (
          <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
            No demo is registered for{" "}
            <code className="font-mono text-foreground">{slug}</code> yet. Add one to{" "}
            <code className="font-mono text-foreground">components/previews/registry.tsx</code>
            .
          </p>
        )}
      </div>
    </div>
  )
}

function PreviewToggle({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        "flex size-7 cursor-pointer items-center justify-center rounded-md border transition-colors",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        active
          ? "border-accent-border bg-accent-soft text-accent"
          : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
