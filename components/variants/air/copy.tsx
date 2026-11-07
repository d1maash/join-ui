"use client"

import * as React from "react"
import { toast } from "sonner"

import { ClipboardCopyMark, CopyFace, PromptCopyMark } from "@/components/site/copy-mark"
import { copyToClipboard } from "@/lib/clipboard"
import { cn } from "@/lib/utils"

import { pillClass, type PillSize, type PillVariant } from "./pill"

function useCopy(value: string, onCopied?: () => void, failure = "Could not copy to the clipboard.") {
  const [copied, setCopied] = React.useState(false)
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current)
    },
    []
  )

  const copy = React.useCallback(async () => {
    try {
      await copyToClipboard(value)
      setCopied(true)
      onCopied?.()
      if (timeout.current) clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(failure)
    }
  }, [value, onCopied, failure])

  return [copied, copy] as const
}

/** A copy control as an Apple pill, or as a bare round icon button. */
export function AirCopy({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  toastMessage,
  variant = "neutral",
  size = "sm",
  iconOnly = false,
  className,
}: {
  value: string
  label?: string
  copiedLabel?: string
  toastMessage?: string
  variant?: PillVariant
  size?: PillSize
  iconOnly?: boolean
  className?: string
}) {
  const onCopied = React.useCallback(() => {
    if (toastMessage) toast.success(toastMessage)
  }, [toastMessage])
  const [copied, copy] = useCopy(value, onCopied)

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? copiedLabel : label}
        className={cn(
          "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6e6e73] transition-colors",
          "hover:bg-black/[0.05] hover:text-[#1d1d1f]",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3]",
          "[&_svg]:size-4",
          className
        )}
      >
        <ClipboardCopyMark copied={copied} />
        <span aria-live="polite" className="sr-only">
          {copied ? copiedLabel : ""}
        </span>
      </button>
    )
  }

  return (
    <button type="button" onClick={copy} className={cn(pillClass(variant, size), className)}>
      <ClipboardCopyMark copied={copied} />
      <CopyFace copied={copied} idle={label} done={copiedLabel} />
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </button>
  )
}

/** The agent brief, copied in one press. */
export function AirCopyPrompt({
  prompt,
  componentName,
  variant = "primary",
  size = "md",
  className,
}: {
  prompt: string
  componentName: string
  variant?: PillVariant
  size?: PillSize
  className?: string
}) {
  const onCopied = React.useCallback(
    () => toast.success(`${componentName} prompt copied`),
    [componentName]
  )
  const [copied, copy] = useCopy(prompt, onCopied, "Could not copy the prompt.")

  return (
    <button type="button" onClick={copy} className={cn(pillClass(variant, size), className)}>
      <PromptCopyMark copied={copied} />
      <CopyFace copied={copied} idle="Copy prompt" done="Copied" />
      <span aria-live="polite" className="sr-only">
        {copied ? "Prompt copied" : ""}
      </span>
    </button>
  )
}
