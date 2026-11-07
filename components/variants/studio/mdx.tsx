import type * as React from "react"
import Link from "next/link"
import { AlertTriangle, ArrowUpRight, Info, Lightbulb, OctagonAlert } from "lucide-react"

import { mdxComponents } from "@/components/site/mdx-components"
import { cn } from "@/lib/utils"

import { sh } from "./href"
import { PreviewStage } from "./preview-frame"

/*
 * Studio's prose. The shared map supplies code blocks, package-manager tabs,
 * badges and keys; everything typographic is restyled here, and every
 * internal link is rewritten so it stays inside the variant.
 */

type Props<T extends keyof React.JSX.IntrinsicElements> = React.ComponentPropsWithoutRef<T>

function heading(level: 2 | 3 | 4) {
  const Tag = `h${level}` as const
  const styles = {
    2: "mt-14 mb-4 scroll-mt-28 text-[1.375rem] leading-tight font-semibold tracking-[-0.025em] first:mt-0",
    3: "mt-10 mb-3 scroll-mt-28 text-[1.0625rem] leading-snug font-semibold tracking-[-0.015em]",
    4: "mt-8 mb-2 scroll-mt-28 text-[15px] font-semibold tracking-[-0.01em]",
  }
  return function Heading({ className, ...props }: Props<"h2">) {
    return <Tag className={cn(styles[level], className)} {...props} />
  }
}

function Anchor({ href = "", className, ...props }: Props<"a">) {
  const style = cn(
    "font-medium text-foreground underline decoration-border-strong decoration-1 underline-offset-[5px]",
    "transition-[text-decoration-color] hover:decoration-foreground",
    className
  )
  if (href.startsWith("#")) return <a href={href} className={style} {...props} />
  if (href.startsWith("/")) return <Link href={sh(href)} className={style} {...props} />
  return <a href={href} target="_blank" rel="noreferrer noopener" className={style} {...props} />
}

const CALLOUT = {
  note: { icon: Info, label: "Note", tone: "text-muted-foreground", surface: "border-border bg-subtle" },
  tip: { icon: Lightbulb, label: "Tip", tone: "text-positive", surface: "border-border bg-subtle" },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    tone: "text-caution",
    surface: "border-[color-mix(in_oklab,var(--caution)_25%,transparent)] bg-caution-soft/60",
  },
  danger: {
    icon: OctagonAlert,
    label: "Careful",
    tone: "text-critical",
    surface: "border-[color-mix(in_oklab,var(--critical)_25%,transparent)] bg-critical-soft/60",
  },
} as const

function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: keyof typeof CALLOUT
  title?: string
  children: React.ReactNode
}) {
  const { icon: Icon, label, tone, surface } = CALLOUT[variant] ?? CALLOUT.note
  return (
    <aside className={cn("my-6 flex gap-3 rounded-lg border px-4 py-3.5", surface)}>
      <Icon aria-hidden="true" className={cn("mt-[3px] size-4 shrink-0", tone)} />
      <div className="min-w-0 flex-1 text-sm leading-relaxed text-[var(--st-prose)] [&_p]:my-0 [&_p]:text-sm [&_p]:leading-relaxed [&_p+p]:mt-2">
        <p className="mb-1 font-semibold text-foreground">{title ?? label}</p>
        {children}
      </div>
    </aside>
  )
}

function Steps({ children }: { children: React.ReactNode }) {
  return <div className="st-steps my-8 ml-3.5 border-l border-border">{children}</div>
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "st-step relative pb-10 pl-8 last:pb-2",
        "before:absolute before:top-0 before:-left-[13px] before:flex before:size-[26px] before:items-center before:justify-center",
        "before:rounded-full before:border before:border-border before:bg-background before:text-xs before:font-semibold before:text-foreground"
      )}
    >
      <p className="pt-0.5 text-[15px] font-semibold tracking-[-0.012em] text-foreground">{title}</p>
      <div className="mt-3 [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
    </div>
  )
}

function CardGroup({ children, columns = 2 }: { children: React.ReactNode; columns?: 2 | 3 }) {
  return (
    <div className={cn("my-6 grid gap-3", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      {children}
    </div>
  )
}

function Card({ title, href, children }: { title: string; href: string; children?: React.ReactNode }) {
  const body = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        />
      </span>
      {children ? <span className="text-[13.5px] leading-relaxed text-muted-foreground">{children}</span> : null}
    </>
  )
  const className = cn(
    "group flex flex-col gap-1.5 rounded-lg border border-border bg-background p-4 no-underline",
    "transition-colors duration-150 hover:border-border-hover hover:bg-subtle",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
  )
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
        {body}
      </a>
    )
  }
  return (
    <Link href={href.startsWith("/") ? sh(href) : href} className={className}>
      {body}
    </Link>
  )
}

function ComponentPreview({ slug, title }: { slug: string; title?: string }) {
  return <PreviewStage slug={slug} title={title ?? slug} minHeight="22rem" className="my-6" />
}

export const studioMdx = {
  ...mdxComponents,
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  p: ({ className, ...props }: Props<"p">) => (
    <p className={cn("my-5 text-[15px] leading-7 text-[var(--st-prose)]", className)} {...props} />
  ),
  a: Anchor,
  ul: ({ className, ...props }: Props<"ul">) => (
    <ul
      className={cn(
        "my-5 ml-5 flex list-disc flex-col gap-2 text-[15px] leading-7 text-[var(--st-prose)] marker:text-border-strong",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: Props<"ol">) => (
    <ol
      className={cn(
        "my-5 ml-5 flex list-decimal flex-col gap-2 text-[15px] leading-7 text-[var(--st-prose)] marker:text-muted-foreground",
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: Props<"li">) => (
    <li className={cn("pl-1 [&>ol]:my-2 [&>p]:my-0 [&>ul]:my-2", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: Props<"blockquote">) => (
    <blockquote
      className={cn("my-6 border-l-2 border-border-hover pl-5 text-[var(--st-prose)] italic [&>p]:my-0", className)}
      {...props}
    />
  ),
  hr: ({ className, ...props }: Props<"hr">) => <hr className={cn("my-12 border-border", className)} {...props} />,
  code: ({ className, ...props }: Props<"code">) => (
    <code
      className={cn(
        "rounded-md bg-muted px-[0.4em] py-[0.15em] text-[0.84em] font-medium text-foreground",
        className
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }: Props<"table">) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-border">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: Props<"th">) => (
    <th
      scope="col"
      className={cn("border-b border-border bg-subtle px-4 py-2.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  ),
  td: ({ className, ...props }: Props<"td">) => (
    <td
      className={cn("border-b border-border px-4 py-3 align-top text-[13.5px] leading-relaxed text-[var(--st-prose)]", className)}
      {...props}
    />
  ),
  tr: ({ className, ...props }: Props<"tr">) => (
    <tr className={cn("[&:last-child>td]:border-b-0", className)} {...props} />
  ),
  strong: ({ className, ...props }: Props<"strong">) => (
    <strong className={cn("font-semibold text-foreground", className)} {...props} />
  ),
  Callout,
  Steps,
  Step,
  CardGroup,
  Card,
  ComponentPreview,
}
