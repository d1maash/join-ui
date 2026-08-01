import { CodeBlockShell } from "@/components/site/code-block-shell"
import { highlightCode } from "@/lib/highlight"

export interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  highlightLines?: number[]
  showLineNumbers?: boolean
  collapsible?: boolean
  collapsedHeight?: number
  className?: string
}

/**
 * Server-rendered code listing.
 *
 * Highlighting happens during the render pass and ships as static HTML, so no
 * Shiki grammar or theme ever reaches the browser.
 */
export async function CodeBlock({
  code,
  language = "tsx",
  title,
  highlightLines,
  showLineNumbers = false,
  collapsible = false,
  collapsedHeight,
  className,
}: CodeBlockProps) {
  const html = await highlightCode(code, { language, highlightLines })

  return (
    <CodeBlockShell
      html={html}
      code={code}
      title={title}
      language={language}
      showLineNumbers={showLineNumbers}
      collapsible={collapsible}
      collapsedHeight={collapsedHeight}
      className={className}
    />
  )
}
