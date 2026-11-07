import { highlightCode } from "@/lib/highlight"
import { cn } from "@/lib/utils"

import { RunCodeShell } from "./code-shell"

/**
 * A highlighted listing, rendered on the server. The markup ships as static
 * HTML; only the copy control and the expand toggle reach the browser.
 */
export async function RunCode({
  code,
  language = "tsx",
  title,
  numbers = false,
  maxHeight,
  bare = false,
  lights = false,
  className,
}: {
  code: string
  language?: string
  title?: string
  numbers?: boolean
  /** Clips long listings behind an explicit "Show all" control. */
  maxHeight?: number
  /** No frame — for a listing that sits inside a window that already has one. */
  bare?: boolean
  /** Window chrome on the head: traffic lights and a centred file name. */
  lights?: boolean
  className?: string
}) {
  const html = await highlightCode(code, { language })
  return (
    <RunCodeShell
      html={html}
      code={code}
      title={title}
      numbers={numbers}
      maxHeight={maxHeight}
      bare={bare}
      lights={lights}
      className={cn(className)}
    />
  )
}
