import type * as React from "react"

import { cn } from "@/lib/utils"

/*
 * Small typographic parts shared by the plate pages: inline code lifted out
 * of the registry's prose, keycaps, and the numbered section head a manual
 * uses for its chapters.
 */

/** Renders `backticked` spans of registry prose as code. */
export function Prose({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g)
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={index}
            className="sp-mono rounded-[2px] bg-[rgb(17_17_17/0.06)] px-1 py-px text-[0.82em] text-[var(--sp-ink)]"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  )
}

export function Keycap({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return <kbd className={cn("sp-keycap", small && "sp-keycap--sm")}>{children}</kbd>
}

/**
 * A chapter of the datasheet: a rule in ink, the section number in mono,
 * the title set large, and the body on the grid below.
 */
export function SheetSection({
  id,
  n,
  title,
  aside,
  running,
  children,
  className,
}: {
  id: string
  n: string
  title: string
  aside?: React.ReactNode
  running?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      data-running={running ?? title}
      className={cn("scroll-mt-20 border-t border-[var(--sp-ink)] pt-4", className)}
    >
      <div className="flex items-baseline justify-between gap-6">
        <p className="sp-label !text-[var(--sp-ink)]">§ {n}</p>
        {aside ? <div className="sp-label text-right">{aside}</div> : null}
      </div>
      <h2
        id={`${id}-title`}
        className="mt-6 text-[clamp(30px,3.4vw,44px)] leading-[1.02] font-semibold tracking-[-0.03em]"
      >
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </section>
  )
}
