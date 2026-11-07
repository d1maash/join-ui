import type * as React from "react"

/**
 * Registry copy marks identifiers with backticks — `aria-current="step"`. This
 * sets those runs in mono and leaves the rest as prose.
 */
export function ticks(text: string): React.ReactNode {
  const parts = text.split(/`([^`]+)`/g)
  if (parts.length === 1) return text
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <code
        key={index}
        className="rounded-[6px] bg-[#f5f5f7] px-[0.3em] py-[0.1em] font-mono text-[0.86em] text-[#1d1d1f]"
      >
        {part}
      </code>
    ) : (
      part
    )
  )
}
