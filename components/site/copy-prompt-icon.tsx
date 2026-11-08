"use client"

import * as React from "react"
import { toast } from "sonner"

import { PromptCopyMark } from "@/components/site/copy-mark"
import { copyToClipboard } from "@/lib/clipboard"
import { cn } from "@/lib/utils"

/*
 * Copy prompt from a card.
 *
 * A catalog of hundreds of cards cannot carry hundreds of prompts — each one
 * embeds the full component source. The brief is served as a static text file
 * per component instead (`/prompts/<slug>`, prerendered from the
 * same `buildComponentPrompt` the component page uses), fetched the moment a
 * pointer or focus reaches the button and cached for the session, so by the
 * time the click lands it is usually already here.
 */

const cache = new Map<string, Promise<string>>()

export function loadPrompt(slug: string): Promise<string> {
  let pending = cache.get(slug)
  if (!pending) {
    pending = fetch(`/prompts/${slug}`).then((response) => {
      if (!response.ok) throw new Error(`Prompt for ${slug} is unavailable`)
      return response.text()
    })
    pending.catch(() => cache.delete(slug))
    cache.set(slug, pending)
  }
  return pending
}

async function writePrompt(slug: string) {
  const text = loadPrompt(slug)
  /*
   * Safari only honours a clipboard write made inside the click; handing it a
   * promise of the blob keeps the write inside the gesture even when the
   * fetch has not finished yet.
   */
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": text.then((value) => new Blob([value], { type: "text/plain" })),
        }),
      ])
      return
    } catch {
      // Fall through to the plain path.
    }
  }
  await copyToClipboard(await text)
}

export function CopyPromptIcon({
  slug,
  title,
  className,
  label = "Copy prompt",
}: {
  slug: string
  title: string
  className?: string
  label?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  async function onClick(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    try {
      await writePrompt(slug)
      setCopied(true)
      toast.success(`${title} prompt copied`)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error("Could not copy the prompt.")
    }
  }

  const warm = () => {
    void loadPrompt(slug).catch(() => {})
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={warm}
      onFocus={warm}
      aria-label={`${label} for ${title}`}
      className={cn(
        "relative z-10 inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-[0.75rem] font-medium",
        "border border-white/10 bg-black/55 text-white/85 shadow-[0_2px_10px_rgb(0_0_0/0.4)] backdrop-blur-md",
        "transition-colors duration-150 hover:bg-black/75 hover:text-white",
        "[&_svg]:size-3.5",
        className
      )}
    >
      <PromptCopyMark copied={copied} />
      <span aria-hidden="true">{copied ? "Copied" : label}</span>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </button>
  )
}
