import { CopyPromptButton } from "@/components/site/copy-prompt-button"
import { cn } from "@/lib/utils"

/**
 * Real lines from a real prompt. The generated brief opens with boilerplate
 * every component shares, so the excerpt is cut from the parts that are this
 * component's own — the ask, its behaviour, its props, its keys, its file —
 * and the elided stretches are marked as such.
 */
function excerpt(prompt: string): string[] {
  const lines = prompt.split("\n")
  const clip = (line: string) =>
    line.length > 190 ? `${line.slice(0, line.lastIndexOf(" ", 180))} …` : line
  const from = (prefix: string, count: number) => {
    const start = lines.findIndex((line) => line.startsWith(prefix))
    return start === -1 ? [] : lines.slice(start, start + count).map(clip)
  }
  return [
    lines[0] ?? "",
    "…",
    ...from("Component behavior:", 2),
    "",
    ...from("Supported props:", 5),
    "…",
    ...from("Keyboard interactions:", 3),
    "…",
    ...from("File: ", 1),
  ]
}

export function PromptPanel({
  prompt,
  slug,
  title,
  className,
}: {
  prompt: string
  slug: string
  title: string
  className?: string
}) {
  const lines = excerpt(prompt)
  const lineCount = prompt.split("\n").length
  const size = (new TextEncoder().encode(prompt).length / 1024).toFixed(1)

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        className
      )}
    >
      <figcaption className="flex items-center gap-3 border-b border-border py-2 pr-2 pl-4">
        <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-foreground">
          {slug}.prompt.md
        </span>
        <span className="hidden text-xs text-muted-foreground tabular-nums sm:inline">
          {lineCount} lines · {size} KB
        </span>
        <CopyPromptButton prompt={prompt} componentName={title} />
      </figcaption>
      <div className="relative max-h-[22rem] overflow-hidden bg-[var(--code-bg)]">
        <pre className="px-4 py-4 text-[12.5px] leading-[1.7] whitespace-pre-wrap">
          {lines.map((line, index) => {
            const heading = /^[A-Z][\w ]+:$/.test(line)
            const gap = line === "…"
            return (
              <span
                key={index}
                className={cn(
                  "block min-h-[1.7em]",
                  index === 0 && "text-foreground",
                  heading && "font-medium text-foreground",
                  gap && "text-border-strong",
                  !heading && !gap && index !== 0 && "text-muted-foreground"
                )}
              >
                {line}
              </span>
            )
          })}
        </pre>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--code-bg)] to-transparent"
        />
      </div>
    </figure>
  )
}
