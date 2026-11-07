"use client"

import * as React from "react"

import { RunCopy } from "./copy"

/*
 * Once the page's own header has scrolled away, a thin bar keeps the name and
 * the two things a reader came to copy within reach. It watches a sentinel at
 * the bottom of the header rather than the scroll position, so it is right at
 * any header height.
 */
export function LocalBar({
  sentinel,
  title,
  category,
  install,
  prompt,
}: {
  sentinel: string
  title: string
  category: string
  install: string
  prompt: string
}) {
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const node = document.getElementById(sentinel)
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0)
      },
      { rootMargin: "-56px 0px 0px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [sentinel])

  return (
    <div
      className="run-localbar backdrop-blur-[20px] backdrop-saturate-[1.7]"
      data-shown={shown}
      aria-hidden={!shown}
      inert={!shown || undefined}
    >
      <div className="run-container flex h-full items-center gap-3">
        <p className="flex min-w-0 flex-1 items-baseline gap-2.5">
          <span className="truncate text-[14px] font-semibold tracking-[-0.01em]">
            {title}
          </span>
          <span className="truncate text-[13px] text-[#77777c] max-sm:hidden">
            {category}
          </span>
        </p>
        <RunCopy
          value={install}
          label="Copy install"
          size="sm"
          variant="ghost"
          toastMessage="Install command copied"
          className="max-sm:hidden"
        />
        <RunCopy
          value={prompt}
          label="Copy prompt"
          size="sm"
          variant="primary"
          icon="prompt"
          toastMessage={`${title} prompt copied`}
        />
      </div>
    </div>
  )
}
