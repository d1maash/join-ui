import * as React from "react"
import Link from "next/link"
import { AlertTriangle, ArrowUpRight, Ban, CheckCircle2, Info } from "lucide-react"

import { mdxComponents } from "@/components/site/mdx-components"
import { dependencyCommands, shadcnCommands, type CommandSet } from "@/lib/commands"
import { parseCodeMeta } from "@/lib/highlight"
import { variantHref } from "@/lib/variants"
import { cn } from "@/lib/utils"

import { IxCode } from "./code"
import { IxCommand } from "./command"
import { IxInlinePreview } from "./inline-preview"

/*
 * The docs' MDX, drawn in the grid. The shared map is spread first so any
 * block added to it later still renders; everything the reader sees is then
 * replaced with a plain element styled by `.ix-prose`, or with a boxed
 * version of the block.
 */

const href = (value: string) => variantHref("index", value)

function Anchor({ href: target = "", children, ...props }: React.ComponentPropsWithoutRef<"a">) {
  if (target.startsWith("/") || target.startsWith("#")) {
    return (
      <Link href={href(target)} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <a href={target} target="_blank" rel="noreferrer noopener" {...props}>
      {children}
    </a>
  )
}

interface CodeElementProps {
  className?: string
  "data-meta"?: string
  children?: React.ReactNode
}

function Pre({ children }: React.ComponentPropsWithoutRef<"pre">) {
  if (!React.isValidElement<CodeElementProps>(children)) return null
  const { className, children: content } = children.props
  const code = typeof content === "string" ? content : ""
  const language = /language-([\w-]+)/.exec(className ?? "")?.[1] ?? "text"
  const { title, highlightLines, showLineNumbers } = parseCodeMeta(children.props["data-meta"])
  return (
    <div className="my-5">
      <IxCode
        code={code}
        language={language}
        title={title}
        highlightLines={highlightLines}
        lineNumbers={showLineNumbers}
        collapsible
        collapsedLines={28}
      />
    </div>
  )
}

const CALLOUTS = {
  note: { icon: Info, label: "Note", tone: "text-[var(--ix-fg-2)]", bar: "bg-[var(--ix-line-3)]" },
  tip: { icon: CheckCircle2, label: "Tip", tone: "text-[var(--ix-accent)]", bar: "bg-[var(--ix-accent)]" },
  warning: { icon: AlertTriangle, label: "Warning", tone: "text-[var(--caution)]", bar: "bg-[var(--caution)]" },
  danger: { icon: Ban, label: "Careful", tone: "text-[var(--critical)]", bar: "bg-[var(--critical)]" },
} as const

function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: keyof typeof CALLOUTS
  title?: string
  children: React.ReactNode
}) {
  const { icon: Icon, label, tone, bar } = CALLOUTS[variant] ?? CALLOUTS.note
  return (
    <aside className="relative my-6 border border-[var(--ix-line)] bg-[var(--ix-cell)]">
      <span aria-hidden="true" className={cn("absolute inset-y-[-1px] left-[-1px] w-0.5", bar)} />
      <div className="flex h-9 items-center gap-2 border-b border-[var(--ix-line)] px-4">
        <Icon aria-hidden="true" className={cn("size-3.5", tone)} />
        <span className={cn("ix-mono text-[0.6875rem] tracking-[0.04em] uppercase", tone)}>{title ?? label}</span>
      </div>
      <div className="px-4 py-3 text-[0.875rem] leading-relaxed [&>p]:my-1.5">{children}</div>
    </aside>
  )
}

function CardGroup({ children, columns = 2 }: { children: React.ReactNode; columns?: 2 | 3 }) {
  return (
    <div className="my-6 border border-[var(--ix-line)]">
      <div className="ix-cells !mr-[-1px] !mb-[-1px]" data-cols={columns === 3 ? "3" : "2"}>
        {children}
      </div>
    </div>
  )
}

function Card({ title, href: target, children }: { title: string; href: string; children?: React.ReactNode }) {
  const external = target.startsWith("http")
  const body = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="text-[0.875rem] font-medium text-[var(--ix-fg)]">{title}</span>
        <ArrowUpRight
          aria-hidden="true"
          className="ix-fg-3 size-3.5 shrink-0 transition-colors group-hover:text-[var(--ix-accent)]"
        />
      </span>
      {children ? <span className="ix-fg-2 text-[0.8125rem] leading-relaxed">{children}</span> : null}
    </>
  )
  const style =
    "group flex h-full flex-col gap-1.5 bg-[var(--ix-cell)] p-4 !no-underline transition-colors hover:bg-[var(--ix-raise)] !font-normal"
  return (
    <div className="flex">
      {external ? (
        <a href={target} target="_blank" rel="noreferrer noopener" className={cn(style, "w-full")}>
          {body}
        </a>
      ) : (
        <Link href={href(target)} className={cn(style, "w-full")}>
          {body}
        </Link>
      )}
    </div>
  )
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="my-6 !gap-0 !p-0 [counter-reset:ix-step] !list-none border border-[var(--ix-line)]">{children}</ol>
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[3rem_minmax(0,1fr)] border-b border-[var(--ix-line)] bg-[var(--ix-cell)] !pl-0 [counter-increment:ix-step] last:border-b-0 before:!hidden">
      <span
        aria-hidden="true"
        className="ix-mono ix-accent border-r border-[var(--ix-line)] pt-4 text-center before:content-[counter(ix-step,decimal-leading-zero)]"
      />
      <div className="min-w-0 px-4 py-3.5 [&>p]:my-2 [&>p:first-of-type]:mt-1">
        <h3 className="!m-0 !text-[0.9375rem]">{title}</h3>
        {children}
      </div>
    </li>
  )
}

function InstallTabs({ target, label }: { target: string; label?: string }) {
  return <IxCommand commands={shadcnCommands(target)} label={label} className="my-5" />
}

function DependencyTabs({ packages }: { packages: string }) {
  return (
    <IxCommand
      commands={dependencyCommands(packages.split(/\s+/).filter(Boolean))}
      className="my-5"
    />
  )
}

function PackageManagerTabs({ commands, label }: { commands: CommandSet; label?: string }) {
  return <IxCommand commands={commands} label={label} className="my-5" />
}

async function CodeBlock({ code, language, title }: { code: string; language?: string; title?: string }) {
  return (
    <div className="my-5">
      <IxCode code={code} language={language} title={title} />
    </div>
  )
}

function Table(props: React.ComponentPropsWithoutRef<"table">) {
  return (
    <div className="ix-table-wrap">
      <table className="ix-table" {...props} />
    </div>
  )
}

export const ixMdxComponents = {
  ...mdxComponents,
  h1: (props: React.ComponentPropsWithoutRef<"h1">) => <h2 {...props} />,
  h2: (props: React.ComponentPropsWithoutRef<"h2">) => <h2 {...props} />,
  h3: (props: React.ComponentPropsWithoutRef<"h3">) => <h3 {...props} />,
  h4: (props: React.ComponentPropsWithoutRef<"h4">) => <h4 {...props} />,
  p: (props: React.ComponentPropsWithoutRef<"p">) => <p {...props} />,
  a: Anchor,
  ul: (props: React.ComponentPropsWithoutRef<"ul">) => <ul {...props} />,
  ol: (props: React.ComponentPropsWithoutRef<"ol">) => <ol {...props} />,
  li: (props: React.ComponentPropsWithoutRef<"li">) => <li {...props} />,
  blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => <blockquote {...props} />,
  hr: (props: React.ComponentPropsWithoutRef<"hr">) => <hr {...props} />,
  code: (props: React.ComponentPropsWithoutRef<"code">) => <code {...props} />,
  strong: (props: React.ComponentPropsWithoutRef<"strong">) => <strong {...props} />,
  pre: Pre,
  table: Table,
  th: (props: React.ComponentPropsWithoutRef<"th">) => <th scope="col" {...props} />,
  td: (props: React.ComponentPropsWithoutRef<"td">) => <td {...props} />,
  Callout,
  CardGroup,
  Card,
  Steps,
  Step,
  InstallTabs,
  DependencyTabs,
  PackageManagerTabs,
  CodeBlock,
  ComponentPreview: IxInlinePreview,
  Kbd: (props: React.ComponentPropsWithoutRef<"kbd">) => <kbd className="ix-kbd" {...props} />,
  Badge: ({ children }: { children: React.ReactNode }) => <span className="ix-badge">{children}</span>,
}
