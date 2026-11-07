"use client"

import * as React from "react"
import Link from "next/link"
import { RotateCcw } from "lucide-react"

import { variantHref } from "@/lib/variants"
import { cn } from "@/lib/utils"

import { IxBadgeTag } from "./badge"
import { IxInstallCopy, IxPromptButton } from "./copy"
import type { IxItem } from "./data"
import { LazyThumb } from "./lazy-thumb"

/**
 * The unit the whole variant is built from: one component, live, in a cell.
 *
 * Meta row (code · hint), a fixed-aspect stage running the miniature, and a
 * foot with the name, what it installs, and the two things a reader most
 * often wants without opening the page — the agent prompt and the install
 * command. The title's link covers the cell, so the whole cell opens the
 * component page while the buttons stay buttons.
 */
export function IxCell({
  item,
  size = "md",
  replay = false,
  headingLevel = 3,
  className,
}: {
  item: Pick<IxItem, "slug" | "title" | "code" | "hint" | "badge" | "deps">
  size?: "md" | "lg"
  /** Shows a Replay control that restarts the miniature. */
  replay?: boolean
  headingLevel?: 2 | 3
  className?: string
}) {
  const [take, setTake] = React.useState(0)
  const href = variantHref("index", `/components/${item.slug}`)
  const Heading = headingLevel === 2 ? "h2" : "h3"

  return (
    <article className={cn("ix-cell group", className)}>
      <div className="ix-cell-meta">
        <span className="ix-mono ix-accent">{item.code}</span>
        <span className="flex min-w-0 items-center gap-3">
          <span className="ix-mono ix-fg-3 truncate">{item.hint}</span>
          {replay ? (
            <button
              type="button"
              onClick={() => setTake((value) => value + 1)}
              className="ix-above ix-mono ix-fg-2 -mr-1.5 inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-[4px] px-1.5 transition-colors hover:text-[var(--ix-fg)]"
            >
              Replay
              <RotateCcw aria-hidden="true" className="size-3" />
            </button>
          ) : null}
        </span>
      </div>

      <div className={cn("ix-stage", size === "lg" && "min-h-[22rem] flex-1 lg:aspect-auto")}>
        <LazyThumb slug={item.slug} code={item.code} replayKey={take} />
      </div>

      <div className="flex items-end justify-between gap-3 px-4 pt-3 pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Heading
              className={cn(
                "truncate font-medium tracking-[-0.01em]",
                size === "lg" ? "text-[1.0625rem]" : "text-[0.9375rem]"
              )}
            >
              <Link href={href} className="ix-overlay">
                {item.title}
              </Link>
            </Heading>
            {item.badge ? <IxBadgeTag badge={item.badge} /> : null}
          </div>
          <p className="ix-mono ix-fg-3 mt-1 truncate">
            {item.deps.length > 0 ? item.deps.join(", ") : "no extra packages"}
          </p>
        </div>
        <div className="ix-above flex shrink-0 items-center gap-1.5">
          <IxPromptButton slug={item.slug} title={item.title} />
          <IxInstallCopy slug={item.slug} />
        </div>
      </div>
    </article>
  )
}
