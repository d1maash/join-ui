import Link from "next/link"
import { Maximize2 } from "lucide-react"

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
 * The stage used to carry a light/dark switch that re-declared the tokens on
 * this subtree only. The site is dark throughout now, so the switch is gone
 * along with the last white surface on the page — but the mechanism it relied
 * on has not changed, and it is still why no registry component may use a
 * `dark:` utility: components get installed into light projects, and they have
 * to theme purely through custom properties to survive that.
 *
 * With no state left to hold, this is a Server Component.
 */
export function ComponentPreview({
  slug,
  title,
  fullPreviewLink = true,
  minHeight = "22rem",
  className,
}: ComponentPreviewProps) {
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

        {fullPreviewLink ? (
          <Link
            href={`/preview/${slug}`}
            aria-label="Open the full-page preview"
            className={cn(
              "flex size-7 items-center justify-center rounded-md text-muted-foreground",
              "transition-colors hover:bg-muted hover:text-foreground",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            )}
          >
            <Maximize2 aria-hidden="true" className="size-3.5" />
          </Link>
        ) : null}
      </div>

      <div
        className="flex flex-1 items-center justify-center bg-background p-6 text-foreground"
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
