"use client"

import * as React from "react"
import Link from "next/link"
import { Maximize2, RotateCcw } from "lucide-react"

import { renderPreview } from "@/components/previews/registry"

/** Asks the preview box on the page to switch to its Code tab. */
export const SHOW_CODE_EVENT = "ix:show-code"

/**
 * The component page's main cell: the live preview, or its source, on one
 * stage. Replay remounts the demo, so an entrance can be watched again.
 */
export function IxPreviewBox({
  slug,
  code,
  title,
}: {
  slug: string
  title: string
  code: React.ReactNode
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview")
  const [take, setTake] = React.useState(0)
  const root = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const show = () => {
      setTab("code")
      root.current?.scrollIntoView({ block: "start" })
    }
    window.addEventListener(SHOW_CODE_EVENT, show)
    return () => window.removeEventListener(SHOW_CODE_EVENT, show)
  }, [])

  const demo = renderPreview(slug)
  const tabs = [
    { id: "preview" as const, label: "Preview" },
    { id: "code" as const, label: "Code" },
  ]

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    event.preventDefault()
    const next = tab === "preview" ? "code" : "preview"
    setTab(next)
    document.getElementById(`ix-preview-tab-${next}`)?.focus()
  }

  return (
    <div ref={root} id="preview" className="ix-rule-b scroll-mt-14">
      <div className="flex h-11 items-stretch border-b border-[var(--ix-line)] pr-2 pl-1.5 md:pl-4">
        <div role="tablist" aria-label={`${title} views`} className="flex" onKeyDown={onKeyDown}>
          {tabs.map((entry) => (
            <button
              key={entry.id}
              id={`ix-preview-tab-${entry.id}`}
              type="button"
              role="tab"
              aria-selected={tab === entry.id}
              aria-controls={`ix-preview-panel-${entry.id}`}
              tabIndex={tab === entry.id ? 0 : -1}
              onClick={() => setTab(entry.id)}
              className="ix-tab"
            >
              {entry.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          {tab === "preview" ? (
            <button
              type="button"
              onClick={() => setTake((value) => value + 1)}
              className="ix-btn ix-btn-ghost !h-8 !px-2.5 !text-[0.75rem]"
            >
              <RotateCcw aria-hidden="true" />
              Replay
            </button>
          ) : null}
          <Link
            href={`/preview/${slug}`}
            className="ix-btn ix-btn-ghost !h-8 !px-2.5 !text-[0.75rem]"
          >
            <Maximize2 aria-hidden="true" />
            <span className="hidden sm:inline">Full screen</span>
            <span className="sr-only sm:hidden">Full screen</span>
          </Link>
        </div>
      </div>

      <div
        id="ix-preview-panel-preview"
        role="tabpanel"
        aria-labelledby="ix-preview-tab-preview"
        hidden={tab !== "preview"}
        className="relative bg-[radial-gradient(rgb(255_255_255/0.055)_1px,transparent_1px)] [background-size:18px_18px]"
      >
        <div
          key={take}
          className="flex min-h-[30rem] w-full items-center justify-center px-4 py-10 text-[var(--foreground)] md:px-10 md:py-14"
        >
          {demo ?? (
            <p className="ix-mono ix-fg-3 max-w-sm text-center">
              No demo is registered for {slug} yet.
            </p>
          )}
        </div>
      </div>

      <div
        id="ix-preview-panel-code"
        role="tabpanel"
        aria-labelledby="ix-preview-tab-code"
        hidden={tab !== "code"}
      >
        {code}
      </div>
    </div>
  )
}

/** A button that switches the page's preview box to Code and scrolls to it. */
export function IxShowCodeButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(SHOW_CODE_EVENT))}
      className="ix-btn"
    >
      {children}
    </button>
  )
}
