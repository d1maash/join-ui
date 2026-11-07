import * as React from "react"
import Link from "next/link"
import { AlertTriangle, ChevronRight, Info, Lightbulb, OctagonAlert } from "lucide-react"

import { mdxComponents } from "@/components/site/mdx-components"
import { dependencyCommands, shadcnCommands, type CommandSet } from "@/lib/commands"
import { parseCodeMeta } from "@/lib/highlight"
import { cn } from "@/lib/utils"

import { AirCode } from "./code"
import { AirCommand } from "./command"
import { air } from "./href"
import { AirStage } from "./stage"

/*
 * The MDX map for the docs, set the way Apple Developer sets an article: ink
 * body copy at 17px, generous headings, blue links, light listings, and
 * asides labelled "Note", "Tip" or "Important" on a tinted panel. Every tag
 * the original map provides is provided here; internal links are rewritten so
 * a reader never falls out of the variant.
 */

type Props<T extends keyof React.JSX.IntrinsicElements> = React.ComponentPropsWithoutRef<T>

function heading(level: 2 | 3 | 4) {
  const Tag = `h${level}` as const
  const styles = {
    2: "mt-16 mb-4 scroll-mt-24 text-[32px] leading-[1.125] font-semibold tracking-[-0.028em] text-[#1d1d1f]",
    3: "mt-10 mb-3 scroll-mt-24 text-[24px] leading-[1.17] font-semibold tracking-[-0.022em] text-[#1d1d1f]",
    4: "mt-8 mb-2 scroll-mt-24 text-[19px] leading-[1.21] font-semibold tracking-[-0.016em] text-[#1d1d1f]",
  }
  return function Heading({ className, ...props }: Props<"h2">) {
    return <Tag className={cn(styles[level], className)} {...props} />
  }
}

function AirLink({ href = "", className, children, ...props }: Props<"a">) {
  const style = cn(
    "rounded-sm text-[#0066cc] underline-offset-[0.18em] hover:underline",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]",
    className
  )
  if (href.startsWith("#")) {
    return (
      <a href={href} className={style} {...props}>
        {children}
      </a>
    )
  }
  if (href.startsWith("/")) {
    return (
      <Link href={air(href)} className={style} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className={style} {...props}>
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

function Pre({ children }: Props<"pre">) {
  if (!React.isValidElement<CodeElementProps>(children)) return null
  const { className, children: content } = children.props
  const code = typeof content === "string" ? content : ""
  const language = /language-([\w-]+)/.exec(className ?? "")?.[1] ?? "text"
  const { title, highlightLines, showLineNumbers } = parseCodeMeta(children.props["data-meta"])
  return (
    <div className="my-6">
      <AirCode
        code={code}
        language={language}
        title={title}
        highlightLines={highlightLines}
        showLineNumbers={showLineNumbers}
        collapsible
        collapsedHeight={480}
      />
    </div>
  )
}

const ASIDES = {
  note: { label: "Note", icon: Info, panel: "bg-[#f5f5f7]", ink: "text-[#1d1d1f]" },
  tip: { label: "Tip", icon: Lightbulb, panel: "bg-[#eef6ee]", ink: "text-[#1a7f37]" },
  warning: { label: "Important", icon: AlertTriangle, panel: "bg-[#fdf3e7]", ink: "text-[#b05a00]" },
  danger: { label: "Careful", icon: OctagonAlert, panel: "bg-[#fdeeed]", ink: "text-[#d70015]" },
} as const

function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: keyof typeof ASIDES
  title?: string
  children: React.ReactNode
}) {
  const aside = ASIDES[variant] ?? ASIDES.note
  const Icon = aside.icon
  return (
    <aside className={cn("my-7 rounded-[18px] px-6 py-5", aside.panel)}>
      <p className={cn("flex items-center gap-2 text-[17px] font-semibold", aside.ink)}>
        <Icon aria-hidden="true" strokeWidth={2} className="size-[18px]" />
        {title ?? aside.label}
      </p>
      <div className="mt-1.5 text-[17px] leading-[1.47] text-[#1d1d1f] [&>p]:my-1.5 [&>ul]:my-2">
        {children}
      </div>
    </aside>
  )
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="my-8 flex flex-col [counter-reset:air-step]">{children}</ol>
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="relative pb-9 pl-12 [counter-increment:air-step] last:pb-0 before:absolute before:top-0 before:left-0 before:flex before:size-8 before:items-center before:justify-center before:rounded-full before:bg-[#1d1d1f] before:text-[14px] before:font-semibold before:text-white before:content-[counter(air-step)] after:absolute after:top-10 after:bottom-1 after:left-4 after:w-px after:bg-[#d2d2d7] last:after:hidden">
      <h3 className="pt-1 text-[21px] leading-[1.2] font-semibold tracking-[-0.018em] text-[#1d1d1f]">
        {title}
      </h3>
      <div className="mt-2 text-[17px] leading-[1.47] text-[#1d1d1f] [&>div]:my-4 [&>p]:my-2">
        {children}
      </div>
    </li>
  )
}

function CardGroup({ children, columns = 2 }: { children: React.ReactNode; columns?: 2 | 3 }) {
  return (
    <div
      className={cn("my-7 grid gap-3", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}
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
  const target = href.startsWith("/") ? air(href) : href
  const className = cn(
    "group flex h-full flex-col gap-1.5 rounded-[18px] bg-white p-5 shadow-[0_0_0_1px_#e8e8ed,2px_4px_12px_rgb(0_0_0/0.04)]",
    "transition-shadow duration-300 hover:shadow-[0_0_0_1px_#d2d2d7,2px_6px_20px_rgb(0_0_0/0.09)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
  )
  const body = (
    <>
      <span className="flex items-center gap-1 text-[17px] font-semibold tracking-[-0.014em] text-[#1d1d1f]">
        {title}
        <ChevronRight
          aria-hidden="true"
          strokeWidth={2.4}
          className="size-3.5 text-[#0066cc] transition-transform group-hover:translate-x-0.5"
        />
      </span>
      {children ? (
        <span className="text-[15px] leading-[1.45] text-[#6e6e73]">{children}</span>
      ) : null}
    </>
  )
  if (external) {
    return (
      <a href={target} target="_blank" rel="noreferrer noopener" className={className}>
        {body}
      </a>
    )
  }
  if (target.startsWith("#")) {
    return (
      <a href={target} className={className}>
        {body}
      </a>
    )
  }
  return (
    <Link href={target} className={className}>
      {body}
    </Link>
  )
}

function Kbd({ className, ...props }: Props<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-[7px] bg-white px-1.5 align-[0.1em] font-sans text-[12.5px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_#d2d2d7,0_1.5px_0_#d2d2d7]",
        className
      )}
      {...props}
    />
  )
}

function Badge({ className, ...props }: Props<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[#f5f5f7] px-2.5 py-0.5 align-[0.1em] text-[12px] font-semibold text-[#1d1d1f]",
        className
      )}
      {...props}
    />
  )
}

function CodeBlock(props: {
  code: string
  language?: string
  title?: string
  highlightLines?: number[]
  showLineNumbers?: boolean
  collapsible?: boolean
  collapsedHeight?: number
  className?: string
}) {
  return <AirCode {...props} className={cn("my-6", props.className)} />
}

function ComponentPreview({ slug }: { slug: string; title?: string }) {
  return <AirStage slug={slug} className="my-8" />
}

function PackageManagerTabs({ commands, label }: { commands: CommandSet; label?: string }) {
  return <AirCommand commands={commands} label={label} tone="white" className="my-6" />
}

function InstallTabs({ target, label }: { target: string; label?: string }) {
  return (
    <AirCommand commands={shadcnCommands(target)} label={label} tone="white" className="my-6" />
  )
}

function DependencyTabs({ packages }: { packages: string }) {
  return (
    <AirCommand
      commands={dependencyCommands(packages.split(/\s+/).filter(Boolean))}
      tone="white"
      className="my-6"
    />
  )
}

export const airMdxComponents = {
  ...mdxComponents,
  h1: ({ className, ...props }: Props<"h1">) => (
    <h1 className={cn("air-h2 mt-0 mb-4", className)} {...props} />
  ),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  p: ({ className, ...props }: Props<"p">) => (
    <p className={cn("air-body my-4 text-[#1d1d1f]", className)} {...props} />
  ),
  a: AirLink,
  ul: ({ className, ...props }: Props<"ul">) => (
    <ul
      className={cn(
        "air-body my-4 flex list-disc flex-col gap-2 pl-6 text-[#1d1d1f] marker:text-[#86868b]",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: Props<"ol">) => (
    <ol
      className={cn(
        "air-body my-4 flex list-decimal flex-col gap-2 pl-6 text-[#1d1d1f] marker:text-[#6e6e73]",
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: Props<"li">) => (
    <li className={cn("pl-1 [&>ul]:my-2", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: Props<"blockquote">) => (
    <blockquote
      className={cn(
        "my-6 border-l-[3px] border-[#d2d2d7] pl-5 text-[19px] leading-[1.42] text-[#6e6e73]",
        className
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }: Props<"hr">) => (
    <hr className={cn("my-12 border-[#d2d2d7]", className)} {...props} />
  ),
  code: ({ className, ...props }: Props<"code">) => (
    <code
      className={cn(
        "rounded-[6px] bg-[#f5f5f7] px-[0.32em] py-[0.12em] font-mono text-[0.86em] text-[#1d1d1f]",
        className
      )}
      {...props}
    />
  ),
  pre: Pre,
  table: ({ className, ...props }: Props<"table">) => (
    <div className="my-7 overflow-x-auto">
      <table className={cn("w-full border-collapse text-left text-[15px]", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: Props<"th">) => (
    <th
      scope="col"
      className={cn(
        "border-b border-[#d2d2d7] py-2.5 pr-6 text-[13px] font-semibold text-[#1d1d1f]",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: Props<"td">) => (
    <td
      className={cn("border-b border-[#e8e8ed] py-3 pr-6 align-top text-[#1d1d1f]", className)}
      {...props}
    />
  ),
  strong: ({ className, ...props }: Props<"strong">) => (
    <strong className={cn("font-semibold text-[#1d1d1f]", className)} {...props} />
  ),
  Callout,
  Steps,
  Step,
  CardGroup,
  Card,
  Badge,
  Kbd,
  CodeBlock,
  ComponentPreview,
  PackageManagerTabs,
  InstallTabs,
  DependencyTabs,
}
