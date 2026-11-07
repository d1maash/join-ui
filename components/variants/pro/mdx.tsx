import * as React from "react"
import Link from "next/link"
import { AlertTriangle, ArrowUpRight, Ban, CheckCircle2, Info } from "lucide-react"

import { mdxComponents } from "@/components/site/mdx-components"
import { dependencyCommands, shadcnCommands, type CommandSet } from "@/lib/commands"
import { parseCodeMeta } from "@/lib/highlight"
import { cn } from "@/lib/utils"

import { ProCode } from "./code"
import { CommandBox } from "./command"
import { proHref } from "./href"
import { ProPreview } from "./preview"
import { InlineCode, Keycap } from "./sheet"

/*
 * The MDX map for the Pro docs: a developer.apple.com reading column on
 * black. It starts from the shared map, so a tag added there still renders
 * here, and restyles every element and custom tag the guides use. Internal
 * links are rewritten so reading the docs never drops you out of the variant.
 */

type HeadingProps = React.ComponentPropsWithoutRef<"h2">

const HEADING = {
  1: "mt-0 mb-6 text-[40px] leading-[1.1] font-semibold tracking-[-0.035em] text-[#f5f5f7]",
  2: "mt-16 mb-5 text-[32px] leading-[1.125] font-semibold tracking-[-0.03em] text-[#f5f5f7]",
  3: "mt-11 mb-3 text-[22px] leading-[1.2] font-semibold tracking-[-0.025em] text-[#f5f5f7]",
  4: "mt-8 mb-2 text-[17px] leading-[1.3] font-semibold tracking-[-0.022em] text-[#f5f5f7]",
} as const

function heading(level: 1 | 2 | 3 | 4) {
  const Tag = `h${level}` as const
  return function Heading({ className, ...props }: HeadingProps) {
    return <Tag className={cn(HEADING[level], className)} {...props} />
  }
}

function rewrite(href: string): string {
  return href.startsWith("/") ? proHref(href) : href
}

function Anchor({
  href = "",
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"a">) {
  const style = cn(
    "rounded-sm text-[#2997ff] underline-offset-[0.18em] hover:underline",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2997ff]",
    className
  )
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={rewrite(href)} className={style} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={style}
      {...props}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
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

function Pre({ children }: React.ComponentPropsWithoutRef<"pre">) {
  if (!isCodeElement(children)) return null
  const { className, children: content } = children.props
  const code = typeof content === "string" ? content : ""
  const language = /language-([\w-]+)/.exec(className ?? "")?.[1] ?? "text"
  const { title, highlightLines, showLineNumbers } = parseCodeMeta(
    children.props["data-meta"]
  )

  return (
    <div className="my-7">
      <ProCode
        code={code}
        language={language}
        title={title}
        highlightLines={highlightLines}
        showLineNumbers={showLineNumbers}
        bare={!title}
      />
    </div>
  )
}

const CALLOUT = {
  note: { icon: Info, label: "Note", tint: "#64d2ff", surface: "bg-[#161617]" },
  tip: { icon: CheckCircle2, label: "Tip", tint: "#30d158", surface: "bg-[#161617]" },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    tint: "#ff9f0a",
    surface: "bg-[#211a0e]",
  },
  danger: { icon: Ban, label: "Careful", tint: "#ff6961", surface: "bg-[#2a1312]" },
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
  const { icon: Icon, label, tint, surface } = CALLOUT[variant] ?? CALLOUT.note
  return (
    <aside
      className={cn(
        "my-8 flex gap-4 rounded-[20px] px-6 py-5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]",
        surface
      )}
    >
      <Icon
        aria-hidden="true"
        className="mt-1 size-[18px] shrink-0"
        style={{ color: tint }}
      />
      <div className="min-w-0 flex-1">
        <p
          className="text-[15px] font-semibold tracking-[-0.016em]"
          style={{ color: tint }}
        >
          {title ?? label}
        </p>
        <div className="mt-1 flex flex-col gap-2 text-[15px] leading-[1.55] tracking-[-0.016em] text-[#d2d2d7] [&_p]:my-0 [&_p]:text-[15px] [&_p]:text-[#d2d2d7]">
          {children}
        </div>
      </div>
    </aside>
  )
}

function Steps({ children }: { children: React.ReactNode }) {
  return <div className="my-10 flex flex-col [counter-reset:pro-step]">{children}</div>
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative pb-10 pl-14 [counter-increment:pro-step] last:pb-0",
        "before:absolute before:top-0 before:left-0 before:flex before:size-8 before:items-center before:justify-center",
        "before:rounded-full before:bg-[#f5f5f7] before:text-[14px] before:font-semibold before:text-black before:content-[counter(pro-step)]",
        "after:absolute after:top-10 after:bottom-2 after:left-[15.5px] after:w-px after:bg-white/[0.14] last:after:hidden"
      )}
    >
      <h3 className="pt-1 text-[19px] leading-[1.3] font-semibold tracking-[-0.022em] text-[#f5f5f7]">
        {title}
      </h3>
      <div className="mt-3 flex flex-col gap-3 [&>div]:my-2 [&>p]:my-0">{children}</div>
    </div>
  )
}

function CardGroup({
  children,
  columns = 2,
}: {
  children: React.ReactNode
  columns?: 2 | 3
}) {
  return (
    <div
      className={cn(
        "my-8 grid gap-4",
        columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
      )}
    >
      {children}
    </div>
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
        <span className="text-[17px] font-semibold tracking-[-0.022em] text-[#f5f5f7]">
          {title}
        </span>
        {external ? (
          <ArrowUpRight
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#86868b]"
          />
        ) : null}
      </span>
      {children ? (
        <span className="mt-2 block text-[15px] leading-[1.5] tracking-[-0.016em] text-[#86868b]">
          {children}
        </span>
      ) : null}
      <span
        aria-hidden="true"
        className="mt-4 block text-[15px] text-[#2997ff] group-hover:underline"
      >
        Learn more ›
      </span>
    </>
  )
  const style = cn(
    "group flex flex-col rounded-[22px] bg-[#161617] p-6 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]",
    "transition-colors duration-300 hover:bg-[#1d1d1f]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2997ff]"
  )
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={style}>
        {body}
      </a>
    )
  }
  return (
    <Link href={rewrite(href)} className={style}>
      {body}
    </Link>
  )
}

function Badge({ children }: { children: React.ReactNode; variant?: string }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-white/[0.1] px-2.5 align-middle text-[12px] font-medium text-[#f5f5f7]">
      {children}
    </span>
  )
}

function ComponentPreview({
  slug,
  minHeight = "22rem",
}: {
  slug: string
  title?: string
  minHeight?: string
}) {
  return (
    <div
      className="pro-stage my-8 flex items-center justify-center overflow-hidden rounded-[24px] p-6 sm:p-10"
      style={{ minHeight }}
    >
      <ProPreview slug={slug} />
    </div>
  )
}

function PackageManagerTabs({
  commands,
  label,
}: {
  commands: CommandSet
  label?: string
}) {
  return <CommandBox commands={commands} label={label} className="my-6" />
}

function InstallTabs({ target, label }: { target: string; label?: string }) {
  return <CommandBox commands={shadcnCommands(target)} label={label} className="my-6" />
}

function DependencyTabs({ packages }: { packages: string }) {
  return (
    <CommandBox
      commands={dependencyCommands(packages.split(/\s+/).filter(Boolean))}
      label="Install dependencies"
      className="my-6"
    />
  )
}

async function CodeBlock({
  code,
  language,
  title,
  highlightLines,
  showLineNumbers,
}: {
  code: string
  language?: string
  title?: string
  highlightLines?: number[]
  showLineNumbers?: boolean
}) {
  return (
    <div className="my-7">
      <ProCode
        code={code}
        language={language}
        title={title}
        highlightLines={highlightLines}
        showLineNumbers={showLineNumbers}
      />
    </div>
  )
}

export const proMdxComponents = {
  ...mdxComponents,

  h1: heading(1),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),

  p: ({ className, ...props }: React.ComponentPropsWithoutRef<"p">) => (
    <p
      className={cn(
        "my-5 text-[17px] leading-[1.65] tracking-[-0.018em] text-[#cdcdd2]",
        className
      )}
      {...props}
    />
  ),
  a: Anchor,
  ul: ({ className, ...props }: React.ComponentPropsWithoutRef<"ul">) => (
    <ul
      className={cn(
        "my-5 flex list-disc flex-col gap-2.5 pl-6 text-[17px] leading-[1.6] tracking-[-0.018em] text-[#cdcdd2] marker:text-[#6e6e73]",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.ComponentPropsWithoutRef<"ol">) => (
    <ol
      className={cn(
        "my-5 flex list-decimal flex-col gap-2.5 pl-6 text-[17px] leading-[1.6] tracking-[-0.018em] text-[#cdcdd2] marker:text-[#86868b]",
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.ComponentPropsWithoutRef<"li">) => (
    <li className={cn("pl-1 [&>ul]:my-2", className)} {...props} />
  ),
  blockquote: ({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className={cn(
        "my-8 border-l-2 border-[#2997ff] pl-5 text-[19px] leading-[1.5] text-[#f5f5f7] [&>p]:text-[19px] [&>p]:text-[#f5f5f7]",
        className
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }: React.ComponentPropsWithoutRef<"hr">) => (
    <hr className={cn("my-14 border-white/[0.12]", className)} {...props} />
  ),
  code: ({ children }: React.ComponentPropsWithoutRef<"code">) => (
    <InlineCode>{children}</InlineCode>
  ),
  pre: Pre,
  table: ({ className, ...props }: React.ComponentPropsWithoutRef<"table">) => (
    <div className="my-8 overflow-x-auto rounded-[20px] bg-[#161617] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]">
      <table
        className={cn("w-full border-collapse text-left text-[15px]", className)}
        {...props}
      />
    </div>
  ),
  th: ({ className, ...props }: React.ComponentPropsWithoutRef<"th">) => (
    <th
      scope="col"
      className={cn(
        "border-b border-white/[0.1] px-5 py-3.5 text-[13px] font-semibold text-[#f5f5f7]",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.ComponentPropsWithoutRef<"td">) => (
    <td
      className={cn(
        "border-b border-white/[0.07] px-5 py-3.5 align-top leading-[1.5] text-[#a1a1a6] [tr:last-child_&]:border-b-0",
        className
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className={cn("font-semibold text-[#f5f5f7]", className)} {...props} />
  ),

  Callout,
  Steps,
  Step,
  CardGroup,
  Card,
  Badge,
  Kbd: Keycap,
  CodeBlock,
  ComponentPreview,
  PackageManagerTabs,
  InstallTabs,
  DependencyTabs,
}
