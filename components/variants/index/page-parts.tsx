import type * as React from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

/** Renders `backticked` spans of a metadata sentence as inline code. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g)
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={index}
            className="rounded-[3px] border border-[var(--ix-line)] bg-[var(--ix-raise)] px-[0.35em] py-[0.1em] text-[0.84em] text-[var(--ix-fg)]"
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

/** One reference section of a page: a numbered head and its body. */
export function IxSection({
  id,
  index,
  title,
  aside,
  children,
  className,
}: {
  id: string
  index: number
  title: string
  aside?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section aria-labelledby={id} className={cn("ix-rule-b px-5 py-9 md:px-8 md:py-10", className)}>
      <div className="mb-5 flex items-baseline gap-3">
        <span className="ix-mono ix-fg-3 w-6 shrink-0">{String(index).padStart(2, "0")}</span>
        <h2 id={id} className="scroll-mt-20 text-[1.25rem] font-semibold tracking-[-0.025em]">
          {title}
        </h2>
        {aside ? <div className="ix-mono ix-fg-3 ml-auto truncate">{aside}</div> : null}
      </div>
      <div className="md:pl-9">{children}</div>
    </section>
  )
}

export interface IxPagerLink {
  title: string
  href: string
  code?: string
}

/** Previous / next as two boxed cells that share a rule. */
export function IxPager({
  previous,
  next,
  label,
}: {
  previous?: IxPagerLink
  next?: IxPagerLink
  label: string
}) {
  if (!previous && !next) return null
  return (
    <nav aria-label={label} className="grid sm:grid-cols-2">
      {previous ? (
        <Link
          href={previous.href}
          className="group flex flex-col gap-1.5 border-b border-[var(--ix-line)] px-5 py-5 transition-colors hover:bg-white/[0.02] sm:border-r sm:border-b-0 md:px-8"
        >
          <span className="ix-mono ix-fg-3 flex items-center gap-1.5">
            <ArrowLeft aria-hidden="true" className="size-3 transition-transform group-hover:-translate-x-0.5" />
            Previous
          </span>
          <span className="text-[0.9375rem] font-medium">
            {previous.code ? <span className="ix-mono ix-accent mr-2.5 text-[0.8125rem]">{previous.code}</span> : null}
            {previous.title}
          </span>
        </Link>
      ) : (
        <span className="hidden border-r border-[var(--ix-line)] sm:block" />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col items-end gap-1.5 px-5 py-5 text-right transition-colors hover:bg-white/[0.02] md:px-8"
        >
          <span className="ix-mono ix-fg-3 flex items-center gap-1.5">
            Next
            <ArrowRight aria-hidden="true" className="size-3 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="text-[0.9375rem] font-medium">
            {next.code ? <span className="ix-mono ix-accent mr-2.5 text-[0.8125rem]">{next.code}</span> : null}
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  )
}

/** Mono breadcrumb trail. */
export function IxCrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="ix-mono ix-fg-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-[var(--ix-fg)]">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-[var(--ix-fg-2)]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
