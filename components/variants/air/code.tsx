import { highlightCode } from "@/lib/highlight"

import { AirCodeShell } from "./code-shell"

export interface AirCodeProps {
  code: string
  language?: string
  title?: string
  highlightLines?: number[]
  showLineNumbers?: boolean
  /** Clip long listings behind a "Show more" control. */
  collapsible?: boolean
  collapsedHeight?: number
  /** `white` sits on a #f5f5f7 band; `band` sits on white. */
  tone?: "white" | "band"
  className?: string
}

/*
 * A code listing the way Apple Developer sets one: Xcode's light palette on a
 * quiet panel, a filename above it, a copy control, nothing else. Highlighted
 * on the server, so no grammar reaches the browser.
 */
export async function AirCode({
  code,
  language = "tsx",
  title,
  highlightLines,
  showLineNumbers = false,
  collapsible = false,
  collapsedHeight,
  tone = "band",
  className,
}: AirCodeProps) {
  const html = await highlightCode(code, { language, highlightLines })
  return (
    <AirCodeShell
      html={html}
      code={code}
      title={title}
      language={language}
      showLineNumbers={showLineNumbers}
      collapsible={collapsible}
      collapsedHeight={collapsedHeight}
      tone={tone}
      className={className}
    />
  )
}
