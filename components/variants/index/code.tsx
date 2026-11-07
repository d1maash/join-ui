import { highlightCode } from "@/lib/highlight"

import { IxCodeShell } from "./code-shell"

/**
 * A highlighted listing in a box with a mono bar. Highlighting runs on the
 * server through the site's one shared Shiki instance; the browser gets HTML.
 */
export async function IxCode({
  code,
  language = "tsx",
  title,
  highlightLines,
  lineNumbers = false,
  collapsible = false,
  collapsedLines = 18,
  bare = false,
  className,
}: {
  code: string
  language?: string
  title?: string
  highlightLines?: number[]
  lineNumbers?: boolean
  collapsible?: boolean
  collapsedLines?: number
  /** Drops the outer border, for a listing that sits inside a box already. */
  bare?: boolean
  className?: string
}) {
  const html = await highlightCode(code, { language, highlightLines })
  return (
    <IxCodeShell
      html={html}
      code={code}
      title={title}
      language={language}
      lineNumbers={lineNumbers}
      collapsible={collapsible}
      collapsedLines={collapsedLines}
      bare={bare}
      className={className}
    />
  )
}
