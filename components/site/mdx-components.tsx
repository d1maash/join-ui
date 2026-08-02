import * as React from "react"
import Link from "next/link"

import { Callout } from "@/components/site/callout"
import { CardGroup, DocsCard } from "@/components/site/card-group"
import { CodeBlock } from "@/components/site/code-block"
import { ComponentPreview } from "@/components/site/component-preview"
import { PackageManagerTabs } from "@/components/site/package-manager-tabs"
import { Step, Steps } from "@/components/site/steps"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"
import { dependencyCommands, shadcnCommands } from "@/lib/commands"
import { parseCodeMeta } from "@/lib/highlight"
import { cn } from "@/lib/utils"

type HeadingProps = React.ComponentPropsWithoutRef<"h2">

function heading(level: 1 | 2 | 3 | 4) {
  const Tag = `h${level}` as const
  const sizes = {
    1: "mt-0 mb-4 text-3xl font-semibold tracking-tight",
    2: "mt-12 mb-4 scroll-mt-24 border-t border-border pt-6 text-xl font-semibold tracking-tight first:mt-0 first:border-0 first:pt-0",
    3: "mt-8 mb-2 scroll-mt-24 text-base font-semibold tracking-tight",
    4: "mt-6 mb-2 scroll-mt-24 text-[0.9375rem] font-semibold tracking-tight",
  }

  return function Heading({ className, ...props }: HeadingProps) {
    return <Tag className={cn(sizes[level], className)} {...props} />
  }
}

interface CodeElementProps {
  className?: string
  "data-meta"?: string
  children?: React.ReactNode
}

function isCodeElement(
  node: React.ReactNode
): node is React.ReactElement<CodeElementProps> {
  return React.isValidElement<CodeElementProps>(node)
}

/**
 * Fenced code blocks.
 *
 * MDX hands us `<pre><code className="language-tsx" data-meta="…">`; this pulls
 * the raw text and meta back out and defers to the server-side `CodeBlock`, so
 * MDX code and hand-authored code render identically.
 */
function Pre({ children }: React.ComponentPropsWithoutRef<"pre">) {
  if (!isCodeElement(children)) return null

  const { className, children: content } = children.props
  const meta = children.props["data-meta"]
  const code = typeof content === "string" ? content : ""
  const language = /language-([\w-]+)/.exec(className ?? "")?.[1] ?? "text"
  const { title, highlightLines, showLineNumbers } = parseCodeMeta(meta)

  return (
    <div className="my-5">
      <CodeBlock
        code={code}
        language={language}
        title={title}
        highlightLines={highlightLines}
        showLineNumbers={showLineNumbers}
      />
    </div>
  )
}

/** `<InstallTabs target="@joinway/magnetic-button" />` inside MDX. */
function InstallTabs({ target, label }: { target: string; label?: string }) {
  return (
    <PackageManagerTabs
      commands={shadcnCommands(target)}
      label={label}
      className="my-5"
    />
  )
}

/** `<DependencyTabs packages="motion clsx" />` inside MDX. */
function DependencyTabs({ packages }: { packages: string }) {
  return (
    <PackageManagerTabs
      commands={dependencyCommands(packages.split(/\s+/).filter(Boolean))}
      className="my-5"
    />
  )
}

/**
 * Component map handed to `MDXRemote`.
 *
 * Everything here is a Server Component except the interactive pieces
 * (previews, tab switchers), which keeps MDX pages almost entirely static.
 */
export const mdxComponents = {
  h1: heading(1),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),

  p: ({ className, ...props }: React.ComponentPropsWithoutRef<"p">) => (
    <p
      className={cn("my-4 leading-[1.75] text-muted-foreground", className)}
      {...props}
    />
  ),

  a: ({ href = "", className, ...props }: React.ComponentPropsWithoutRef<"a">) => {
    const internal = href.startsWith("/") || href.startsWith("#")
    const style = cn(
      "font-medium text-foreground underline decoration-1 underline-offset-4 transition-[text-decoration-thickness]",
      "hover:decoration-2",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      className
    )
    if (internal) return <Link href={href} className={style} {...props} />
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={style}
        {...props}
      />
    )
  },

  ul: ({ className, ...props }: React.ComponentPropsWithoutRef<"ul">) => (
    <ul
      className={cn(
        "my-4 flex list-disc flex-col gap-2 pl-5 text-muted-foreground marker:text-border-strong",
        className
      )}
      {...props}
    />
  ),

  ol: ({ className, ...props }: React.ComponentPropsWithoutRef<"ol">) => (
    <ol
      className={cn(
        "my-4 flex list-decimal flex-col gap-2 pl-5 text-muted-foreground marker:font-mono marker:text-muted-foreground",
        className
      )}
      {...props}
    />
  ),

  li: ({ className, ...props }: React.ComponentPropsWithoutRef<"li">) => (
    <li className={cn("leading-[1.75] [&>ul]:my-2", className)} {...props} />
  ),

  blockquote: ({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className={cn(
        "my-5 border-l-2 border-foreground pl-4 text-muted-foreground italic",
        className
      )}
      {...props}
    />
  ),

  hr: ({ className, ...props }: React.ComponentPropsWithoutRef<"hr">) => (
    <hr className={cn("my-10 border-border", className)} {...props} />
  ),

  code: ({ className, ...props }: React.ComponentPropsWithoutRef<"code">) => (
    <code
      className={cn(
        "border border-border bg-muted px-[0.3em] py-[0.15em] font-mono text-[0.85em] text-foreground",
        className
      )}
      {...props}
    />
  ),

  pre: Pre,

  table: ({ className, ...props }: React.ComponentPropsWithoutRef<"table">) => (
    <div className="my-5 overflow-x-auto border border-border">
      <table
        className={cn("w-full border-collapse text-left text-sm", className)}
        {...props}
      />
    </div>
  ),

  th: ({ className, ...props }: React.ComponentPropsWithoutRef<"th">) => (
    <th
      scope="col"
      className={cn(
        "label-caps border-b border-border px-4 py-2.5 text-muted-foreground",
        className
      )}
      {...props}
    />
  ),

  td: ({ className, ...props }: React.ComponentPropsWithoutRef<"td">) => (
    <td
      className={cn(
        "border-b border-border px-4 py-2.5 align-top text-muted-foreground",
        className
      )}
      {...props}
    />
  ),

  strong: ({ className, ...props }: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className={cn("font-semibold text-foreground", className)} {...props} />
  ),

  // Custom blocks available inside MDX.
  Callout,
  Steps,
  Step,
  CardGroup,
  Card: DocsCard,
  Badge,
  Kbd,
  CodeBlock,
  ComponentPreview,
  PackageManagerTabs,
  InstallTabs,
  DependencyTabs,
}
