import type * as React from "react"
import Link from "next/link"
import { AlertTriangle, ArrowUpRight, Ban, CheckCircle2, ChevronRight, Info } from "lucide-react"

import { mdxComponents } from "@/components/site/mdx-components"
import { dependencyCommands, shadcnCommands, type CommandSet } from "@/lib/commands"
import { cn } from "@/lib/utils"

import { GlassCommand } from "./command"
import { GlassKbd } from "./reference"
import { g } from "./ui"

type Props<T extends keyof React.JSX.IntrinsicElements> = React.ComponentPropsWithoutRef<T>

/*
 * The MDX map for the docs, on the paper surface: Apple's reading rhythm
 * (17px at 1.6), headings that step down in size rather than in weight, and
 * every internal link rewritten so the guides stay inside the variant.
 */

function GlassLink({ href = "", className, ...props }: Props<"a">) {
  const style = cn(
    "rounded-sm text-[#0066cc] underline-offset-[3px] hover:underline",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]",
    className
  )
  if (href.startsWith("#")) return <a href={href} className={style} {...props} />
  if (href.startsWith("/")) return <Link href={g(href)} className={style} {...props} />
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className={style} {...props} />
  )
}

const CALLOUTS = {
  note: { icon: Info, label: "Note", tint: "bg-[#0071e3]/[0.06]", ink: "text-[#0066cc]" },
  tip: { icon: CheckCircle2, label: "Tip", tint: "bg-[#34c759]/[0.09]", ink: "text-[#1a7f37]" },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    tint: "bg-[#ff9f0a]/[0.11]",
    ink: "text-[#a04a00]",
  },
  danger: { icon: Ban, label: "Careful", tint: "bg-[#ff3b30]/[0.08]", ink: "text-[#c4000f]" },
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
  const { icon: Icon, label, tint, ink } = CALLOUTS[variant] ?? CALLOUTS.note
  return (
    <aside className={cn("my-6 flex gap-3.5 rounded-[20px] px-5 py-4", tint)}>
      <Icon aria-hidden="true" className={cn("mt-[3px] size-[18px] shrink-0", ink)} />
      <div className="min-w-0 flex-1">
        <p className={cn("text-[15px] font-semibold tracking-[-0.016em]", ink)}>
          {title ?? label}
        </p>
        <div className="mt-1 flex flex-col gap-2 text-[15px] leading-[1.55] text-[#3a3a3e] [&_p]:my-0 [&_p]:text-[15px] [&_p]:leading-[1.55]">
          {children}
        </div>
      </div>
    </aside>
  )
}

function Steps({ children }: { children: React.ReactNode }) {
  return <div className="my-8 flex flex-col [counter-reset:g-step]">{children}</div>
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative pb-9 pl-12 [counter-increment:g-step] last:pb-0",
        "before:absolute before:top-0 before:left-0 before:flex before:size-7 before:items-center before:justify-center before:rounded-full",
        "before:bg-[#0071e3] before:text-[13px] before:font-semibold before:text-white before:content-[counter(g-step)] before:[font-variant-numeric:tabular-nums]",
        "after:absolute after:top-9 after:bottom-2 after:left-[13.5px] after:w-px after:bg-black/[0.1] last:after:hidden"
      )}
    >
      <h3 className="mt-0.5 mb-2 text-[19px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
        {title}
      </h3>
      <div className="flex flex-col gap-3 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
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
    <div className={cn("my-7 grid gap-3", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
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
  const className = cn(
    "group flex flex-col gap-1 rounded-[22px] bg-white px-5 py-4 shadow-[0_0_0_0.5px_rgb(24_32_72/0.1),0_1px_2px_rgb(24_32_72/0.05)]",
    "transition-[box-shadow,translate] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-[0_0_0_0.5px_rgb(24_32_72/0.1),0_10px_28px_-10px_rgb(24_32_72/0.25)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
  )
  const body = (
    <>
      <span className="flex items-center justify-between gap-3 text-[17px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
        {title}
        {external ? (
          <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-[#0066cc]" />
        ) : (
          <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-[#0066cc]" />
        )}
      </span>
      {children ? (
        <span className="text-[14px] leading-[1.45] text-[#56565b] [&_p]:m-0 [&_p]:text-[14px] [&_p]:leading-[1.45] [&_p]:text-[#56565b]">
          {children}
        </span>
      ) : null}
    </>
  )
  return external ? (
    <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
      {body}
    </a>
  ) : (
    <Link href={g(href)} className={className}>
      {body}
    </Link>
  )
}

export const glassMdx = {
  ...mdxComponents,

  h2: ({ className, ...props }: Props<"h2">) => (
    <h2
      className={cn(
        "mt-16 mb-4 scroll-mt-32 text-[30px] leading-[1.15] font-semibold tracking-[-0.032em] text-[#1d1d1f] first:mt-0",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: Props<"h3">) => (
    <h3
      className={cn(
        "mt-10 mb-3 scroll-mt-32 text-[22px] leading-[1.2] font-semibold tracking-[-0.024em] text-[#1d1d1f]",
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: Props<"h4">) => (
    <h4
      className={cn(
        "mt-8 mb-2 scroll-mt-32 text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f]",
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: Props<"p">) => (
    <p className={cn("my-4 text-[#3a3a3e]", className)} {...props} />
  ),
  a: GlassLink,
  ul: ({ className, ...props }: Props<"ul">) => (
    <ul
      className={cn(
        "my-4 flex list-disc flex-col gap-2 pl-6 text-[#3a3a3e] marker:text-[#86868b]",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: Props<"ol">) => (
    <ol
      className={cn(
        "my-4 flex list-decimal flex-col gap-2 pl-6 text-[#3a3a3e] marker:font-medium marker:text-[#56565b]",
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
        "my-6 rounded-[20px] bg-black/[0.035] px-5 py-1 text-[#3a3a3e] [&>p]:my-3",
        className
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }: Props<"hr">) => (
    <hr className={cn("my-12 border-black/[0.08]", className)} {...props} />
  ),
  code: ({ className, ...props }: Props<"code">) => (
    <code
      className={cn(
        "rounded-[6px] bg-black/[0.05] px-[0.35em] py-[0.12em] font-mono text-[0.84em] text-[#1d1d1f]",
        className
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }: Props<"table">) => (
    <div className="my-6 overflow-x-auto rounded-[20px] bg-white shadow-[0_0_0_0.5px_rgb(24_32_72/0.1)]">
      <table className={cn("w-full border-collapse text-left text-[15px]", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: Props<"th">) => (
    <th
      scope="col"
      className={cn(
        "border-b border-black/[0.08] bg-black/[0.02] px-4 py-3 text-[13px] font-semibold text-[#1d1d1f]",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: Props<"td">) => (
    <td
      className={cn(
        "border-b border-black/[0.06] px-4 py-3 align-top text-[#3a3a3e] [tr:last-child>&]:border-b-0",
        className
      )}
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
  Kbd: GlassKbd,
  PackageManagerTabs: ({ commands, label }: { commands: CommandSet; label?: string }) => (
    <GlassCommand commands={commands} label={label} className="my-6" />
  ),
  InstallTabs: ({ target, label }: { target: string; label?: string }) => (
    <GlassCommand commands={shadcnCommands(target)} label={label} className="my-6" />
  ),
  DependencyTabs: ({ packages }: { packages: string }) => (
    <GlassCommand
      commands={dependencyCommands(packages.split(/\s+/).filter(Boolean))}
      className="my-6"
    />
  ),
}
