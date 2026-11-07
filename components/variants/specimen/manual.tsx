import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, TriangleAlert } from "lucide-react"

import { CodeBlock } from "@/components/site/code-block"
import { mdxComponents } from "@/components/site/mdx-components"
import { PackageManagerTabs } from "@/components/site/package-manager-tabs"
import { dependencyCommands, shadcnCommands } from "@/lib/commands"
import { parseCodeMeta } from "@/lib/highlight"
import { cn } from "@/lib/utils"
import { variantHref } from "@/lib/variants"

/*
 * The manual's typesetting for the docs MDX.
 *
 * Sections are numbered by the chapter they sit in (3.1, 3.2 …), code is set
 * as numbered listings, a Callout becomes a side note hung in the right
 * margin the way Tufte sets them, a procedure is a numbered list with display
 * numerals, and cross-references are a ruled list rather than cards. Every
 * site link is kept inside the variant. The numbers themselves come from CSS
 * counters on the article, so nothing here has to know its position.
 */

const toVariant = (href: string) => variantHref("specimen", href)

function text(children: React.ReactNode): string | undefined {
  if (typeof children === "string") return children
  if (Array.isArray(children) && children.every((child) => typeof child === "string")) {
    return children.join("")
  }
  return undefined
}

function H2({ className, children, ...props }: React.ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      data-running={text(children)}
      className={cn(
        "sp-h2 mt-16 mb-5 scroll-mt-24 border-t border-[var(--sp-ink)] pt-4 text-[clamp(26px,2.4vw,32px)] leading-[1.1] font-semibold tracking-[-0.02em] first:mt-0",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
}

function H3({ className, ...props }: React.ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className={cn(
        "mt-10 mb-3 scroll-mt-24 text-[20px] leading-[1.25] font-semibold tracking-[-0.012em]",
        className
      )}
      {...props}
    />
  )
}

function H4({ className, ...props }: React.ComponentPropsWithoutRef<"h4">) {
  return (
    <h4
      className={cn("sp-label mt-8 mb-2 scroll-mt-24 !text-[var(--sp-ink)]", className)}
      {...props}
    />
  )
}

function Anchor({ href = "", className, ...props }: React.ComponentPropsWithoutRef<"a">) {
  const style = cn(
    "font-medium text-[var(--sp-ink)] underline decoration-[var(--sp-rule-strong)] decoration-1 underline-offset-4 transition-[text-decoration-color] hover:decoration-[var(--sp-ink)]",
    className
  )
  if (href.startsWith("#")) return <a href={href} className={style} {...props} />
  if (href.startsWith("/")) return <Link href={toVariant(href)} className={style} {...props} />
  return <a href={href} target="_blank" rel="noreferrer noopener" className={style} {...props} />
}

interface CodeElementProps {
  className?: string
  "data-meta"?: string
  children?: React.ReactNode
}

function isCodeElement(node: React.ReactNode): node is React.ReactElement<CodeElementProps> {
  return React.isValidElement<CodeElementProps>(node)
}

/** A fenced block, set as a numbered listing. */
function Listing({ children }: React.ComponentPropsWithoutRef<"pre">) {
  if (!isCodeElement(children)) return null
  const { className, children: content } = children.props
  const code = typeof content === "string" ? content : ""
  const language = /language-([\w-]+)/.exec(className ?? "")?.[1] ?? "text"
  const { title, highlightLines, showLineNumbers } = parseCodeMeta(children.props["data-meta"])
  return (
    <figure className="sp-listing my-8">
      <figcaption className="mb-2 flex items-baseline gap-3">
        <span className="sp-label sp-listing-no !text-[var(--sp-ink)]" />
        <span className="sp-label">{title ?? language}</span>
      </figcaption>
      <div className="sp-code">
        <CodeBlock
          code={code}
          language={language}
          title={title}
          highlightLines={highlightLines}
          showLineNumbers={showLineNumbers}
        />
      </div>
    </figure>
  )
}

const NOTE_LABEL = {
  note: "Note",
  tip: "Tip",
  warning: "Warning",
  danger: "Careful",
} as const

/** A Callout, hung in the right margin as a side note on wide screens. */
function SideNote({
  variant = "note",
  title,
  children,
}: {
  variant?: keyof typeof NOTE_LABEL
  title?: string
  children: React.ReactNode
}) {
  const severe = variant === "warning" || variant === "danger"
  return (
    <aside
      className={cn(
        "sp-sidenote my-7 border-l-2 pl-4 xl:my-0 xl:border-t xl:border-l-0 xl:pt-3 xl:pl-0",
        severe ? "border-[var(--critical)]" : "border-[var(--sp-ink)]"
      )}
    >
      <p
        className={cn(
          "sp-label flex items-center gap-1.5",
          severe ? "!text-[var(--critical)]" : "!text-[var(--sp-ink)]"
        )}
      >
        {severe ? <TriangleAlert aria-hidden="true" className="size-3" strokeWidth={2.5} /> : null}
        {NOTE_LABEL[variant]}
        {title ? <span className="text-[var(--sp-ink-2)]"> — {title}</span> : null}
      </p>
      <div className="mt-2 flex flex-col gap-2 text-[14px] leading-[1.55] text-[var(--sp-ink-2)] [&_code]:text-[0.82em] [&_p]:my-0">
        {children}
      </div>
    </aside>
  )
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="sp-steps my-8 border-b border-[var(--sp-rule)]">{children}</ol>
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="sp-step grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 border-t border-[var(--sp-rule)] py-6 sm:grid-cols-[4rem_minmax(0,1fr)]">
      <span aria-hidden="true" className="sp-step-no sp-display text-[44px] leading-[0.8]" />
      <div className="min-w-0">
        <h3 className="text-[18px] leading-[1.3] font-semibold tracking-[-0.01em]">{title}</h3>
        <div className="mt-2 flex flex-col gap-3 text-[16px] leading-[1.65] text-[var(--sp-ink-2)] [&>p]:my-0">
          {children}
        </div>
      </div>
    </li>
  )
}

function CardGroup({ children }: { children: React.ReactNode; columns?: 2 | 3 }) {
  return (
    <ul className="my-8 grid border-t border-[var(--sp-ink)] sm:grid-cols-2 sm:gap-x-8">
      {children}
    </ul>
  )
}

function Card({ title, href, children }: { title: string; href: string; children?: React.ReactNode }) {
  const external = href.startsWith("http")
  const inner = (
    <>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[16px] font-semibold tracking-[-0.01em] underline-offset-4 group-hover:underline">
          {title}
        </span>
        <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0 text-[var(--sp-ink-2)]" />
      </span>
      {children ? (
        <span className="mt-1 block text-[14px] leading-[1.5] text-[var(--sp-ink-2)]">{children}</span>
      ) : null}
    </>
  )
  return (
    <li className="border-b border-[var(--sp-rule)]">
      {external ? (
        <a href={href} target="_blank" rel="noreferrer noopener" className="group block py-4">
          {inner}
        </a>
      ) : href.startsWith("#") ? (
        <a href={href} className="group block py-4">
          {inner}
        </a>
      ) : (
        <Link href={toVariant(href)} className="group block py-4">
          {inner}
        </Link>
      )}
    </li>
  )
}

function InstallTabs({ target, label }: { target: string; label?: string }) {
  return (
    <div className="sp-code my-6">
      <PackageManagerTabs commands={shadcnCommands(target)} label={label} />
    </div>
  )
}

function DependencyTabs({ packages }: { packages: string }) {
  return (
    <div className="sp-code my-6">
      <PackageManagerTabs commands={dependencyCommands(packages.split(/\s+/).filter(Boolean))} />
    </div>
  )
}

export const manualComponents = {
  ...mdxComponents,
  h2: H2,
  h3: H3,
  h4: H4,
  a: Anchor,
  p: ({ className, ...props }: React.ComponentPropsWithoutRef<"p">) => (
    <p className={cn("my-5 text-[17px] leading-[1.7] text-[var(--sp-ink)]", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.ComponentPropsWithoutRef<"ul">) => (
    <ul
      className={cn(
        "my-5 flex list-[square] flex-col gap-2 pl-5 text-[17px] leading-[1.65] marker:text-[var(--sp-ink-3)]",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.ComponentPropsWithoutRef<"ol">) => (
    <ol
      className={cn(
        "my-5 flex list-decimal flex-col gap-2 pl-6 text-[17px] leading-[1.65] marker:font-mono marker:text-[13px] marker:text-[var(--sp-ink-2)]",
        className
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className={cn("sp-serif my-7 border-l border-[var(--sp-ink)] pl-5 text-[22px] leading-[1.35] text-[var(--sp-ink-2)]", className)}
      {...props}
    />
  ),
  hr: () => <hr className="my-12 border-[var(--sp-rule)]" />,
  code: ({ className, ...props }: React.ComponentPropsWithoutRef<"code">) => (
    <code
      className={cn(
        "sp-mono rounded-[2px] bg-[rgb(17_17_17/0.06)] px-[0.3em] py-[0.1em] text-[0.84em] text-[var(--sp-ink)]",
        className
      )}
      {...props}
    />
  ),
  pre: Listing,
  table: ({ className, ...props }: React.ComponentPropsWithoutRef<"table">) => (
    <div className="my-7 overflow-x-auto border-t border-[var(--sp-ink)]">
      <table className={cn("w-full border-collapse text-left text-[15px]", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: React.ComponentPropsWithoutRef<"th">) => (
    <th scope="col" className={cn("sp-label border-b border-[var(--sp-rule)] py-2.5 pr-4 font-medium", className)} {...props} />
  ),
  td: ({ className, ...props }: React.ComponentPropsWithoutRef<"td">) => (
    <td className={cn("border-b border-[var(--sp-rule)] py-3 pr-4 align-top text-[var(--sp-ink-2)]", className)} {...props} />
  ),
  Callout: SideNote,
  Steps,
  Step,
  CardGroup,
  Card,
  Kbd: ({ children }: { children: React.ReactNode }) => (
    <kbd className="sp-keycap sp-keycap--sm align-middle">{children}</kbd>
  ),
  InstallTabs,
  DependencyTabs,
}
