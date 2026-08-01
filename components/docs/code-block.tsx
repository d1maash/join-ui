import * as React from "react"

import { CodeBlockShell } from "@/components/docs/code-block-shell"
import { highlightCode } from "@/lib/highlight"
import { cn } from "@/lib/utils"

export interface CodeBlockProps {
  code: string
  language?: string
  /** Filename shown in the header bar. */
  title?: string
  showLineNumbers?: boolean
  /** 1-based line numbers to emphasise. */
  highlightLines?: number[]
  /** Show the copy control. */
  copy?: boolean
  /** Collapse past this height with an expand control. */
  collapsible?: boolean
  collapsedHeight?: number
  className?: string
}

/**
 * Server-rendered code block.
 *
 * Highlighting happens at build time and ships as dual-theme HTML, so there is
 * no highlighter in the client bundle, no flash of unstyled code, and no
 * re-highlighting when the theme changes.
 */
export async function CodeBlock({
  code,
  language = "tsx",
  title,
  showLineNumbers = false,
  highlightLines = [],
  copy = true,
  collapsible = false,
  collapsedHeight = 420,
  className,
}: CodeBlockProps) {
  const html = await highlightCode(code, { language, highlightLines })

  return (
    <CodeBlockShell
      code={code}
      title={title}
      language={language}
      copy={copy}
      collapsible={collapsible}
      collapsedHeight={collapsedHeight}
      className={className}
    >
      <div
        data-line-numbers={showLineNumbers ? "" : undefined}
        className={cn(
          "[&_pre]:overflow-x-auto [&_pre]:py-4 [&_pre]:text-[0.8125rem] [&_pre]:leading-[1.65]",
          "[&_code]:font-mono",
          showLineNumbers && "[&_.shiki]:[--line-numbers:1]"
        )}
        // Shiki output: generated at build time from trusted repository files.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </CodeBlockShell>
  )
}
