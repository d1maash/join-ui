"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  ClipboardCopyMark,
  CopyFace,
  PromptCopyMark,
} from "@/components/site/copy-mark"
import { copyToClipboard } from "@/lib/clipboard"

import { pill } from "./ui"

/**
 * Copy, as a pill in the variant's own tones. The marks and the two-face
 * label are the shared ones — the gesture is the same everywhere on the site;
 * only the material changes.
 */
export function GlassCopy({
  value,
  kind = "code",
  idle,
  done = "Copied",
  toastMessage,
  tone = "glass",
  size = "md",
  className,
}: {
  value: string
  kind?: "prompt" | "code"
  idle: string
  done?: string
  toastMessage?: string
  tone?: "primary" | "glass" | "plain"
  size?: "lg" | "md" | "sm"
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  async function onCopy() {
    try {
      await copyToClipboard(value)
      setCopied(true)
      if (toastMessage) toast.success(toastMessage)
      if (timeout.current) clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy to the clipboard.")
    }
  }

  return (
    <button type="button" onClick={onCopy} className={pill(tone, size, className)}>
      {kind === "prompt" ? (
        <PromptCopyMark copied={copied} />
      ) : (
        <ClipboardCopyMark copied={copied} />
      )}
      <CopyFace copied={copied} idle={idle} done={done} />
      <span aria-live="polite" className="sr-only">
        {copied ? done : ""}
      </span>
    </button>
  )
}
