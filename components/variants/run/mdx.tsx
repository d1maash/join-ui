import * as React from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { mdxComponents } from "@/components/site/mdx-components"
import { dependencyCommands, shadcnCommands } from "@/lib/commands"
import { parseCodeMeta } from "@/lib/highlight"
import { cn } from "@/lib/utils"
import { variantHref } from "@/lib/variants"

import { CommandSwitch } from "./bits"
import { RunCode } from "./code"

const href = (path: string) => variantHref("run", path)

/*
 * The docs' MDX, set in the reading column of this variant: ink headings, grey
 * prose, code in window chrome, and every internal link kept inside `/v/run`.
 * The blocks this variant has no opinion about — callouts, steps, previews —
 * come from the shared map unchanged.
 */

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
  const { title, showLineNumbers } = parseCodeMeta(children.props["data-meta"])
  return (
    <div className="my-6">
      <RunCode
        code={code}
        language={language}
        title={title ?? language}
        numbers={showLineNumbers}
        lights
      />
    </div>
  )
}

function DocsLink({
  href: to = "",
  className,
  ...props
}: React.ComponentPropsWithoutRef<"a">) {
  const style = cn(
    "font-medium text-[#f5f5f7] underline decoration-white/25 decoration-1 underline-offset-4 transition-[text-decoration-color] hover:decoration-white/80",
    className
  )
  if (to.startsWith("/") || to.startsWith("#")) {
    return (
      <Link href={to.startsWith("/") ? href(to) : to} className={style} {...props} />
    )
  }
  return (
    <a
      href={to}
      target="_blank"
      rel="noreferrer noopener"
      className={style}
      {...props}
    />
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
        "my-7 grid gap-px overflow-hidden rounded-[12px] bg-white/[0.08]",
        columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
      )}
    >
      {children}
    </div>
  )
}

function Card({
  title,
  href: to,
  children,
}: {
  title: string
  href: string
  children?: React.ReactNode
}) {
  const external = to.startsWith("http")
  const body = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="text-[15px] font-medium text-[#f5f5f7]">{title}</span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 shrink-0 text-[#77777c] transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#f5f5f7]"
        />
      </span>
      {children ? (
        <span className="text-[14px] leading-[1.55] text-[#8b8b90]">{children}</span>
      ) : null}
    </>
  )
  const style =
    "group flex flex-col gap-1.5 bg-[#060607] p-5 transition-colors hover:bg-[#0d0d0f] focus-visible:outline-offset-[-3px]"
  return external ? (
    <a href={to} target="_blank" rel="noreferrer noopener" className={style}>
      {body}
    </a>
  ) : (
    <Link href={href(to)} className={style}>
      {body}
    </Link>
  )
}

function heading(level: 2 | 3 | 4) {
  const styles = {
    2: "mt-16 mb-4 scroll-mt-28 text-[1.5rem] leading-[1.25] font-semibold tracking-[-0.02em] text-[#f5f5f7] first:mt-0",
    3: "mt-10 mb-3 scroll-mt-28 text-[1.0625rem] leading-[1.4] font-medium tracking-[-0.012em] text-[#f5f5f7]",
    4: "mt-8 mb-2 scroll-mt-28 text-[0.9375rem] font-medium text-[#f5f5f7]",
  }
  const Tag = `h${level}` as const
  return function Heading({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"h2">) {
    return <Tag className={cn(styles[level], className)} {...props} />
  }
}

export const runMdxComponents = {
  ...mdxComponents,
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  p: ({ className, ...props }: React.ComponentPropsWithoutRef<"p">) => (
    <p
      className={cn(
        "my-4 text-[1rem] leading-[1.7] tracking-[-0.006em] text-[#9d9da2]",
        className
      )}
      {...props}
    />
  ),
  a: DocsLink,
  ul: ({ className, ...props }: React.ComponentPropsWithoutRef<"ul">) => (
    <ul
      className={cn(
        "my-4 flex list-disc flex-col gap-2 pl-5 text-[#9d9da2] marker:text-[#48484c]",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.ComponentPropsWithoutRef<"ol">) => (
    <ol
      className={cn(
        "my-4 flex list-decimal flex-col gap-2 pl-5 text-[#9d9da2] marker:text-[#77777c]",
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.ComponentPropsWithoutRef<"li">) => (
    <li className={cn("leading-[1.7] [&>ul]:my-2", className)} {...props} />
  ),
  code: ({ className, ...props }: React.ComponentPropsWithoutRef<"code">) => (
    <code
      className={cn(
        "rounded-[5px] bg-white/[0.07] px-[0.35em] py-[0.1em] font-mono text-[0.86em] text-[#f5f5f7]",
        className
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className={cn("font-medium text-[#f5f5f7]", className)} {...props} />
  ),
  blockquote: ({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className={cn("my-6 border-l border-white/20 pl-5 text-[#8b8b90]", className)}
      {...props}
    />
  ),
  hr: () => <hr className="my-12 border-white/[0.08]" />,
  table: ({ className, ...props }: React.ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto">
      <table className={cn("run-spec", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: React.ComponentPropsWithoutRef<"th">) => (
    <th
      scope="col"
      className={cn("!text-[12px] !font-medium !text-[#77777c]", className)}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.ComponentPropsWithoutRef<"td">) => (
    <td className={cn("text-[14px] text-[#9d9da2]", className)} {...props} />
  ),
  pre: Pre,
  CodeBlock: ({
    code,
    language,
    title,
  }: {
    code: string
    language?: string
    title?: string
  }) => (
    <div className="my-6">
      <RunCode code={code} language={language} title={title ?? language} lights />
    </div>
  ),
  Kbd: ({ children }: { children: React.ReactNode }) => (
    <kbd className="run-key mx-0.5">{children}</kbd>
  ),
  CardGroup,
  Card,
  InstallTabs: ({ target, label }: { target: string; label?: string }) => (
    <div className="my-6">
      <CommandSwitch
        commands={shadcnCommands(target)}
        label={label ?? "Package manager"}
      />
    </div>
  ),
  DependencyTabs: ({ packages }: { packages: string }) => (
    <div className="my-6">
      <CommandSwitch
        commands={dependencyCommands(packages.split(/\s+/).filter(Boolean))}
        label="Package manager"
      />
    </div>
  ),
  PackageManagerTabs: ({
    commands,
    label,
  }: {
    commands: Parameters<typeof CommandSwitch>[0]["commands"]
    label?: string
  }) => (
    <div className="my-6">
      <CommandSwitch commands={commands} label={label ?? "Package manager"} />
    </div>
  ),
}
