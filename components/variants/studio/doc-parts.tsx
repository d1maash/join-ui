import type * as React from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ChevronRight, CircleDot, ExternalLink, Pencil } from "lucide-react"

import { CopyButton } from "@/components/site/copy-button"
import { cn } from "@/lib/utils"

export interface Crumb {
  label: string
  href?: string
}

export interface Sibling {
  title: string
  href: string
}

function ArrowLink({ sibling, direction }: { sibling?: Sibling; direction: "previous" | "next" }) {
  const Icon = direction === "previous" ? ArrowLeft : ArrowRight
  const className = cn(
    "flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
  )
  if (!sibling) {
    return (
      <span aria-hidden="true" className={cn(className, "opacity-40")}>
        <Icon className="size-3.5" />
      </span>
    )
  }
  return (
    <Link
      href={sibling.href}
      aria-label={`${direction === "previous" ? "Previous" : "Next"}: ${sibling.title}`}
      title={sibling.title}
      className={cn(className, "hover:bg-muted hover:text-foreground")}
    >
      <Icon aria-hidden="true" className="size-3.5" />
    </Link>
  )
}

/**
 * Title block shared by component pages and guides: crumbs, the title with
 * Copy page and the previous/next arrows beside it, the standfirst, and an
 * optional row underneath for badges or actions.
 */
export function DocHeader({
  crumbs,
  title,
  description,
  markdown,
  previous,
  next,
  children,
}: {
  crumbs: Crumb[]
  title: string
  description: string
  markdown: string
  previous?: Sibling
  next?: Sibling
  children?: React.ReactNode
}) {
  return (
    <header className="flex flex-col gap-3">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
          {crumbs.map((crumb, index) => (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? <ChevronRight aria-hidden="true" className="size-3.5" /> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="transition-colors hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-foreground">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <h1 className="text-[clamp(1.875rem,3vw,2.25rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <div className="flex items-center gap-1.5 pt-1">
          <CopyButton
            value={markdown}
            label="Copy page"
            copiedLabel="Copied"
            toastMessage="Page copied as Markdown"
            variant="secondary"
            size="sm"
            showLabel
            className="h-8 shadow-none"
          />
          <ArrowLink sibling={previous} direction="previous" />
          <ArrowLink sibling={next} direction="next" />
        </div>
      </div>
      <p className="max-w-[44rem] text-base leading-relaxed text-pretty text-muted-foreground">
        {description}
      </p>
      {children}
    </header>
  )
}

/** A numbered region of a component page, anchored for the contents rail. */
export function DocSection({
  id,
  title,
  description,
  children,
  className,
}: {
  id: string
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section aria-labelledby={id} className={cn("mt-14 scroll-mt-28", className)}>
      <h2 id={id} className="text-[1.375rem] leading-tight font-semibold tracking-[-0.025em]">
        <a href={`#${id}`} className="group/anchor inline-flex items-center gap-2 outline-none focus-visible:underline">
          {title}
          <span aria-hidden="true" className="text-border-strong opacity-0 transition-opacity group-hover/anchor:opacity-100">
            #
          </span>
        </a>
      </h2>
      {description ? (
        <p className="mt-2 max-w-[44rem] text-[15px] leading-relaxed text-pretty text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function SubHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-28 text-[15px] font-semibold tracking-[-0.012em]">
      {children}
    </h3>
  )
}

/** The two cards at the foot of a page. */
export function PrevNext({ previous, next }: { previous?: Sibling; next?: Sibling }) {
  if (!previous && !next) return null
  return (
    <nav aria-label="Previous and next" className="mt-16 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
      {previous ? (
        <Link
          href={previous.href}
          className="group flex flex-col gap-1 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeft aria-hidden="true" className="size-3 transition-transform group-hover:-translate-x-0.5" />
            Previous
          </span>
          <span className="text-sm font-medium">{previous.title}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col items-end gap-1 rounded-lg border border-border px-4 py-3 text-right transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Next
            <ArrowRight aria-hidden="true" className="size-3 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="text-sm font-medium">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  )
}

/** "Edit on GitHub / Report an issue", under the contents rail. */
export function ContributeLinks({ editUrl, issueUrl, sourceUrl }: { editUrl: string; issueUrl: string; sourceUrl?: string }) {
  const links = [
    { href: editUrl, label: "Edit on GitHub", icon: Pencil },
    { href: issueUrl, label: "Report an issue", icon: CircleDot },
    ...(sourceUrl ? [{ href: sourceUrl, label: "View source", icon: ExternalLink }] : []),
  ]
  return (
    <div>
      <p className="mb-3 text-[13px] font-medium">Contribute</p>
      <ul className="flex flex-col gap-2">
        {links.map(({ href, label, icon: Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon aria-hidden="true" className="size-3.5" />
              {label}
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
