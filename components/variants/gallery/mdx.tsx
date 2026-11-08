import type * as React from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { mdxComponents } from "@/components/site/mdx-components"
import { g } from "@/components/variants/gallery/links"
import { cn } from "@/lib/utils"

/*
 * The shared MDX map, re-set for the gallery's dark reading column. Code
 * blocks, callouts, steps and install tabs are the shared components — they
 * pick the palette up from the tokens, so a listing in the docs is the same
 * object as a listing in the workbench. Links are rewritten into the variant.
 */

function heading(level: 2 | 3 | 4) {
  const Tag = `h${level}` as const
  const sizes = {
    2: "mt-14 mb-4 text-[1.375rem] font-semibold tracking-[-0.026em] leading-tight first:mt-0",
    3: "mt-9 mb-3 text-[1.0625rem] font-semibold tracking-[-0.018em]",
    4: "mt-7 mb-2 text-[0.9375rem] font-semibold",
  }
  return function Heading({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"h2">) {
    return (
      <Tag
        className={cn(
          sizes[level],
          "scroll-mt-[calc(var(--g-top)+1.5rem)] text-[var(--g-ink)]",
          className
        )}
        {...props}
      />
    )
  }
}

function Anchor({
  href = "",
  className,
  ...props
}: React.ComponentPropsWithoutRef<"a">) {
  const style = cn(
    "font-medium text-[var(--g-ink)] underline decoration-[var(--g-line-3)] decoration-1 underline-offset-4 transition-[text-decoration-color] hover:decoration-[var(--g-accent-ink)]",
    className
  )
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href.startsWith("/") ? g(href) : href} className={style} {...props} />
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={style}
      {...props}
    />
  )
}

function Card({
  title,
  href,
  children,
}: {
  title: string
  href: string
  children?: React.ReactNode
}) {
  const external = href.startsWith("http")
  const body = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="text-[0.875rem] font-medium text-[var(--g-ink)]">{title}</span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-3.5 shrink-0 text-[var(--g-ink-4)] transition-colors group-hover:text-[var(--g-accent-ink)]"
        />
      </span>
      {children ? (
        <span className="text-[0.8125rem] leading-relaxed text-[var(--g-ink-3)]">
          {children}
        </span>
      ) : null}
    </>
  )
  const style =
    "group flex flex-col gap-1.5 rounded-xl border border-[var(--g-line)] bg-[var(--g-panel)] p-4 transition-colors hover:border-[var(--g-line-3)] hover:bg-[var(--g-panel-2)]"
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={style}>
        {body}
      </a>
    )
  }
  return (
    <Link href={href.startsWith("/") ? g(href) : href} className={style}>
      {body}
    </Link>
  )
}

export const galleryMdx = {
  ...mdxComponents,
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  a: Anchor,
  Card,
  p: ({ className, ...props }: React.ComponentPropsWithoutRef<"p">) => (
    <p
      className={cn(
        "my-4 text-[0.9375rem] leading-[1.75] text-[var(--g-ink-2)]",
        className
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.ComponentPropsWithoutRef<"ul">) => (
    <ul
      className={cn(
        "my-4 flex list-disc flex-col gap-2 pl-5 text-[0.9375rem] text-[var(--g-ink-2)] marker:text-[var(--g-ink-4)]",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.ComponentPropsWithoutRef<"ol">) => (
    <ol
      className={cn(
        "my-4 flex list-decimal flex-col gap-2 pl-5 text-[0.9375rem] text-[var(--g-ink-2)] marker:text-[var(--g-ink-4)]",
        className
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.ComponentPropsWithoutRef<"code">) => (
    <code
      className={cn(
        "rounded-[0.3rem] border border-[var(--g-line-2)] bg-[var(--g-panel-2)] px-[0.35em] py-[0.1em] font-mono text-[0.84em] text-[#e4e4e7]",
        className
      )}
      {...props}
    />
  ),
  blockquote: ({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className={cn(
        "my-5 border-l-2 border-[var(--g-accent)] pl-4 text-[var(--g-ink-2)] [&>p]:my-2",
        className
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }: React.ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-[var(--g-line)]">
      <table
        className={cn("w-full border-collapse text-left text-[0.8125rem]", className)}
        {...props}
      />
    </div>
  ),
  th: ({ className, ...props }: React.ComponentPropsWithoutRef<"th">) => (
    <th
      scope="col"
      className={cn(
        "border-b border-[var(--g-line)] bg-[var(--g-panel-2)] px-4 py-2.5 text-[0.75rem] font-medium text-[var(--g-ink-3)]",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.ComponentPropsWithoutRef<"td">) => (
    <td
      className={cn(
        "border-b border-[var(--g-line)] px-4 py-2.5 align-top text-[var(--g-ink-2)] [tr:last-child>&]:border-b-0",
        className
      )}
      {...props}
    />
  ),
}
