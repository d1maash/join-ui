import { highlightCode } from "@/lib/highlight"

import { ProCodeShell } from "./code-shell"

/** Highlights on the server, renders in the Pro code panel. */
export async function ProCode({
  code,
  language = "tsx",
  title,
  highlightLines,
  showLineNumbers = false,
  collapsible = false,
  collapsedHeight,
  bare = false,
  className,
}: {
  code: string
  language?: string
  title?: string
  highlightLines?: number[]
  showLineNumbers?: boolean
  collapsible?: boolean
  collapsedHeight?: number
  bare?: boolean
  className?: string
}) {
  const html = await highlightCode(code, { language, highlightLines })

  return (
    <ProCodeShell
      html={html}
      code={code}
      title={title}
      language={language}
      showLineNumbers={showLineNumbers}
      collapsible={collapsible}
      collapsedHeight={collapsedHeight}
      bare={bare}
      className={className}
    />
  )
}
